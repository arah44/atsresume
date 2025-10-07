import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider } from './storageProvider';

/**
 * Filesystem Storage Provider
 * For use in server-side code and scripts
 */
export class FilesystemStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir: string = path.join(process.cwd(), 'data', 'cache')) {
    this.baseDir = baseDir;
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
      console.log(`📁 Created storage directory: ${this.baseDir}`);
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.baseDir, `${key}.json`);
  }

  read<T>(key: string): T | null {
    try {
      const filePath = this.getFilePath(key);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`⚠️  Error reading from filesystem: ${error}`);
      return null;
    }
  }

  write<T>(key: string, data: T): void {
    try {
      this.ensureDirectory();
      const filePath = this.getFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`⚠️  Error writing to filesystem: ${error}`);
    }
  }

  delete(key: string): boolean {
    try {
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`⚠️  Error deleting from filesystem: ${error}`);
      return false;
    }
  }

  exists(key: string): boolean {
    try {
      return fs.existsSync(this.getFilePath(key));
    } catch {
      return false;
    }
  }

  listKeys(): string[] {
    try {
      if (!fs.existsSync(this.baseDir)) {
        return [];
      }

      return fs.readdirSync(this.baseDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.warn(`⚠️  Error listing filesystem keys: ${error}`);
      return [];
    }
  }

  getType(): 'filesystem' {
    return 'filesystem';
  }

  /**
   * Get file metadata
   */
  getMetadata(key: string): { size: number; modified: Date } | null {
    try {
      const filePath = this.getFilePath(key);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      console.warn(`⚠️  Error getting metadata: ${error}`);
      return null;
    }
  }
}

