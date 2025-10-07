'use server';

import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

export interface CacheFile {
  filename: string;
  type: 'job-analysis' | 'keywords' | 'summary' | 'work-experience' | 'skills' | 'resume' | 'resume-complete' | 'person-data' | 'other';
  size: number;
  modified: string;
  hash: string;
}

export interface CacheFileData {
  filename: string;
  data: any;
  size: number;
  modified: string;
}

/**
 * Get all cache files grouped by type
 */
export async function getCacheFiles(): Promise<{
  jobs: CacheFile[];
  resumes: CacheFile[];
  person: CacheFile[];
  other: CacheFile[];
}> {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return { jobs: [], resumes: [], person: [], other: [] };
    }

    const files = fs.readdirSync(CACHE_DIR);
    const cacheFiles: CacheFile[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);

      // Determine type from filename
      let type: CacheFile['type'] = 'other';
      if (file.startsWith('job-analysis-')) type = 'job-analysis';
      else if (file.startsWith('keywords-')) type = 'keywords';
      else if (file.startsWith('summary-')) type = 'summary';
      else if (file.startsWith('work-experience-')) type = 'work-experience';
      else if (file.startsWith('skills-')) type = 'skills';
      else if (file.startsWith('resume-complete-')) type = 'resume-complete';
      else if (file.startsWith('resume-')) type = 'resume';
      else if (file.startsWith('person-data-')) type = 'person-data';

      // Extract hash from filename
      const hash = file.replace('.json', '').split('-').slice(-1)[0];

      cacheFiles.push({
        filename: file,
        type,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        hash
      });
    }

    // Group by category
    return {
      jobs: cacheFiles.filter(f => f.type === 'job-analysis' || f.type === 'keywords'),
      resumes: cacheFiles.filter(f => f.type === 'resume' || f.type === 'resume-complete' || f.type === 'summary' || f.type === 'work-experience' || f.type === 'skills'),
      person: cacheFiles.filter(f => f.type === 'person-data'),
      other: cacheFiles.filter(f => f.type === 'other')
    };
  } catch (error) {
    console.error('Failed to get cache files:', error);
    return { jobs: [], resumes: [], person: [], other: [] };
  }
}

/**
 * Read a specific cache file
 */
export async function readCacheFile(filename: string): Promise<CacheFileData | null> {
  try {
    const filePath = path.join(CACHE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);

    return {
      filename,
      data: JSON.parse(data),
      size: stats.size,
      modified: stats.mtime.toISOString()
    };
  } catch (error) {
    console.error('Failed to read cache file:', error);
    return null;
  }
}

/**
 * Delete a cache file
 */
export async function deleteCacheFile(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(CACHE_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Cache file deleted:', filename);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to delete cache file:', error);
    return false;
  }
}

/**
 * Clear all cache files
 */
export async function clearAllCache(): Promise<number> {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return 0;
    }

    const files = fs.readdirSync(CACHE_DIR);
    let deleted = 0;

    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
        deleted++;
      }
    }

    console.log(`Cleared ${deleted} cache files`);
    return deleted;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
}> {
  try {
    const files = await getCacheFiles();
    const allFiles = [...files.jobs, ...files.resumes, ...files.person, ...files.other];

    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

    const byType: Record<string, number> = {};
    allFiles.forEach(file => {
      byType[file.type] = (byType[file.type] || 0) + 1;
    });

    return {
      totalFiles: allFiles.length,
      totalSize,
      byType
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { totalFiles: 0, totalSize: 0, byType: {} };
  }
}

