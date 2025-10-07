import { StorageProvider } from './storageProvider';

/**
 * IndexedDB Storage Provider
 * For use in client-side code (browser) - better than localStorage for large data
 */
export class IndexedDBStorageProvider implements StorageProvider {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string = 'ATSResumeCache', storeName: string = 'cache') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * Initialize IndexedDB connection
   */
  private async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(`📦 IndexedDB initialized: ${this.dbName}`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
          console.log(`📁 Created object store: ${this.storeName}`);
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Read data synchronously (with cache)
   * Note: First call may return null if DB not initialized
   */
  read<T>(key: string): T | null {
    // Synchronous read not ideal for IndexedDB
    // This is a limitation of the interface
    console.warn('⚠️  Synchronous read from IndexedDB - use readAsync instead');
    return null;
  }

  /**
   * Async read - preferred method for IndexedDB
   */
  async readAsync<T>(key: string): Promise<T | null> {
    try {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result as T || null);
        };

        request.onerror = () => {
          reject(new Error('Failed to read from IndexedDB'));
        };
      });
    } catch (error) {
      console.warn(`⚠️  Error reading from IndexedDB: ${error}`);
      return null;
    }
  }

  /**
   * Write data synchronously (queued)
   */
  write<T>(key: string, data: T): void {
    // Queue async write
    this.writeAsync(key, data).catch(err => {
      console.warn(`⚠️  Error writing to IndexedDB: ${err}`);
    });
  }

  /**
   * Async write - preferred method for IndexedDB
   */
  async writeAsync<T>(key: string, data: T): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(data, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to write to IndexedDB'));
        };
      });
    } catch (error) {
      console.warn(`⚠️  Error writing to IndexedDB: ${error}`);
    }
  }

  /**
   * Delete data
   */
  delete(key: string): boolean {
    this.deleteAsync(key).catch(err => {
      console.warn(`⚠️  Error deleting from IndexedDB: ${err}`);
    });
    return true;
  }

  /**
   * Async delete - preferred method
   */
  async deleteAsync(key: string): Promise<boolean> {
    try {
      await this.init();
      if (!this.db) return false;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(new Error('Failed to delete from IndexedDB'));
        };
      });
    } catch (error) {
      console.warn(`⚠️  Error deleting from IndexedDB: ${error}`);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  exists(key: string): boolean {
    console.warn('⚠️  Synchronous exists check from IndexedDB - use existsAsync instead');
    return false;
  }

  /**
   * Async exists check - preferred method
   */
  async existsAsync(key: string): Promise<boolean> {
    const data = await this.readAsync(key);
    return data !== null;
  }

  /**
   * List all keys
   */
  listKeys(): string[] {
    console.warn('⚠️  Synchronous listKeys from IndexedDB - use listKeysAsync instead');
    return [];
  }

  /**
   * Async list keys - preferred method
   */
  async listKeysAsync(): Promise<string[]> {
    try {
      await this.init();
      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          reject(new Error('Failed to list keys from IndexedDB'));
        };
      });
    } catch (error) {
      console.warn(`⚠️  Error listing IndexedDB keys: ${error}`);
      return [];
    }
  }

  getType(): 'localstorage' {
    return 'localstorage'; // Keep as 'localstorage' for compatibility
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<number> {
    try {
      await this.init();
      if (!this.db) return 0;

      const keys = await this.listKeysAsync();

      await Promise.all(keys.map(key => this.deleteAsync(key)));

      return keys.length;
    } catch (error) {
      console.warn(`⚠️  Error clearing IndexedDB: ${error}`);
      return 0;
    }
  }

  /**
   * Get total size estimate
   */
  async getTotalSize(): Promise<number> {
    try {
      const keys = await this.listKeysAsync();
      let totalSize = 0;

      for (const key of keys) {
        const data = await this.readAsync(key);
        if (data) {
          totalSize += new Blob([JSON.stringify(data)]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.warn(`⚠️  Error calculating size: ${error}`);
      return 0;
    }
  }
}

