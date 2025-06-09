import { MCPServer, Message, MCPSettings } from '../../types';

export interface IDBResult {
  success: boolean;
  data?: any;
  error?: Error;
}

export interface IDBTransaction {
  storeName: string;
  mode: IDBTransactionMode;
  operations: Array<{
    type: 'add' | 'put' | 'get' | 'delete';
    data?: any;
    key?: string | number;
  }>;
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  totalSize: number;
  maxCapacity: number;
}

export interface CacheConfig {
  maxCapacity: number;
  cleanupInterval: number;
  defaultTTL: number;
}

export interface CacheItem {
  id: string;
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}
