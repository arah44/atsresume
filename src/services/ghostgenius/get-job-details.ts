import { ScrapeResult } from '../jobScraper';
import { JobDataParser } from '../jobDataParser';
import * as crypto from 'crypto';
import { getStorageService } from '../storage';

// Global storage service instance
const storage = getStorageService();

/**
 * Generates a hash for cache key from URL
 */
function generateHash(url: string): string {
  const normalizedUrl = url.toLowerCase().trim();

  // Use crypto if available (Node.js), otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.createHash) {
    return crypto.createHash('md5').update(normalizedUrl).digest('hex');
  }

  // Simple hash fallback for browser
  let hash = 0;
  for (let i = 0; i < normalizedUrl.length; i++) {
    const char = normalizedUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Reads from cache if exists
 */
async function readCache(cacheKey: string): Promise<GhostGeniusResponse | null> {
  const cached = await storage.readData<GhostGeniusResponse>(cacheKey);

  if (cached) {
    console.log(`💾 GhostGenius Cache HIT: ${cacheKey}`);
  } else {
    console.log(`🔍 GhostGenius Cache MISS: ${cacheKey}`);
  }

  return cached;
}

/**
 * Writes to cache
 */
async function writeCache(cacheKey: string, data: GhostGeniusResponse): Promise<void> {
  await storage.writeData(cacheKey, data);
  console.log(`💾 GhostGenius Cached: ${cacheKey}`);
}

interface GhostGeniusCompany {
  id: string;
  type: 'person' | 'company';
  full_name: string;
  url: string;
  headline?: string;
  profile_picture?: Array<{
    height: number;
    width: number;
    url: string;
    expires_at: number;
  }>;
}

interface GhostGeniusApplyMethod {
  company_apply_url: string | null;
  easy_apply_url: string | null;
}

interface GhostGeniusResponse {
  id: string;
  title: string;
  description: string;
  state: string;
  location: string;
  url: string;
  work_remote_allowed: boolean;
  work_place: string;
  listed_at_date: string;
  original_listed_date: string;
  closed: boolean;
  company: GhostGeniusCompany;
  apply_method: GhostGeniusApplyMethod;
}

/**
 * Checks if a URL is from LinkedIn
 */
function isLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('linkedin.com');
  } catch {
    return false;
  }
}

/**
 * Transform GhostGenius API response to our TargetJobJson format
 */
function transformGhostGeniusResponse(job: GhostGeniusResponse, url: string): ScrapeResult {
  // Build a rich raw_content with all the details
  const enrichedContent = `
Job Title: ${job.title}
Company: ${job.company.full_name}
Location: ${job.location}
Work Place: ${job.work_place}
Remote Allowed: ${job.work_remote_allowed ? 'Yes' : 'No'}
Listed Date: ${job.listed_at_date}
Job State: ${job.state}
Closed: ${job.closed ? 'Yes' : 'No'}

${job.company.headline ? `Company Headline: ${job.company.headline}\n` : ''}
${job.apply_method.company_apply_url ? `Apply URL: ${job.apply_method.company_apply_url}\n` : ''}
${job.apply_method.easy_apply_url ? `Easy Apply URL: ${job.apply_method.easy_apply_url}\n` : ''}

Description:
${job.description}

---
Full Data:
${JSON.stringify(job, null, 2)}
  `.trim();

  // Determine the apply URL - prefer easy apply, fallback to company URL
  const applyUrl = job.apply_method.easy_apply_url || job.apply_method.company_apply_url || undefined;

  const parsedJob = {
    name: job.title || 'Unknown Position',
    url: job.url || url,
    company: job.company.full_name || 'Unknown Company',
    description: job.description || '',
    raw_content: enrichedContent,
    apply_url: applyUrl,
    is_easy_apply: !!job.apply_method.easy_apply_url,
    remote_allowed: job.work_remote_allowed
  };

  return {
    success: true,
    job: parsedJob,
    url
  };
}

/**
 * Fetches job details using GhostGenius API for LinkedIn URLs
 */
async function fetchFromGhostGenius(url: string): Promise<ScrapeResult> {
  const apiKey = process.env.GHOSTGENIUS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GHOSTGENIUS_API_KEY not configured in environment variables',
      url
    };
  }

  // Generate cache key from URL
  const cacheKey = `ghostgenius-job-${generateHash(url)}`;

  // Check cache first
  const cachedJob = await readCache(cacheKey);
  if (cachedJob) {
    // Transform cached response to our TargetJobJson format
    return transformGhostGeniusResponse(cachedJob, url);
  }

  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`https://api.ghostgenius.fr/v2/job?url=${encodedUrl}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`GhostGenius API returned status ${response.status}: ${response.statusText}`);
    }

    const job: GhostGeniusResponse = await response.json();

    // Cache the response
    await writeCache(cacheKey, job);

    // Transform and return
    return transformGhostGeniusResponse(job, url);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred with GhostGenius API',
      url
    };
  }
}

/**
 * Fetches job details using the existing scraper
 */
async function fetchFromScraper(url: string): Promise<ScrapeResult> {
  const { JobScraper } = await import('../jobScraper');
  return JobScraper.scrapeJob(url);
}

/**
 * Main function to get job details
 * - Uses GhostGenius API for LinkedIn URLs
 * - Uses the scraper for all other URLs
 */
export async function getJobDetails(url: string): Promise<ScrapeResult> {
  if (isLinkedInUrl(url)) {
    console.log(`🔗 LinkedIn URL detected, using GhostGenius API for: ${url}`);
    return fetchFromGhostGenius(url);
  } else {
    console.log(`🌐 Non-LinkedIn URL detected, using scraper for: ${url}`);
    return fetchFromScraper(url);
  }
}

/**
 * Batch fetch job details for multiple URLs
 */
export async function getMultipleJobDetails(urls: string[]): Promise<ScrapeResult[]> {
  const results = await Promise.allSettled(
    urls.map(url => getJobDetails(url))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: result.reason?.message || 'Failed to fetch job details',
        url: urls[index]
      };
    }
  });
}

