import { MongoCacheStorage } from '../mongodb/cache-storage';
import { StorageService } from './storageProvider';

/**
 * Storage service wrapper
 */
class StorageServiceImpl implements StorageService {
  constructor(private provider: MongoCacheStorage) {}

  async readData<T>(key: string): Promise<T | null> {
    return this.provider.readAsync<T>(key);
  }

  async writeData<T>(key: string, data: T): Promise<void> {
    return this.provider.writeAsync<T>(key, data);
  }

  async deleteData(key: string): Promise<boolean> {
    return this.provider.deleteAsync(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.provider.existsAsync(key);
  }

  async listKeys(): Promise<string[]> {
    return this.provider.listKeysAsync();
  }

  async clearAll(): Promise<number> {
    return this.provider.clearAll();
  }
}

// Singleton instance
let storageServiceInstance: StorageService | null = null;

/**
 * Get the storage service instance
 * Creates a singleton instance of the storage service using MongoDB
 */
export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    const mongoStorage = new MongoCacheStorage('cache');
    storageServiceInstance = new StorageServiceImpl(mongoStorage);
  }
  return storageServiceInstance;
}

export type { StorageService };
export { StorageServiceImpl };

