/**
 * MongoDB-only storage system
 * Simplified exports for storage layer
 */

// Core provider
import { MongoDBStorageProvider as MongoDBProvider } from './mongodbStorage';
export { MongoDBProvider as MongoDBStorageProvider };

// Storage service (recommended for application use)
export { StorageService, getStorageService } from './StorageService';
export type { CacheFileType, CacheMetadata } from './StorageService';

// Interface
export type { AsyncStorageProvider } from './storageProvider';

// Errors
export {
  StorageError,
  CacheReadError,
  CacheWriteError,
  CacheDeleteError,
  CacheListError,
  StorageConnectionError
} from './errors';

/**
 * Get MongoDB storage instance
 * @deprecated Use getStorageService() instead for better OOP design
 */
export function getMongoDBStorage(): MongoDBProvider {
  return new MongoDBProvider();
}
