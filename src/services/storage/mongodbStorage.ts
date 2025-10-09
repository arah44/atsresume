import { Db, Collection, Document } from 'mongodb';
import { AsyncStorageProvider } from './storageProvider';
import {
  StorageConnectionError,
  CacheReadError,
  CacheWriteError,
  CacheDeleteError,
  CacheListError
} from './errors';
import { getCacheDatabase } from '@/lib/mongodb';

/**
 * Custom document type with string _id
 */
interface CacheDocument extends Document {
  _id: string;
  data: unknown;
}

/**
 * MongoDB Storage Provider
 * Async-only implementation for server-side caching
 * Uses shared MongoDB client from @/lib/mongodb for connection pooling
 */
export class MongoDBStorageProvider implements AsyncStorageProvider {
  private db: Db | null = null;
  private collection: Collection<CacheDocument> | null = null;
  private collectionName: string;
  private initPromise: Promise<void> | null = null;

  constructor(
    collectionName: string = 'cache'
  ) {
    this.collectionName = collectionName;
  }

  /**
   * Initialize MongoDB connection using shared client
   */
  private async init(): Promise<void> {
    if (this.db && this.collection) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        // Use shared MongoDB client from lib/mongodb
        this.db = await getCacheDatabase();
        this.collection = this.db.collection<CacheDocument>(this.collectionName);

        // Create index on _id for faster lookups (already default, but being explicit)
        await this.collection.createIndex({ _id: 1 });

        console.log(`📦 MongoDB Cache connected: ATSResumeCache/${this.collectionName}`);
      } catch (error) {
        this.db = null;
        this.collection = null;
        this.initPromise = null;

        const err = error instanceof Error ? error : new Error(String(error));
        throw new StorageConnectionError('Failed to initialize MongoDB storage', err);
      }
    })();

    return this.initPromise;
  }

  /**
   * Read data from MongoDB
   */
  async readAsync<T>(key: string): Promise<T | null> {
    try {
      await this.init();
      if (!this.collection) return null;

      const doc = await this.collection.findOne({ _id: key });

      if (!doc) return null;

      const { _id, ...data } = doc;
      return data.data as T;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new CacheReadError(key, err);
    }
  }

  /**
   * Write data to MongoDB
   */
  async writeAsync<T>(key: string, data: T): Promise<void> {
    try {
      await this.init();
      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      await this.collection.replaceOne(
        { _id: key },
        { _id: key, data, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new CacheWriteError(key, err);
    }
  }

  /**
   * Delete data from MongoDB
   */
  async deleteAsync(key: string): Promise<boolean> {
    try {
      await this.init();
      if (!this.collection) return false;

      const result = await this.collection.deleteOne({ _id: key });
      return result.deletedCount > 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new CacheDeleteError(key, err);
    }
  }

  /**
   * Check if key exists in MongoDB
   */
  async existsAsync(key: string): Promise<boolean> {
    try {
      await this.init();
      if (!this.collection) return false;

      const count = await this.collection.countDocuments({ _id: key }, { limit: 1 });
      return count > 0;
    } catch (error) {
      console.warn(`⚠️  Error checking existence in MongoDB: ${error}`);
      return false;
    }
  }

  /**
   * List all keys in MongoDB
   */
  async listKeysAsync(): Promise<string[]> {
    try {
      await this.init();
      if (!this.collection) return [];

      const docs = await this.collection
        .find({}, { projection: { _id: 1 } })
        .toArray();

      return docs.map(doc => doc._id as string);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new CacheListError(err);
    }
  }

  /**
   * Clear all data from MongoDB
   */
  async clearAll(): Promise<number> {
    try {
      await this.init();
      if (!this.collection) return 0;

      const result = await this.collection.deleteMany({});
      return result.deletedCount || 0;
    } catch (error) {
      console.warn(`⚠️  Error clearing MongoDB: ${error}`);
      return 0;
    }
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<{
    count: number;
    size: number;
    avgObjSize: number;
  } | null> {
    try {
      await this.init();
      if (!this.collection) return null;

      // Use aggregation pipeline with $collStats instead of deprecated stats()
      const statsResult = await this.collection.aggregate([
        { $collStats: { storageStats: {} } }
      ]).toArray();

      if (statsResult.length === 0) {
        return { count: 0, size: 0, avgObjSize: 0 };
      }

      const stats = statsResult[0].storageStats;
      return {
        count: stats?.count || 0,
        size: stats?.size || 0,
        avgObjSize: stats?.avgObjSize || 0
      };
    } catch (error) {
      console.warn(`⚠️  Error getting MongoDB stats: ${error}`);
      return null;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    // Note: We use a shared MongoDB client, so we don't close it here
    // The client is managed by the application lifecycle
    this.db = null;
    this.collection = null;
    this.initPromise = null;
    console.log('🔌 MongoDB storage instance cleared (shared client remains open)');
  }
}


