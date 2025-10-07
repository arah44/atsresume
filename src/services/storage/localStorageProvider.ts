import { StorageProvider } from './storageProvider';

/**
 * LocalStorage Storage Provider
 * For use in client-side code (browser)
 */
export class LocalStorageProvider implements StorageProvider {
  private prefix: string;

  constructor(prefix: string = 'cache-') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  read<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') {
        console.warn('LocalStorage not available (server-side)');
        return null;
      }

      const data = localStorage.getItem(this.getKey(key));
      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`⚠️  Error reading from localStorage: ${error}`);
      return null;
    }
  }

  write<T>(key: string, data: T): void {
    try {
      if (typeof window === 'undefined') {
        console.warn('LocalStorage not available (server-side)');
        return;
      }

      localStorage.setItem(
        this.getKey(key),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.warn(`⚠️  Error writing to localStorage: ${error}`);
    }
  }

  delete(key: string): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.warn(`⚠️  Error deleting from localStorage: ${error}`);
      return false;
    }
  }

  exists(key: string): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      return localStorage.getItem(this.getKey(key)) !== null;
    } catch {
      return false;
    }
  }

  listKeys(): string[] {
    try {
      if (typeof window === 'undefined') {
        return [];
      }

      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.warn(`⚠️  Error listing localStorage keys: ${error}`);
      return [];
    }
  }

  getType(): 'localstorage' {
    return 'localstorage';
  }

  /**
   * Get approximate size of stored data
   */
  getSize(key: string): number {
    try {
      if (typeof window === 'undefined') {
        return 0;
      }

      const data = localStorage.getItem(this.getKey(key));
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all items with this prefix
   */
  clear(): number {
    try {
      if (typeof window === 'undefined') {
        return 0;
      }

      const keys = this.listKeys();
      keys.forEach(key => this.delete(key));
      return keys.length;
    } catch (error) {
      console.warn(`⚠️  Error clearing localStorage: ${error}`);
      return 0;
    }
  }
}

