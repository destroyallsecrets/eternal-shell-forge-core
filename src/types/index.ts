export interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastConnected?: Date;
}

export interface Message {
  id: string;
  serverId: string;
  type: 'request' | 'response' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export interface MCPSettings {
  id: string;
  theme: string;
  messageHistoryLimit: number;
  autoConnect: boolean;
  retryDelay: number;
  maxRetries: number;
}
