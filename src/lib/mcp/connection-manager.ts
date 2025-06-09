import { MCPServer, Message } from '@/types';
import { MCPStorage } from '../storage';

export class MCPConnectionManager {
  private connections: Map<string, WebSocket> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private connectionPool: Map<string, Promise<WebSocket>> = new Map();
  private storage: MCPStorage;
  private maxConnections: number;
  private retryDelay: number;
  private maxRetries: number;
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private messageQueue: Map<string, Message[]> = new Map();
  private isInitialized = false;

  constructor({
    maxConnections = 10,
    retryDelay = 5000,
    maxRetries = 3
  }: {
    maxConnections?: number;
    retryDelay?: number;
    maxRetries?: number;
  }) {
    this.storage = MCPStorage.getInstance();
    this.maxConnections = maxConnections;
    this.retryDelay = retryDelay;
    this.maxRetries = maxRetries;
    
    // Initialize connection pool
    this.connectionPool = new Map();
    this.messageQueue = new Map();
  }

  async connect(server: MCPServer): Promise<void> {
    if (this.connections.size >= this.maxConnections) {
      throw new Error('Maximum number of connections reached');
    }

    const url = server.url;
    const ws = new WebSocket(url);
    
    // Store connection in pool
    this.connectionPool.set(server.id, Promise.resolve(ws));
    
    ws.onopen = () => {
      this.connections.set(server.id, ws);
      this.retryAttempts.set(server.id, 0);
      
      // Update server status
      this.storage.addServer({
        ...server,
        status: 'connected',
        lastConnected: new Date()
      });
      
      // Process any queued messages
      const queue = this.messageQueue.get(server.id) || [];
      if (queue.length > 0) {
        queue.forEach(msg => this.sendMessage(server.id, msg.content));
        this.messageQueue.delete(server.id);
      }
    };

    ws.onclose = (event) => {
      console.log(`Connection closed for ${server.name} (code: ${event.code}, reason: ${event.reason})`);
      this.connections.delete(server.id);
      this.handleReconnect(server);
    };

    ws.onerror = (error) => {
      console.error(`Connection error for ${server.name}:`, error);
      this.handleReconnect(server);
    };

    ws.onmessage = (event) => {
      try {
        const message: Message = {
          id: Date.now().toString(),
          serverId: server.id,
          type: 'response',
          content: event.data.toString(),
          timestamp: new Date()
        };
        
        // Store message with proper error handling
        this.storage.addMessage(message)
          .catch(error => console.error('Failed to store message:', error));
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    };
  }

  private async handleReconnect(server: MCPServer): Promise<void> {
    const attempts = this.retryAttempts.get(server.id) || 0;
    if (attempts >= this.maxRetries) {
      this.storage.addServer({
        ...server,
        status: 'disconnected'
      });
      return;
    }

    // Clear any existing timeout
    const existingTimeout = this.reconnectTimeouts.get(server.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate exponential backoff
    const delay = this.retryDelay * Math.pow(2, attempts);
    
    this.reconnectTimeouts.set(server.id, setTimeout(async () => {
      this.retryAttempts.set(server.id, attempts + 1);
      
      try {
        await this.connect(server);
      } catch (error) {
        console.error(`Failed to reconnect to ${server.name}:`, error);
      }
    }, delay));
  }

  disconnect(serverId: string, servers: MCPServer[]): void {
    const ws = this.connections.get(serverId);
    if (ws) {
      ws.close();
      this.connections.delete(serverId);
      this.retryAttempts.delete(serverId);
      
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        console.error('Server not found:', serverId);
        return;
      }

      this.storage.addServer({
        ...server,
        status: 'disconnected'
      }).catch(error => {
        console.error('Failed to update server status:', error);
      });
    }
  }

  sendMessage(serverId: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = this.connections.get(serverId);
      
      if (!ws) {
        // Queue message if no connection exists
        const queue = this.messageQueue.get(serverId) || [];
        queue.push({
          id: Date.now().toString(),
          serverId,
          type: 'request',
          content,
          timestamp: new Date()
        });
        this.messageQueue.set(serverId, queue);
        reject(new Error('No active connection'));
        return;
      }

      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(content);
          
          const message: Message = {
            id: Date.now().toString(),
            serverId,
            type: 'request',
            content,
            timestamp: new Date()
          };
          
          this.storage.addMessage(message)
            .then(resolve)
            .catch(error => {
              console.error('Failed to store message:', error);
              reject(error);
            });
        } catch (error) {
          console.error('Failed to send message:', error);
          reject(error);
        }
      } else {
        // Queue message if connection is not open
        const queue = this.messageQueue.get(serverId) || [];
        queue.push({
          id: Date.now().toString(),
          serverId,
          type: 'request',
          content,
          timestamp: new Date()
        });
        this.messageQueue.set(serverId, queue);
        reject(new Error('Connection not open'));
      }
    });
  }

  async initialize(): Promise<void> {
    const servers = await this.storage.getServers();
    for (const server of servers) {
      if (server.status === 'connected') {
        try {
          await this.connect(server);
        } catch (error) {
          console.error(`Failed to initialize connection for ${server.name}:`, error);
        }
      }
    }
  }
}
