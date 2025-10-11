import { TargetJobJson } from '../../../types';
import { runChain } from "@/services/langchain/"
import { jobDataExtractionChain, jobDataExtractionParser } from '@/services/langchain/chains';
import type { JobDataExtraction } from '@/services/langchain/schemas';

export class JobDataParser {
  /**
   * Parse raw job posting content and extract structured data using LangChain
   */
  async parseRawJobData(rawContent: string, url: string = ''): Promise<Partial<TargetJobJson>> {
    try {
      // Use LangChain to extract structured data from raw content
      const chain = jobDataExtractionChain();
      const extractedData = await chain.invoke({
        rawContent,
        url: url || '',
        format_instructions: jobDataExtractionParser.getFormatInstructions()
      }) as JobDataExtraction;

      // Map the extracted data to TargetJobJson format
      return {
        name: extractedData.jobTitle,
        company: extractedData.companyName,
        url: url,
        description: extractedData.jobDescription,
        raw_content: rawContent,
        remote_allowed: extractedData.remoteAllowed || false,
        apply_url: extractedData.applyUrl || '',
        is_easy_apply: extractedData.isEasyApply || false
      };
    } catch (error) {
      console.error('Error parsing job data with LangChain:', error);
      throw error;
    }
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