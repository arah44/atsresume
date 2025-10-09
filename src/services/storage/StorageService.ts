import { MongoDBStorageProvider } from './mongodbStorage';
import { AsyncStorageProvider } from './storageProvider';

/**
 * Cache file type classification
 */
export type CacheFileType =
  | 'job-analysis'
  | 'keywords'
  | 'summary'
  | 'work-experience'
  | 'skills'
  | 'resume'
  | 'resume-complete'
  | 'person-data'
  | 'pdf-extract'
  | 'other';

/**
 * Metadata for a cache entry
 */
export interface CacheMetadata {
  size: number;
  modified: Date;
}

/**
 * Storage Service - OOP wrapper for MongoDB storage
 * Implements AsyncStorageProvider for dependency injection compatibility
 */
export class StorageService implements AsyncStorageProvider {
  private static instance: StorageService | null = null;
  private storage: MongoDBStorageProvider;

  private constructor() {
    this.storage = new MongoDBStorageProvider();
  }

  /**
   * Get singleton instance of StorageService
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Read data from storage (AsyncStorageProvider interface)
   */
  async readAsync<T>(key: string): Promise<T | null> {
    return this.storage.readAsync<T>(key);
  }

  /**
   * Write data to storage (AsyncStorageProvider interface)
   */
  async writeAsync<T>(key: string, data: T): Promise<void> {
    return this.storage.writeAsync(key, data);
  }

  /**
   * Delete data from storage (AsyncStorageProvider interface)
   */
  async deleteAsync(key: string): Promise<boolean> {
    return this.storage.deleteAsync(key);
  }

  /**
   * Check if key exists (AsyncStorageProvider interface)
   */
  async existsAsync(key: string): Promise<boolean> {
    return this.storage.existsAsync(key);
  }

  /**
   * List all keys (AsyncStorageProvider interface)
   */
  async listKeysAsync(): Promise<string[]> {
    return this.storage.listKeysAsync();
  }

  /**
   * Convenience method: Read data from storage
   */
  async readData<T>(key: string): Promise<T | null> {
    return this.readAsync<T>(key);
  }

  /**
   * Convenience method: Write data to storage
   */
  async writeData<T>(key: string, data: T): Promise<void> {
    return this.writeAsync(key, data);
  }

  /**
   * Convenience method: Delete data from storage
   */
  async deleteData(key: string): Promise<boolean> {
    return this.deleteAsync(key);
  }

  /**
   * Convenience method: Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return this.existsAsync(key);
  }

  /**
   * Convenience method: List all keys
   */
  async listKeys(): Promise<string[]> {
    return this.listKeysAsync();
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<number> {
    return this.storage.clearAll();
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    count: number;
    size: number;
    avgObjSize: number;
  } | null> {
    return this.storage.getStats();
  }

  /**
   * Get cache type from key
   */
  getCacheType(key: string): CacheFileType {
    if (key.startsWith('job-analysis-')) return 'job-analysis';
    if (key.startsWith('keywords-')) return 'keywords';
    if (key.startsWith('summary-')) return 'summary';
    if (key.startsWith('work-experience-')) return 'work-experience';
    if (key.startsWith('skills-')) return 'skills';
    if (key.startsWith('resume-complete-')) return 'resume-complete';
    if (key.startsWith('resume-')) return 'resume';
    if (key.startsWith('person-data-')) return 'person-data';
    if (key.startsWith('pdf-extract-')) return 'pdf-extract';
    return 'other';
  }

  /**
   * Get metadata for a cache entry
   */
  async getMetadata(key: string): Promise<CacheMetadata | null> {
    try {
      const data = await this.storage.readAsync(key);
      if (!data) return null;

      // Estimate size from JSON
      const size = new Blob([JSON.stringify(data)]).size;
      const modified = new Date();

      return { size, modified };
    } catch (error) {
      console.warn(`⚠️  Error getting metadata for ${key}:`, error);
      return null;
    }
  }

  /**
   * Extract hash from cache key
   */
  extractHash(key: string): string {
    return key.split('-').slice(-1)[0];
  }

  /**
   * Close storage connection
   */
  async close(): Promise<void> {
    return this.storage.close();
  }
}

/**
 * Get storage service instance
 */
export function getStorageService(): StorageService {
  return StorageService.getInstance();
}

