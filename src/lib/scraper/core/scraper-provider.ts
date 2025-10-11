/**
 * Scraper Provider Interface
 * Defines the contract for different scraping implementations
 */

export interface ScraperResult {
  html: string;
  url: string;
}

/**
 * Abstract base class for scraper providers
 * Provides common functionality and enforces the contract
 */
export abstract class NScraperProvider {
  /**
   * Fetch HTML content from a URL
   * @param url - The URL to scrape
   * @returns ScraperResult containing the HTML and final URL
   */
  abstract fetchHtml(url: string): Promise<ScraperResult>;

  /**
   * Validate if a string is a valid URL
   */
  protected isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate URL before fetching
   */
  protected validateUrl(url: string): void {
    if (!url || !this.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
}

