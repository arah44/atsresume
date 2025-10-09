/**
 * Shared MongoDB Client Configuration
 *
 * This provides a singleton MongoDB client that can be shared across:
 * - Cache system (ATSResumeCache database)
 * - Auth system (ATSResumeAuth database)
 * - User data (future expansion)
 */

import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_CONNECTION_STRING) {
  throw new Error('MONGODB_CONNECTION_STRING environment variable is required');
}

const uri = process.env.MONGODB_CONNECTION_STRING;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so the MongoClient is not recreated
  // on every hot reload
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the client promise for use in both cache and auth
export default clientPromise;

/**
 * Get the client instance (useful for transactions and advanced operations)
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Get database for cache operations
 */
export async function getCacheDatabase() {
  const client = await clientPromise;
  return client.db('ATSResumeCache');
}

/**
 * Get database for auth operations
 */
export async function getAuthDatabase() {
  const client = await clientPromise;
  return client.db('ATSResumeAuth');
}

/**
 * Get MongoDB client synchronously for Better Auth
 * The adapter needs a Db instance (not a Promise)
 * Connection happens lazily when first operation is performed
 */
export function getAuthClientSync() {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoAuthClient?: MongoClient;
    };

    if (!globalWithMongo._mongoAuthClient) {
      globalWithMongo._mongoAuthClient = new MongoClient(uri, options);
    }
    return globalWithMongo._mongoAuthClient;
  } else {
    return new MongoClient(uri, options);
  }
}

/**
 * Get database for user data (profiles, jobs, resumes, applications)
 */
export async function getUserDataDatabase() {
  const client = await clientPromise;
  return client.db('ATSResumeData');
}

