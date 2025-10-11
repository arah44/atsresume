/**
 * Simple test script for CheerioScraper
 * Tests basic URL fetching and HTML parsing
 */

import { CheerioScraper } from '../../../src/lib/scraper/cheerio-scraper';

async function testGetUrl() {
  console.log('🚀 Testing CheerioScraper with Anti-Blocking Features...\n');

  // Create scraper instance with anti-blocking features
  const scraper = new CheerioScraper({
    timeout: 10000,
    retries: 2,
    rotateUserAgent: true,      // Rotate user agents
    delayBetweenRequests: 1500,  // 1.5 seconds between requests
    randomizeDelay: true,        // Add random variance to delays
  });

  try {
    // Test URL - using example.com as it's reliable and simple
    const testUrl = 'https://www.linkedin.com/jobs/view/4117100335';

    // Test multiple requests to demonstrate rate limiting
    console.log('🔄 Testing rate limiting with multiple requests...\n');

    for (let i = 1; i <= 3; i++) {
      console.log(`📡 Request ${i}/3: Fetching ${testUrl}...`);
      const startTime = Date.now();

      const response = await scraper.fetch(testUrl);

      const elapsed = Date.now() - startTime;
      console.log(`   ✅ Success! (took ${elapsed}ms, status: ${response.statusCode})`);

      if (i === 1) {
        // Only show detailed info on first request
        console.log(`   Content Length: ${response.html.length} characters\n`);

        // Extract metadata
        console.log('   📋 Extracting metadata...');
        const metadata = scraper.extractMetadata(response.html);
        console.log('   Title:', metadata.title);

        // Extract text content
        console.log('\n   📝 Text preview:');
        const text = scraper.extractText(response.html);
        console.log(`   ${text.substring(0, 100)}...\n`);

        // Extract links
        const links = scraper.extractLinks(response.html, testUrl);
        console.log(`   🔗 Found ${links.length} link(s)\n`);
      }
    }

    console.log('\n✨ All tests completed successfully!');
    console.log('\n📊 Anti-blocking features active:');
    console.log('   ✓ Rotating user agents');
    console.log('   ✓ Rate limiting (1.5s ± random variance)');
    console.log('   ✓ Realistic browser headers');
    console.log('   ✓ Exponential backoff on retries');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testGetUrl();

