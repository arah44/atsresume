/**
 * Test script for the simplified job scraper
 *
 * Usage:
 *   bun run scripts/test-job-scraper.ts
 */

import { JobScraper } from "../src/lib/scraper";

async function testScraper() {
  console.log('🧪 Testing Simplified Job Scraper\n');
  console.log('=' .repeat(80));

  // Test URL (non-LinkedIn to avoid 451 errors)
  const testUrl = 'https://www.linkedin.com/jobs/view/4307639711/';

  console.log(`\n📍 Scraping: ${testUrl}\n`);
  console.log('Strategy: Try Cheerio first, fallback to Jina if needed\n');
  console.log('-' .repeat(80));

  try {
    const startTime = Date.now();
    const result = await JobScraper.scrapeJob(testUrl);
    const endTime = Date.now();

    console.log(`\n⏱️  Time: ${(endTime - startTime) / 1000}s`);

    if (result.success && result.job) {
      console.log('\n✅ SUCCESS!\n');
      console.log('Extracted Job Data:');
      console.log('━' .repeat(80));
      console.log(`📌 Title: ${result.job.name}`);
      console.log(`🏢 Company: ${result.job.company}`);
      console.log(`🏠 Remote: ${result.job.remote_allowed ?? 'Unknown'}`);
      console.log(`📝 Description: ${result.job.description.substring(0, 200)}...`);

      if (result.job.apply_url) {
        console.log(`🔗 Apply URL: ${result.job.apply_url}`);
      }
      if (result.job.is_easy_apply) {
        console.log(`⚡ Easy Apply: Yes`);
      }

      console.log('━' .repeat(80));
    } else {
      console.log('\n❌ FAILED\n');
      console.log('Error:', result.error);

      if (result.error?.includes('LinkedIn')) {
        console.log('\n💡 Tip: For LinkedIn jobs, copy the content manually and use the AI extraction feature.');
      }
    }

  } catch (error) {
    console.log('\n❌ UNEXPECTED ERROR\n');
    console.error(error);
  }

  console.log('\n' + '=' .repeat(80));
  console.log('\n✨ Test complete!\n');
}

// Run the test
testScraper().catch(console.error);

