import { NextRequest, NextResponse } from 'next/server';
import { JobScraper } from '@/lib/scraper/job-scraper/';
import { auth } from '@/lib/auth';
import { getJobRepository, SavedJob } from '@/services/repositories';
import { hash } from '@/utils/hash';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/scrape-jobs
 *
 * Scrape job postings from one or more URLs
 *
 * Request body:
 * {
 *   urls: string[] // Array of job posting URLs
 * }
 *
 * Response: ScrapeResult[] - Raw array of scrape results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    const session = await auth.api.getSession({
      headers: request.headers,
    });


    // Get user ID from session
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

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

    // Check if jobs are already cached
    const jobs: Partial<SavedJob>[] = [];

    const jobRepository = await getJobRepository();
    const jobIds = urls.map(url => hash(url));
    const jobIdsSet = new Set(jobIds);
    const cachedJobs = await jobRepository.findByIds(Array.from(jobIdsSet));

    jobs.push(...cachedJobs);

    const uncachedUrls = urls.filter(url => !cachedJobs.some(job => job.url === url));

    const results = await JobScraper.scrapeMultipleJobs(uncachedUrls);

    console.log(`✅ Scraping complete ${results.length} jobs \n First job name: ${results[0].job?.name}`);




    for (const result of results) {
      if (result.job) {


        const scrapedJob = {
          ...result.job,
          url: result.url || '',
          company: result.job?.company || '',
          description: result.job?.description || '',
          raw_content: result.job?.raw_content || '',
          apply_url: result.job?.apply_url || '',
          is_easy_apply: result.job?.is_easy_apply || false,
          remote_allowed: result.job?.remote_allowed || false,
          name: result.job?.name || '',
        }


        await jobRepository.save(scrapedJob);
        jobs.push(scrapedJob);
      }
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('❌ Scraping error:', error);
    return NextResponse.json(
      { error: 'Internal server error while scraping.' },
      { status: 500 }
    );
  }
}

