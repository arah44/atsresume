/**
 * Async Storage Provider Interface
 * MongoDB-only implementation with async operations
 */
export interface AsyncStorageProvider {
  /**
   * Read data from storage
   */
  readAsync<T>(key: string): Promise<T | null>;

  /**
   * Write data to storage
   */
  writeAsync<T>(key: string, data: T): Promise<void>;

  /**
   * Delete data from storage
   */
  deleteAsync(key: string): Promise<boolean>;

  /**
   * Check if key exists
   */
  existsAsync(key: string): Promise<boolean>;

  /**
   * List all keys
   */
  listKeysAsync(): Promise<string[]>;

  /**
   * Clear all data
   */
  clearAll(): Promise<number>;

  /**
   * Get collection statistics
   */
  getStats(): Promise<{
    count: number;
    size: number;
    avgObjSize: number;
  } | null>;

  /**
   * Close storage connection
   */
  close(): Promise<void>;
}
