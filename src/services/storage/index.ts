import { StorageProvider, AsyncStorageProvider } from './storageProvider';
import { FilesystemStorageProvider } from './filesystemStorage';
import { LocalStorageProvider } from './localStorageProvider';
import { IndexedDBStorageProvider } from './indexedDBStorage';

/**
 * Get the appropriate storage provider based on environment
 * - Server/Scripts: Filesystem storage
 * - Client/Browser: IndexedDB (better than localStorage for large data)
 */
export function getStorageProvider(): StorageProvider | AsyncStorageProvider {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use IndexedDB for client-side (better performance for large data)
    return new IndexedDBStorageProvider('ATSResumeCache', 'cache');
  }

  // Server-side: use filesystem
  return new FilesystemStorageProvider();
}

/**
 * Create a storage provider with custom configuration
 */
export function createStorageProvider(
  type: 'filesystem' | 'localstorage' | 'indexeddb',
  config?: {
    baseDir?: string;      // For filesystem
    prefix?: string;       // For localStorage
    dbName?: string;       // For IndexedDB
    storeName?: string;    // For IndexedDB
  }
): StorageProvider | AsyncStorageProvider {
  if (type === 'filesystem') {
    return new FilesystemStorageProvider(config?.baseDir);
  }

  if (type === 'indexeddb') {
    return new IndexedDBStorageProvider(config?.dbName, config?.storeName);
  }

  return new LocalStorageProvider(config?.prefix);
}

// Re-export types and classes
export type { StorageProvider, AsyncStorageProvider } from './storageProvider';
export { FilesystemStorageProvider } from './filesystemStorage';
export { LocalStorageProvider } from './localStorageProvider';
export { IndexedDBStorageProvider } from './indexedDBStorage';

