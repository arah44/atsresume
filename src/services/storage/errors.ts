/**
 * Custom error classes for storage operations
 */

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class CacheReadError extends StorageError {
  constructor(key: string, cause?: Error) {
    super(`Failed to read cache key: ${key}`, cause);
    this.name = 'CacheReadError';
  }
}

export class CacheWriteError extends StorageError {
  constructor(key: string, cause?: Error) {
    super(`Failed to write cache key: ${key}`, cause);
    this.name = 'CacheWriteError';
  }
}

export class CacheDeleteError extends StorageError {
  constructor(key: string, cause?: Error) {
    super(`Failed to delete cache key: ${key}`, cause);
    this.name = 'CacheDeleteError';
  }
}

export class CacheListError extends StorageError {
  constructor(cause?: Error) {
    super('Failed to list cache keys', cause);
    this.name = 'CacheListError';
  }
}

export class StorageConnectionError extends StorageError {
  constructor(message: string = 'Failed to connect to storage backend', cause?: Error) {
    super(message, cause);
    this.name = 'StorageConnectionError';
  }
}

