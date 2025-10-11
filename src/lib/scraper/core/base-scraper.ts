/**
 * Base Scraper Interface
 * Provides a common interface for different scraping implementations
 */

/**
 * Popular user agents for rotation
 */
const POPULAR_USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  // Firefox on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

export interface ScraperOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  userAgent?: string;
  rotateUserAgent?: boolean;
  delayBetweenRequests?: number; // Delay in ms between requests
  randomizeDelay?: boolean; // Add random variance to delay
}

export interface ScraperResponse {
  html: string;
  url: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export abstract class BaseScraper {
  protected options: ScraperOptions;
  private lastRequestTime: number = 0;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      timeout: 30000,
      retries: 3,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      delayBetweenRequests: 1000, // Default 1 second between requests
      randomizeDelay: true,
      ...options,
    };
  }

  /**
   * Fetch HTML content from a URL
   */
  abstract fetch(url: string): Promise<ScraperResponse>;

  /**
   * Get a random user agent from the popular list
   */
  protected getUserAgent(): string {
    if (this.options.rotateUserAgent) {
      const randomIndex = Math.floor(Math.random() * POPULAR_USER_AGENTS.length);
      return POPULAR_USER_AGENTS[randomIndex];
    }
    return this.options.userAgent || POPULAR_USER_AGENTS[0];
  }

  /**
   * Get realistic browser headers to avoid detection
   */
  protected getBrowserHeaders(): Record<string, string> {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      ...this.options.headers,
    };
  }

  /**
   * Wait with optional randomization to appear more human-like
   */
  protected async waitWithRandomization(baseDelay: number): Promise<void> {
    let delay = baseDelay;

    if (this.options.randomizeDelay) {
      // Add ±30% random variance
      const variance = baseDelay * 0.3;
      const randomOffset = (Math.random() * variance * 2) - variance;
      delay = Math.max(100, baseDelay + randomOffset);
    }

    return this.wait(delay);
  }

  /**
   * Enforce rate limiting between requests
   */
  protected async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delayNeeded = (this.options.delayBetweenRequests || 0) - timeSinceLastRequest;

    if (delayNeeded > 0) {
      await this.waitWithRandomization(delayNeeded);
    }

    this.lastRequestTime = Date.now();
  }

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
   * Wait for a specified duration
   */
  protected async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry logic for failed requests
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.options.retries || 3
  ): Promise<T> {
    let lastError: Error | unknown;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          // Exponential backoff
          await this.wait(Math.pow(2, i) * 1000);
        }
      }
    }

    throw lastError;
  }
}

