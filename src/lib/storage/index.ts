import { MCPServer, Message, MCPSettings } from '../../types';

export class MCPStorage {
  private static instance: MCPStorage;
  private db: IDBDatabase | null = null;
  private dbName = 'mcp-storage';
  private storeNames = {
    servers: 'servers',
    messages: 'messages',
    settings: 'settings'
  };

  private constructor() {
    this.initDB();
  }

  static getInstance(): MCPStorage {
    if (!MCPStorage.instance) {
      MCPStorage.instance = new MCPStorage();
    }
    return MCPStorage.instance;
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, 2); // Version 2 for new features

    request.onerror = (event) => {
      console.error('Database initialization failed:', (event.target as IDBOpenDBRequest).error);
      throw new Error('Failed to initialize database');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create servers store with indexes
      const serversStore = db.createObjectStore(this.storeNames.servers, { 
        keyPath: 'id',
        autoIncrement: true
      });
      serversStore.createIndex('name', 'name', { unique: false });
      serversStore.createIndex('url', 'url', { unique: false });
      serversStore.createIndex('lastConnected', 'lastConnected', { unique: false });
      
      // Create messages store with indexes
      const messagesStore = db.createObjectStore(this.storeNames.messages, { 
        keyPath: 'id',
        autoIncrement: true
      });
      messagesStore.createIndex('serverId', 'serverId', { unique: false });
      messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      messagesStore.createIndex('type', 'type', { unique: false });
      
      // Create settings store
      const settingsStore = db.createObjectStore(this.storeNames.settings, { 
        keyPath: 'id',
        autoIncrement: true
      });
      settingsStore.createIndex('id', 'id', { unique: true });
      
      // Create cache store
      const cacheStore = db.createObjectStore('cache', { 
        keyPath: 'id',
        autoIncrement: true
      });
      cacheStore.createIndex('type', 'type', { unique: false });
      cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.db.onversionchange = () => {
        console.log('Database version changed, closing connection');
        this.db.close();
      };
    };

    request.onerror = (event) => {
      console.error('Database initialization failed:', (event.target as IDBOpenDBRequest).error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create servers store
      const serversStore = db.createObjectStore(this.storeNames.servers, { keyPath: 'id' });
      serversStore.createIndex('name', 'name', { unique: false });
      serversStore.createIndex('url', 'url', { unique: false });
      
      // Create messages store
      const messagesStore = db.createObjectStore(this.storeNames.messages, { keyPath: 'id' });
      messagesStore.createIndex('serverId', 'serverId', { unique: false });
      messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      
      // Create settings store
      db.createObjectStore(this.storeNames.settings, { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore | null {
    if (!this.db) return null;
    try {
      const transaction = this.db.transaction(storeName, mode);
      transaction.oncomplete = () => {
        console.log(`Transaction for ${storeName} completed`);
      };
      transaction.onerror = (event) => {
        console.error(`Transaction error for ${storeName}:`, event.target?.error);
      };
      return transaction.objectStore(storeName);
    } catch (error) {
      console.error(`Failed to get store ${storeName}:`, error);
      return null;
    }
  }

  // Servers
  async getServers(): Promise<MCPServer[]> {
    const cacheKey = 'servers_list';
    const cached = await this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.servers, 'readonly');
      if (!store) return reject('Database not initialized');
      
      const request = store.getAll();
      request.onsuccess = () => {
        const servers = request.result;
        this.addToCache(cacheKey, servers);
        resolve(servers);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addServer(server: MCPServer): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.servers, 'readwrite');
      if (!store) return reject('Database not initialized');
      
      const request = store.add(server);
      request.onsuccess = () => {
        this.removeFromCache('servers_list');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Messages
  async addMessage(message: Message): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.messages);
      if (!store) return reject('Database not initialized');
      
      const request = store.add(message);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMessagesByServer(serverId: string, limit: number = 100): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.messages, 'readonly');
      if (!store) return reject('Database not initialized');
      
      const index = store.index('serverId');
      const request = index.getAll(serverId, limit);
      request.onsuccess = () => {
        const messages = request.result;
        // Sort messages by timestamp in descending order
        messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  async getSettings(): Promise<MCPSettings | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.settings);
      if (!store) return reject('Database not initialized');
      
      const request = store.get('default');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSettings(settings: MCPSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(this.storeNames.settings);
      if (!store) return reject('Database not initialized');
      
      const request = store.put(settings);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
