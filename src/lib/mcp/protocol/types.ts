// Core Message Types
export type MCPMessageType = 'command' | 'response' | 'error' | 'event';
export type MCPCommandName = string;
export type MCPCommandParams = Record<string, any>;
export type MCPCommandData = Record<string, any>;

export interface MCPMessage {
  type: MCPMessageType;
  id?: string;
  name?: MCPCommandName;
  command?: MCPCommandName;
  params?: MCPCommandParams;
  data?: MCPCommandData;
  error?: MCPError;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Connection States
export type MCPConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

export interface MCPConnectionState {
  status: MCPConnectionStatus;
  lastHeartbeat: Date;
  retryCount: number;
  lastError?: MCPError;
  messageQueue: MCPMessage[];
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Error Types
export type MCPErrorType =
  | 'protocol'
  | 'connection'
  | 'command'
  | 'validation'
  | 'timeout'
  | 'authentication'
  | 'authorization';

export interface MCPError extends Error {
  code: number;
  type: MCPErrorType;
  details?: any;
  cause?: Error | string;
  timestamp: string;
}

// Error Handling
export type ErrorStrategyType = 'retry' | 'fallback' | 'ignore';

export interface ErrorStrategy {
  type: ErrorStrategyType;
  maxAttempts: number;
  delay: number;
  conditions: ErrorCondition[];
}

export interface ErrorCondition {
  code: number;
  message: string;
  type?: MCPErrorType;
  handler: (error: MCPError) => void;
}

// Metrics
export interface MCPMetrics {
  connectionTime: number;
  messageLatency: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
  totalMessages: number;
  failedMessages: number;
  retryCount: number;
}

// Message Correlation
export interface MessageCorrelation {
  id: string;
  timestamp: Date;
  timeout: NodeJS.Timeout;
  resolve: (value: MCPMessage) => void;
  reject: (reason: Error) => void;
  command: MCPCommandName;
  params: MCPCommandParams;
}

// Command Handling
export interface CommandHandler {
  name: MCPCommandName;
  handle(message: MCPMessage): Promise<MCPMessage>;
  validate(message: MCPMessage): boolean;
  getTimeout(): number;
  onError?: (error: MCPError) => void;
}

// Configuration
export interface MCPConfig {
  maxConnections: number;
  reconnectDelay: number;
  maxRetries: number;
  timeout: number;
  errorStrategy: ErrorStrategy;
  metricsEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Event Types
export type MCPEventType =
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'message'
  | 'command'
  | 'response'
  | 'timeout';

export interface MCPEvent {
  type: MCPEventType;
  timestamp: string;
  data: any;
  error?: MCPError;
  message?: MCPMessage;
}

// Constants
export const MCP_PROTOCOL_VERSION = '2.0';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RECONNECT_DELAY = 5000;
export const MAX_RETRIES = 3;
export const MAX_CONNECTIONS = 10;
