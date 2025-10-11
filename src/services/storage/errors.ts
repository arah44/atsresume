/**
 * Base error for storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'StorageError';

    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error for storage connection failures
 */
export class StorageConnectionError extends StorageError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'StorageConnectionError';
  }
}

/**
 * Error for cache read failures
 */
export class CacheReadError extends StorageError {
  constructor(
    public readonly key: string,
    cause?: Error
  ) {
    super(`Failed to read cache key: ${key}`, cause);
    this.name = 'CacheReadError';
  }
}

/**
 * Error for cache write failures
 */
export class CacheWriteError extends StorageError {
  constructor(
    public readonly key: string,
    cause?: Error
  ) {
    super(`Failed to write cache key: ${key}`, cause);
    this.name = 'CacheWriteError';
  }
}

/**
 * Error for cache delete failures
 */
export class CacheDeleteError extends StorageError {
  constructor(
    public readonly key: string,
    cause?: Error
  ) {
    super(`Failed to delete cache key: ${key}`, cause);
    this.name = 'CacheDeleteError';
  }
}

/**
 * Error for cache list failures
 */
export class CacheListError extends StorageError {
  constructor(cause?: Error) {
    super('Failed to list cache keys', cause);
    this.name = 'CacheListError';
  }
}
