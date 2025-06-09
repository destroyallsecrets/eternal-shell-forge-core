import { MCPServer, Message, MCPSettings } from '../../types';
import { IDBResult, IDBTransaction, CacheStats, CacheConfig, CacheItem } from './types';

export class MCPStorage {
  private static instance: MCPStorage;
  private db: IDBDatabase | null = null;
  private dbName = 'mcp-storage';
  private storeNames = {
    servers: 'servers',
    messages: 'messages',
    settings: 'settings'
  };
  private cacheStats: CacheStats = {
    hitCount: 0,
    missCount: 0,
    totalSize: 0,
    maxCapacity: 1000
  };
  private cacheConfig: CacheConfig = {
    maxCapacity: 1000,
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    defaultTTL: 60 * 1000 // 1 minute
  };

  static getInstance(): MCPStorage {
    if (!MCPStorage.instance) {
      MCPStorage.instance = new MCPStorage();
    }
    return MCPStorage.instance;
  }

  getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  private constructor() {
    this.initDB();
    this.setupCacheCleanup();
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
        console.error(`Transaction error for ${storeName}:`, (event.target as any)?.error);
      };
      return transaction.objectStore(storeName);
    } catch (error) {
      console.error(`Failed to get store ${storeName}:`, error);
      return null;
    }
  }

  private async batchOperation(transaction: IDBTransaction): Promise<IDBResult[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(transaction.storeName, transaction.mode);
      if (!store) {
        reject({ success: false, error: new Error('Database not initialized') });
        return;
      }

      const results: IDBResult[] = [];
      const operations = transaction.operations;

      const requests: IDBRequest[] = [];
      operations.forEach(op => {
        let request: IDBRequest;
        switch (op.type) {
          case 'add':
            request = store.add(op.data);
            break;
          case 'put':
            request = store.put(op.data);
            break;
          case 'get':
            request = store.get(op.key);
            break;
          case 'delete':
            request = store.delete(op.key);
            break;
        }
        requests.push(request);
      });

      // Wait for all requests to complete
      let completedCount = 0;
      requests.forEach((request, index) => {
        request.onsuccess = () => {
          results[index] = { success: true, data: request.result };
          if (++completedCount === requests.length) {
            resolve(results);
          }
        };
        request.onerror = () => {
          results[index] = { success: false, error: request.error };
          if (++completedCount === requests.length) {
            resolve(results);
          }
        };
      });
    });
  }

  // Cache methods
  private async addToCache(key: string, value: any, ttl: number = 60000): Promise<void> {
    return new Promise((resolve, reject) => {
      const cacheStore = this.getStore('cache', 'readwrite');
      if (!cacheStore) {
        reject('Database not initialized');
        return;
      }

      // Check if cache is at capacity
      if (this.cacheStats.totalSize >= this.cacheConfig.maxCapacity) {
        this.cleanupCache().catch(error => console.error('Cache cleanup failed:', error));
      }

      const cacheItem: CacheItem = {
        id: Date.now().toString(),
        key,
        value,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccess: Date.now()
      };

      const request = cacheStore.add(cacheItem);
      request.onsuccess = () => {
        this.cacheStats.totalSize++;
        resolve();
      };
      request.onerror = (event) => reject((event.target as any)?.error);
    });
  }

  private async getFromCache(key: string): Promise<any | null> {
    return new Promise((resolve) => {
      const cacheStore = this.getStore('cache');
      if (!cacheStore) {
        resolve(null);
        return;
      }

      const request = cacheStore.index('key').getAll(key);
      request.onsuccess = (event) => {
        const items = (event.target as any)?.result;
        if (!items?.length) {
          resolve(null);
          return;
        }

        // Get the most recent item
        const item = items[0];
        // Check if item is expired
        if (Date.now() - item.timestamp > item.ttl) {
          this.removeFromCache(key);
          resolve(null);
          return;
        }
        resolve(item.value);
      };
      request.onerror = (event) => {
        console.error('Failed to get from cache:', (event.target as any)?.error);
        resolve(null);
      };
    });
  }

  private async removeFromCache(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cacheStore = this.getStore('cache', 'readwrite');
      if (!cacheStore) {
        reject('Database not initialized');
        return;
      }

      const request = cacheStore.index('key').getAll(key);
      request.onsuccess = (event) => {
        const items = (event.target as any)?.result;
        if (!items?.length) {
          resolve();
          return;
        }

        // Delete all items with this key
        items.forEach(item => {
          cacheStore.delete(item.id);
        });
        resolve();
      };
      request.onerror = (event) => reject((event.target as any)?.error);
    });
  }

  private async cleanupCache(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cacheStore = this.getStore('cache', 'readwrite');
      if (!cacheStore) {
        reject('Database not initialized');
        return;
      }

      const request = cacheStore.index('timestamp').getAll();
      request.onsuccess = (event) => {
        const items = (event.target as any)?.result;
        if (!items?.length) {
          resolve();
          return;
        }

        // Delete expired items
        const now = Date.now();
        items.forEach(item => {
          if (now - item.timestamp > item.ttl) {
            cacheStore.delete(item.id);
          }
        });
        resolve();
      };
      request.onerror = (event) => reject((event.target as any)?.error);
    });
  }

  // Cache cleanup interval (every 5 minutes)
  private setupCacheCleanup() {
    setInterval(() => {
      this.cleanupCache().catch(error => {
        console.error('Cache cleanup failed:', error);
      });
    }, 5 * 60 * 1000);
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
