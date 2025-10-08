'use server';

import { extractPersonFromPdf } from '@/services/openai/pdfParser';
import { Person } from '@/types';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');

/**
 * Server action: Extract resume data from PDF using OpenAI Responses API
 *
 * @param base64Pdf - Base64 encoded PDF data
 * @param fileName - Original filename
 * @returns Extracted Person data or error
 */
export async function extractResumeFromPdf(
  base64Pdf: string,
  fileName: string
): Promise<{ success: boolean; data?: Person; error?: string }> {
  try {
    console.log('📄 Starting PDF extraction:', fileName);

    // Validate input
    if (!base64Pdf || base64Pdf.length === 0) {
      return {
        success: false,
        error: 'Invalid PDF data'
      };
    }

    // Generate cache key
    const hash = crypto.createHash('md5').update(base64Pdf).digest('hex');
    const cacheKey = `pdf-extract-${hash}`;
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

    // Check cache
    if (fs.existsSync(cacheFile)) {
      console.log('✅ Found cached extraction:', cacheKey);
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      return { success: true, data: cached };
    }

    // Extract using OpenAI service
    const extracted = await extractPersonFromPdf(base64Pdf, fileName);

    console.log('   - Name:', extracted.name);
    console.log('   - Content length:', extracted.raw_content.length, 'chars');

    // Cache result
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(cacheFile, JSON.stringify(extracted, null, 2));
    console.log('💾 Cached extraction:', cacheKey);

    return {
      success: true,
      data: extracted,
    };
  } catch (error) {
    console.error('❌ PDF extraction error:', error);

    let errorMessage = 'Failed to extract resume from PDF';

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.';
      } else if (error.message.includes('name')) {
        errorMessage = error.message;
      } else if (error.message.includes('too short') || error.message.includes('image-based')) {
        errorMessage = 'PDF appears to be image-based. Please use "Paste Text" instead.';
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        errorMessage = 'AI had trouble reading the PDF. Please try "Paste Text" option.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}


