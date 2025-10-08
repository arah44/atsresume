import { NextRequest, NextResponse } from 'next/server';
import { ScrapeResult } from '@/services/jobScraper';
import { getMultipleJobDetails } from '@/services/ghostgenius/get-job-details';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/scrape
 *
 * Scrape job postings from one or more URLs
 *
 * Request body:
 * {
 *   urls: string[] // Array of job posting URLs
 * }
 *
 * Response:
 * {
 *   results: ScrapeResult[]
 *   summary: {
 *     total: number
 *     successful: number
 *     failed: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    // Validate input
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Invalid request. "urls" must be an array of URLs.' },
        { status: 400 }
      );
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one URL is required.' },
        { status: 400 }
      );
    }

    // Limit the number of URLs to prevent abuse
    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed per request.' },
        { status: 400 }
      );
    }

    // Validate that all items are strings
    if (!urls.every(url => typeof url === 'string')) {
      return NextResponse.json(
        { error: 'All URLs must be strings.' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting scrape for ${urls.length} URL(s)`);

    // Fetch job details (uses GhostGenius API for LinkedIn, scraper for others)
    const results = await getMultipleJobDetails(urls);

    // Calculate summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    console.log(`✅ Scraping complete: ${summary.successful} successful, ${summary.failed} failed`);

    return NextResponse.json({
      results,
      summary
    });
  } catch (error) {
    console.error('❌ Scraping error:', error);
    return NextResponse.json(
      { error: 'Internal server error while scraping.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape
 *
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    name: 'Job Scraper API',
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'Scrape job postings from URLs',
        body: {
          urls: 'string[] - Array of job posting URLs (max 10)'
        },
        example: {
          urls: [
            'https://example.com/job/1',
            'https://example.com/job/2'
          ]
        }
      }
    },
    supportedJobBoards: [
      'LinkedIn (via GhostGenius API)',
      'Indeed',
      'Glassdoor',
      'Monster',
      'ZipRecruiter',
      'Dice',
      'Wellfound',
      'Greenhouse',
      'Lever',
      'Generic job posting pages'
    ]
  });
}

