/**
 * Cheerio-based web scraper
 * Provides HTML parsing and data extraction capabilities using Cheerio
 */

import * as cheerio from 'cheerio';
import { BaseScraper, ScraperOptions, ScraperResponse } from './base-scraper';

export interface CheerioScraperOptions extends ScraperOptions {
  followRedirects?: boolean;
  maxRedirects?: number;
}

export class CheerioScraper extends BaseScraper {
  constructor(options: CheerioScraperOptions = {}) {
    super(options);
  }

  /**
   * Fetch HTML content from a URL
   */
  async fetch(url: string): Promise<ScraperResponse> {
    if (!this.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }

    // Enforce rate limiting before making request
    await this.enforceRateLimit();

    return this.retry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      try {
        const browserHeaders = this.getBrowserHeaders();
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getUserAgent(),
            ...browserHeaders,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        return {
          html,
          url,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } finally {
        clearTimeout(timeoutId);
      }
    });
  }

  /**
   * Fetch and parse HTML with Cheerio
   */
  async fetchAndParse(url: string): Promise<cheerio.CheerioAPI> {
    const response = await this.fetch(url);
    return cheerio.load(response.html);
  }

  /**
   * Extract text content from HTML, removing scripts and styles
   */
  extractText(html: string): string {
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style').remove();

    // Get text content
    let text = $('body').text();

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Extract metadata from HTML
   */
  extractMetadata(html: string): Record<string, string> {
    const $ = cheerio.load(html);
    const metadata: Record<string, string> = {};

    // Title
    metadata.title = $('title').text().trim();

    // Meta tags
    $('meta').each((_, elem) => {
      const name = $(elem).attr('name') || $(elem).attr('property');
      const content = $(elem).attr('content');

      if (name && content) {
        metadata[name] = content;
      }
    });

    // Open Graph
    $('meta[property^="og:"]').each((_, elem) => {
      const property = $(elem).attr('property');
      const content = $(elem).attr('content');

      if (property && content) {
        metadata[property] = content;
      }
    });

    // Twitter Card
    $('meta[name^="twitter:"]').each((_, elem) => {
      const name = $(elem).attr('name');
      const content = $(elem).attr('content');

      if (name && content) {
        metadata[name] = content;
      }
    });

    return metadata;
  }

  /**
   * Extract links from HTML
   */
  extractLinks(html: string, baseUrl?: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];

    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        try {
          const url = baseUrl ? new URL(href, baseUrl).href : href;
          links.push(url);
        } catch {
          // Invalid URL, skip
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Extract images from HTML
   */
  extractImages(html: string, baseUrl?: string): Array<{ src: string; alt?: string }> {
    const $ = cheerio.load(html);
    const images: Array<{ src: string; alt?: string }> = [];

    $('img[src]').each((_, elem) => {
      const src = $(elem).attr('src');
      const alt = $(elem).attr('alt');

      if (src) {
        try {
          const url = baseUrl ? new URL(src, baseUrl).href : src;
          images.push({ src: url, alt });
        } catch {
          // Invalid URL, skip
        }
      }
    });

    return images;
  }

  /**
   * Select elements using CSS selectors
   */
  select(html: string, selector: string): cheerio.Cheerio<any> {
    const $ = cheerio.load(html);
    return $(selector);
  }

  /**
   * Extract structured data (JSON-LD)
   */
  extractStructuredData(html: string): any[] {
    const $ = cheerio.load(html);
    const data: any[] = [];

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const json = JSON.parse($(elem).html() || '');
        data.push(json);
      } catch {
        // Invalid JSON, skip
      }
    });

    return data;
  }

  /**
   * Check if an element exists
   */
  exists(html: string, selector: string): boolean {
    const $ = cheerio.load(html);
    return $(selector).length > 0;
  }

  /**
   * Get attribute value from an element
   */
  getAttribute(html: string, selector: string, attribute: string): string | undefined {
    const $ = cheerio.load(html);
    return $(selector).first().attr(attribute);
  }

  /**
   * Get text content from an element
   */
  getText(html: string, selector: string): string {
    const $ = cheerio.load(html);
    return $(selector).first().text().trim();
  }

  /**
   * Get multiple text contents from elements
   */
  getTexts(html: string, selector: string): string[] {
    const $ = cheerio.load(html);
    const texts: string[] = [];

    $(selector).each((_, elem) => {
      const text = $(elem).text().trim();
      if (text) {
        texts.push(text);
      }
    });

    return texts;
  }

  /**
   * Extract table data
   */
  extractTable(html: string, selector: string): Array<Record<string, string>> {
    const $ = cheerio.load(html);
    const table = $(selector).first();
    const data: Array<Record<string, string>> = [];

    // Get headers
    const headers: string[] = [];
    table.find('thead tr th, thead tr td').each((_, elem) => {
      headers.push($(elem).text().trim());
    });

    // Get rows
    table.find('tbody tr').each((_, row) => {
      const rowData: Record<string, string> = {};
      $(row).find('td').each((i, cell) => {
        const header = headers[i] || `column_${i}`;
        rowData[header] = $(cell).text().trim();
      });
      data.push(rowData);
    });

    return data;
  }
}

