/**
 * Storage Provider Interface
 * Allows cache to work with different storage backends (filesystem, localStorage, IndexedDB)
 *
 * Note: Async methods are preferred for IndexedDB, sync methods for filesystem/localStorage
 */
export interface StorageProvider {
  /**
   * Read data from storage (sync - may not work for IndexedDB)
   */
  read<T>(key: string): T | null;

  /**
   * Write data to storage (sync)
   */
  write<T>(key: string, data: T): void;

  /**
   * Delete data from storage (sync)
   */
  delete(key: string): boolean;

  /**
   * Check if key exists (sync)
   */
  exists(key: string): boolean;

  /**
   * List all keys (sync)
   */
  listKeys(): string[];

  /**
   * Get storage type identifier
   */
  getType(): 'filesystem' | 'localstorage' | 'memory';
}

/**
 * Async Storage Provider Interface
 * For storage backends that require async operations (IndexedDB)
 */
export interface AsyncStorageProvider extends StorageProvider {
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
   * Check if key exists (async)
   */
  existsAsync(key: string): Promise<boolean>;

  /**
   * List all keys (async)
   */
  listKeysAsync(): Promise<string[]>;
}

