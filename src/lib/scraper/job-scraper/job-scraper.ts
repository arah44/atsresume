import { TargetJobJson } from '@/types';
import { CheerioScraper } from '@/lib/scraper/core/';
import { JobDataParser } from './job-data-parser';

export interface ScrapeResult {
  success: boolean;
  job?: Partial<TargetJobJson>;
  error?: string;
  url: string;
}

/**
 * Simple job scraper that tries Cheerio first, falls back to Jina
 */
export class JobScraper {
  private cheerioScraper: CheerioScraper;
  private jobDataParser: JobDataParser;

  constructor() {
    this.cheerioScraper = new CheerioScraper({
      timeout: 30000,
      retries: 2,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    this.jobDataParser = new JobDataParser();

  }

  /**
   * Scrape a single job posting from a URL
   * Tries Cheerio first, falls back to Jina if Cheerio fails
   */
  async scrapeJob(url: string): Promise<ScrapeResult> {
    // Try Cheerio first
    const cheerioResult = await this.tryCheerio(url);
    if (cheerioResult.success) {
      return cheerioResult;
    }

    // If Cheerio fails, try Jina as fallback
    console.log('⚠️  Cheerio failed, trying Jina fallback:', cheerioResult.error);
    const jinaResult = await this.tryJina(url);

    if (jinaResult.success) {
      return jinaResult;
    }

    // Both failed - return helpful error
    return {
      success: false,
      error: this.getHelpfulError(url, cheerioResult.error, jinaResult.error),
      url
    };
  }


  /**
   * Try scraping with Cheerio (direct HTTP)
   */
  private async tryCheerio(url: string): Promise<ScrapeResult> {
    try {
      const response = await this.cheerioScraper.fetch(url);

      const parsedData = await this.jobDataParser.parseRawJobData(response.html, url);


      return {
        success: true,
        job: parsedData,
        url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cheerio scraping failed',
        url
      };
    }
  }

  /**
   * Try scraping with Jina (proxy service)
   */
  private async tryJina(url: string): Promise<ScrapeResult> {
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(jinaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Jina HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const parsedData = await this.jobDataParser.parseRawJobData(html, url);

        return {
          success: true,
          job: parsedData,
          url
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Jina scraping failed',
        url
      };
    }
  }

  /**
   * Generate helpful error message based on what failed
   */
  private getHelpfulError(url: string, cheerioError?: string, jinaError?: string): string {
    const isLinkedIn = url.includes('linkedin.com');

    if (isLinkedIn && (cheerioError?.includes('451') || jinaError?.includes('451'))) {
      return 'LinkedIn blocks automated scraping (HTTP 451). Please copy the job posting content and paste it into the "Raw Job Content" field. The AI will extract all details automatically.';
    }

    if (cheerioError?.includes('403') || jinaError?.includes('403')) {
      return 'Access forbidden (HTTP 403). The site is blocking scrapers. Please copy and paste the job content manually.';
    }

    return `Failed to scrape job posting. Cheerio: ${cheerioError || 'unknown'}. Jina: ${jinaError || 'unknown'}. Try copying the content manually.`;
  }


  /**
   * Scrape multiple job postings from URLs in parallel
   */
  async scrapeMultipleJobs(urls: string[]): Promise<ScrapeResult[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeJob(url))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Failed to scrape',
          url: urls[index]
        };
      }
    });
  }

  /**
   * Static method for convenience
   */
  static async scrapeMultipleJobs(urls: string[]): Promise<ScrapeResult[]> {
    const scraper = new JobScraper();
    return scraper.scrapeMultipleJobs(urls);
  }

  /**
   * Static method for convenience
   */
  static async scrapeJob(url: string): Promise<ScrapeResult> {
    const scraper = new JobScraper();
    return scraper.scrapeJob(url);
  }
}

