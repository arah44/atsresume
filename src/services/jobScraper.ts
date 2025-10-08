import { TargetJobJson } from '@/types';
import { JobDataParser } from './jobDataParser';

export interface ScrapeResult {
  success: boolean;
  job?: TargetJobJson;
  error?: string;
  url: string;
}

class Scraper {
  async getPageContent(url: string): Promise<string> {
    const proxyUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.text();
  }
}

export class JobScraper {


  /**
   * Scrape a single job posting from a URL
   */
  static async scrapeJob(url: string): Promise<ScrapeResult> {
    try {

      // Validate URL
      if (!url || !this.isValidUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL provided',
          url
        };
      }

      const scraper = new Scraper();

      // Fetch the page content
      const mdContent = await scraper.getPageContent(url);

      if (!mdContent) {
        return {
          success: false,
          error: `Failed to fetch: ${url} - ${mdContent}`,
          url
        };
      }



      // Parse the job data
      const parsedData = JobDataParser.parseRawJobData(mdContent, url);

      // Validate the parsed data
      if (!JobDataParser.validateParsedData(parsedData)) {
        return {
          success: false,
          error: 'Could not extract valid job information from the page',
          url,
          job: parsedData as TargetJobJson
        };
      }

      return {
        success: true,
        job: parsedData as TargetJobJson,
        url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        url
      };
    }
  }

  /**
   * Scrape multiple job postings from URLs
   */
  static async scrapeMultipleJobs(urls: string[]): Promise<ScrapeResult[]> {
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
   * Extract text content from HTML
   */
  private static extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, ' ');

    // Remove all HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = this.decodeHtmlEntities(text);

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Decode common HTML entities
   */
  private static decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&ndash;': '–',
      '&mdash;': '—',
      '&bull;': '•'
    };

    return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
  }

  /**
   * Validate if a string is a valid URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extract job board specific data (optional enhancement)
   */
  static detectJobBoard(url: string): string | null {
    const jobBoards = [
      { pattern: /linkedin\.com/, name: 'LinkedIn' },
      { pattern: /indeed\.com/, name: 'Indeed' },
      { pattern: /glassdoor\.com/, name: 'Glassdoor' },
      { pattern: /monster\.com/, name: 'Monster' },
      { pattern: /ziprecruiter\.com/, name: 'ZipRecruiter' },
      { pattern: /dice\.com/, name: 'Dice' },
      { pattern: /angel\.co|wellfound\.com/, name: 'Wellfound' },
      { pattern: /greenhouse\.io/, name: 'Greenhouse' },
      { pattern: /lever\.co/, name: 'Lever' }
    ];

    for (const board of jobBoards) {
      if (board.pattern.test(url)) {
        return board.name;
      }
    }

    return null;
  }
}

