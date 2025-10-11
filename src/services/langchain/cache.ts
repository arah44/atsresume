import * as crypto from 'crypto';
import { LangChainResumeGenerator } from '../langchainResumeGenerator';
import type { Person, TargetJobJson, Resume, DataTransformationResult, ResumeGenerationInput } from '../../types';
import type { JobAnalysis, WorkExperience, SkillCategory } from './schemas';
import { MongoCacheStorage } from '../mongodb/cache-storage';

// Global cache storage instance
const storage = new MongoCacheStorage();

/**
 * Generates a hash for cache key from input data
 */
function generateHash(data: any): string {
  const json = JSON.stringify(data, Object.keys(data).sort());

  // Use crypto if available (Node.js), otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.createHash) {
    return crypto.createHash('md5').update(json).digest('hex');
  }

  // Simple hash fallback for browser
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Reads from cache if exists
 */
async function readCache<T>(cacheKey: string): Promise<T | null> {
  const cached = await storage.readAsync<T>(cacheKey);

  if (cached) {
    console.log(`💾 Cache HIT: ${cacheKey.substring(0, 16)}...`);
  } else {
    console.log(`🔍 Cache MISS: ${cacheKey.substring(0, 16)}...`);
  }

  return cached;
}

/**
 * Writes to cache
 */
async function writeCache<T>(cacheKey: string, data: T): Promise<void> {
  await storage.writeAsync(cacheKey, data);
  console.log(`💾 Cached: ${cacheKey.substring(0, 16)}...`);
}

/**
 * Clears all cache
 */
export async function clearCache(): Promise<void> {
  const count = await storage.clearAll();
  console.log(`🗑️  Cleared ${count} cache files`);
}

/**
 * Lists cache files
 */
export async function listCache(): Promise<void> {
  const keys = await storage.listKeysAsync();

  console.log(`\n📂 Cache Storage: MongoDB`);
  console.log(`📊 Total cached items: ${keys.length}\n`);

  keys.forEach((key, idx) => {
    console.log(`${idx + 1}. ${key}`);
  });
}

/**
 * Cached wrapper for LangChain Resume Generator
 * Caches expensive LLM calls to MongoDB
 */
export class CachedLangChainResumeGenerator extends LangChainResumeGenerator {

  /**
   * Generate base resume with caching
   * Cache key is based on person name and raw_content
   */
  async generateBaseResume(person: Person): Promise<Resume> {
    const cacheKey = `base-resume-${generateHash({
      personName: person.name,
      raw_content: person.raw_content
    })}`;

    // Check cache first
    const cached = await readCache<Resume>(cacheKey);
    if (cached) {
      console.log('✅ Base resume loaded from cache:', cacheKey);
      return cached;
    }

    // Generate if not cached
    console.log('🔄 Generating base resume (not cached)...');
    const result = await super.generateBaseResume(person);
    await writeCache(cacheKey, result);
    console.log('💾 Base resume cached:', cacheKey);
    return result;
  }

  /**
   * Analyze job requirements with caching
   */
  async analyzeJobRequirements(targetJob: TargetJobJson): Promise<JobAnalysis> {
    const cacheKey = `job-analysis-${generateHash({
      url: targetJob.url
    })}`;

    // Check cache first
    const cached = await readCache<JobAnalysis>(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate if not cached
    console.log('🔄 Generating job analysis (not cached)...');
    const result = await super.analyzeJobRequirements(targetJob);
    await writeCache(cacheKey, result);
    return result;
  }

  /**
   * Extract keywords with caching
   */
  async extractKeywords(targetJob: TargetJobJson): Promise<string[]> {
    const cacheKey = `keywords-${generateHash({
      url: targetJob.url,
    })}`;

    // Check cache first
    const cached = await readCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate if not cached
    console.log('🔄 Extracting keywords (not cached)...');
    const result = await super.extractKeywords(targetJob);
    await writeCache(cacheKey, result);
    return result;
  }

  /**
   * Generate optimized resume with caching (single-shot)
   */
  async generateOptimizedResume(
    baseResume: Resume,
    targetJob: TargetJobJson,
    jobAnalysis: JobAnalysis,
    keywords: string[]
  ): Promise<Resume> {
    const cacheKey = `optimized-resume-${generateHash({
      baseResumeName: baseResume.name,
      baseResumePosition: baseResume.position,
      jobTitle: targetJob.name,
      company: targetJob.company
    })}`;

    // Check cache first
    const cached = await readCache<Resume>(cacheKey);
    if (cached) {
      console.log('💾 Cache HIT: optimized-resume-' + cacheKey.substring(17, 21) + '...');
      return cached;
    }

    // Generate if not cached
    console.log('🔍 Cache MISS: optimized-resume-' + cacheKey.substring(17, 21) + '...');
    console.log('🔄 Generating optimized resume (not cached)...');

    const result = await super.generateOptimizedResume(
      baseResume,
      targetJob,
      jobAnalysis,
      keywords
    );

    await writeCache(cacheKey, result);
    console.log('💾 Optimized resume cached');

    return result;
  }

  /**
   * Complete pipeline with caching
   */
  async generateResumeWithSteps(input: ResumeGenerationInput): Promise<DataTransformationResult> {
    const cacheKey = `resume-complete-${generateHash({
      baseResumeName: input.baseResume.name,
      jobTitle: input.targetJob.name,
      company: input.targetJob.company
    })}`;

    // Check cache first for complete result
    const cached = await readCache<DataTransformationResult>(cacheKey);
    if (cached) {
      console.log('💾 Using fully cached resume generation result');
      return cached;
    }

    // Generate with individual step caching
    console.log('🔄 Starting resume generation with step-by-step caching...');
    const result = await super.generateResumeWithSteps(input);
    await writeCache(cacheKey, result);
    return result;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalFiles: number;
  totalSize: number;
}> {
  try {
    const keys = await storage.listKeysAsync();
    let totalSize = 0;

    // Calculate total size
    for (const key of keys) {
      const stats = await storage.getStats();
      if (stats) {
        totalSize += stats.size;
      }
    }

    return {
      totalFiles: keys.length,
      totalSize
    };
  } catch (error) {
    console.warn(`⚠️  Error getting cache stats: ${error}`);
    return { totalFiles: 0, totalSize: 0 };
  }
}

