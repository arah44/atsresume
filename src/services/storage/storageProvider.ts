/**
 * Async-only storage provider interface
 * Used for server-side storage operations
 */
export interface AsyncStorageProvider {
  /**
   * Read data from storage (async)
   */
  readAsync<T>(key: string): Promise<T | null>;

  /**
   * Write data to storage (async)
   */
  writeAsync<T>(key: string, data: T): Promise<void>;

  /**
   * Delete data from storage (async)
   */
  deleteAsync(key: string): Promise<boolean>;

  /**
   * Check if key exists in storage (async)
   */
  existsAsync(key: string): Promise<boolean>;

  /**
   * List all keys in storage (async)
   */
  listKeysAsync(): Promise<string[]>;

  /**
   * Clear all data from storage (async)
   */
  clearAll(): Promise<number>;

  /**
   * Close storage connection (async)
   */
  close?(): Promise<void>;
}

/**
 * Generic storage service interface with convenience methods
 */
export interface StorageService {
  /**
   * Read data from storage
   */
  readData<T>(key: string): Promise<T | null>;

  /**
   * Write data to storage
   */
  writeData<T>(key: string, data: T): Promise<void>;

  /**
   * Delete data from storage
   */
  deleteData(key: string): Promise<boolean>;

  /**
   * Check if key exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * List all keys in storage
   */
  listKeys(): Promise<string[]>;

  /**
   * Clear all data from storage
   */
  clearAll(): Promise<number>;
}

