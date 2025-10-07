import { TargetJobJson } from '../types';

export class JobDataParser {
  /**
   * Parse raw job posting content and extract structured data
   */
  static parseRawJobData(rawContent: string, url: string = ''): Partial<TargetJobJson> {
    // Clean the raw content
    const cleanedContent = this.cleanRawContent(rawContent);
    
    // Extract job title
    const jobTitle = this.extractJobTitle(cleanedContent);
    
    // Extract company name
    const companyName = this.extractCompanyName(cleanedContent, url);
    
    // Extract job description
    const jobDescription = this.extractJobDescription(cleanedContent);
    
    return {
      name: jobTitle,
      company: companyName,
      url: url,
      description: jobDescription,
      raw_content: rawContent
    };
  }

  /**
   * Clean raw content by removing HTML tags and normalizing whitespace
   */
  private static cleanRawContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract job title from content
   */
  private static extractJobTitle(content: string): string {
    // Common patterns for job titles
    const titlePatterns = [
      /(?:job\s+title|position|role)[:\s]+([^\n\r]+)/i,
      /(?:hiring|looking\s+for|seeking)[:\s]+([^\n\r]+)/i,
      /^([^-\n\r]{10,60})$/m, // First line that looks like a title
      /(?:title|position)[:\s]*([^\n\r]+)/i
    ];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 100) {
          return title;
        }
      }
    }

    // Fallback: try to find the first meaningful line
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines.slice(0, 5)) {
      if (line.length > 10 && line.length < 100 && !line.includes('@') && !line.includes('http')) {
        return line;
      }
    }

    return 'Software Engineer'; // Default fallback
  }

  /**
   * Extract company name from content or URL
   */
  private static extractCompanyName(content: string, url: string): string {
    // Try to extract from URL first
    if (url) {
      const urlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\.]+)\./);
      if (urlMatch && urlMatch[1]) {
        const domainCompany = urlMatch[1].replace(/[-_]/g, ' ');
        if (domainCompany.length > 2) {
          return this.capitalizeWords(domainCompany);
        }
      }
    }

    // Try to extract from content
    const companyPatterns = [
      /(?:at|@|company)[:\s]+([A-Za-z\s&]+)/i,
      /(?:hiring\s+at|looking\s+for\s+at)[:\s]+([A-Za-z\s&]+)/i,
      /(?:join\s+us\s+at|work\s+at)[:\s]+([A-Za-z\s&]+)/i,
      /^([A-Za-z\s&]+)\s+(?:is\s+)?(?:hiring|looking|seeking)/i
    ];

    for (const pattern of companyPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim();
        if (company.length > 2 && company.length < 50) {
          return this.capitalizeWords(company);
        }
      }
    }

    // Look for common company indicators
    const companyIndicators = [
      'inc', 'llc', 'corp', 'ltd', 'company', 'technologies', 'solutions', 'systems'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (companyIndicators.includes(words[i + 1])) {
        const potentialCompany = words.slice(Math.max(0, i - 2), i + 2).join(' ');
        if (potentialCompany.length > 3) {
          return this.capitalizeWords(potentialCompany);
        }
      }
    }

    return 'Company Name'; // Default fallback
  }

  /**
   * Extract job description from content
   */
  private static extractJobDescription(content: string): string {
    // Look for common description patterns
    const descriptionPatterns = [
      /(?:description|about\s+the\s+role|job\s+description)[:\s]*([\s\S]+?)(?:\n\n|\n[A-Z][^a-z]|$)/i,
      /(?:we\s+are\s+looking\s+for|we\s+seek|requirements)[:\s]*([\s\S]+?)(?:\n\n|\n[A-Z][^a-z]|$)/i,
      /(?:responsibilities|what\s+you'll\s+do)[:\s]*([\s\S]+?)(?:\n\n|\n[A-Z][^a-z]|$)/i
    ];

    for (const pattern of descriptionPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const description = match[1].trim();
        if (description.length > 50) {
          return this.cleanDescription(description);
        }
      }
    }

    // Fallback: take a substantial portion of the content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 3) {
      const description = lines.slice(1, Math.min(10, lines.length)).join(' ').trim();
      if (description.length > 50) {
        return this.cleanDescription(description);
      }
    }

    return content.substring(0, 500).trim() + (content.length > 500 ? '...' : '');
  }

  /**
   * Clean and format description text
   */
  private static cleanDescription(description: string): string {
    return description
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .substring(0, 2000); // Limit length
  }

  /**
   * Capitalize words in a string
   */
  private static capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validate if the parsed data looks reasonable
   */
  static validateParsedData(data: Partial<TargetJobJson>): boolean {
    return !!(
      data.name && 
      data.name.length > 3 && 
      data.company && 
      data.company.length > 2 && 
      data.description && 
      data.description.length > 20
    );
  }

  /**
   * Get suggestions for improving the parsed data
   */
  static getSuggestions(data: Partial<TargetJobJson>): string[] {
    const suggestions: string[] = [];

    if (!data.name || data.name.length < 5) {
      suggestions.push('Job title seems too short or unclear');
    }

    if (!data.company || data.company === 'Company Name') {
      suggestions.push('Company name could not be detected - please verify');
    }

    if (!data.description || data.description.length < 50) {
      suggestions.push('Job description seems incomplete - consider adding more details');
    }

    if (!data.url || !data.url.startsWith('http')) {
      suggestions.push('Job URL is missing or invalid');
    }

    return suggestions;
  }
}