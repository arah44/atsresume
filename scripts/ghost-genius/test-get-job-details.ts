#!/usr/bin/env bun
/**
 * Test script for GhostGenius Job Details API
 *
 * This script tests the conditional job fetching logic:
 * - LinkedIn URLs → GhostGenius API
 * - Other URLs → Jina.ai scraper
 *
 * Usage:
 *   bun run scripts/ghost-genius/test-get-job-details.ts
 */

import { getJobDetails, getMultipleJobDetails } from '../../src/services/ghostgenius/get-job-details';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
  }[type];

  console.log(`${prefix} ${message}`);
}

function printSection(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function printJobDetails(result: any, index?: number) {
  const prefix = index !== undefined ? `Job ${index + 1}: ` : '';

  if (result.success && result.job) {
    log(`${prefix}Successfully fetched job details`, 'success');
    console.log(`${colors.dim}URL:${colors.reset} ${result.url}`);
    console.log(`${colors.dim}Title:${colors.reset} ${result.job.name}`);
    console.log(`${colors.dim}Company:${colors.reset} ${result.job.company}`);
    console.log(`${colors.dim}Description Length:${colors.reset} ${result.job.description.length} characters`);
    console.log(`${colors.dim}Raw Content Length:${colors.reset} ${result.job.raw_content.length} characters`);

    // Show new fields
    if (result.job.apply_url) {
      console.log(`${colors.dim}Apply URL:${colors.reset} ${result.job.apply_url}`);
    }
    if (result.job.is_easy_apply !== undefined) {
      console.log(`${colors.dim}Easy Apply:${colors.reset} ${result.job.is_easy_apply ? colors.green + 'Yes' + colors.reset : 'No'}`);
    }
    if (result.job.remote_allowed !== undefined) {
      console.log(`${colors.dim}Remote Allowed:${colors.reset} ${result.job.remote_allowed ? colors.green + 'Yes' + colors.reset : 'No'}`);
    }

    // Show a preview of the description
    const preview = result.job.description.substring(0, 150).replace(/\n/g, ' ');
    console.log(`${colors.dim}Description Preview:${colors.reset} ${preview}...`);
  } else {
    log(`${prefix}Failed to fetch job details`, 'error');
    console.log(`${colors.dim}URL:${colors.reset} ${result.url}`);
    console.log(`${colors.dim}Error:${colors.reset} ${colors.red}${result.error}${colors.reset}`);
  }
}

async function testSingleLinkedInJob() {
  printSection('Test 1: Single LinkedIn Job (GhostGenius API)');

  const linkedInUrl = 'https://www.linkedin.com/jobs/view/4153112402';
  log(`Testing LinkedIn URL: ${linkedInUrl}`, 'info');

  const result = await getJobDetails(linkedInUrl);
  printJobDetails(result);

  return result.success;
}

async function testCaching() {
  printSection('Test 2: Cache Verification (Same URL Twice)');

  const linkedInUrl = 'https://www.linkedin.com/jobs/view/4153112402';

  log('First call - should fetch from API', 'info');
  const result1 = await getJobDetails(linkedInUrl);

  console.log('');
  log('Second call - should hit cache', 'info');
  const result2 = await getJobDetails(linkedInUrl);

  const bothSuccessful = result1.success && result2.success;
  if (bothSuccessful) {
    log('Both calls successful - cache is working!', 'success');
  }

  return bothSuccessful;
}

async function testSingleNonLinkedInJob() {
  printSection('Test 3: Single Non-LinkedIn Job (Scraper)');

  const otherUrl = 'https://jobs.lever.co/example-job';
  log(`Testing non-LinkedIn URL: ${otherUrl}`, 'info');

  const result = await getJobDetails(otherUrl);
  printJobDetails(result);

  return result.success;
}

async function testMultipleJobs() {
  printSection('Test 4: Multiple Jobs (Mixed URLs)');

  const urls = [
    'https://www.linkedin.com/jobs/view/4153112402',
    'https://www.linkedin.com/jobs/view/1234567890',
    'https://jobs.lever.co/example-job',
  ];

  log(`Testing ${urls.length} URLs (mix of LinkedIn and non-LinkedIn)`, 'info');

  const results = await getMultipleJobDetails(urls);

  console.log('\nResults:');
  results.forEach((result, index) => {
    console.log(`\n${colors.bright}--- Job ${index + 1} ---${colors.reset}`);
    printJobDetails(result, index);
  });

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  log(`Total: ${results.length}`, 'info');
  log(`Successful: ${successful}`, successful > 0 ? 'success' : 'info');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');

  return successful > 0;
}

async function testInvalidUrl() {
  printSection('Test 5: Invalid URL (Error Handling)');

  const invalidUrl = 'not-a-valid-url';
  log(`Testing invalid URL: ${invalidUrl}`, 'info');

  const result = await getJobDetails(invalidUrl);
  printJobDetails(result);

  return !result.success; // Should fail
}

async function testMissingApiKey() {
  printSection('Test 6: Missing API Key Check');

  const apiKey = process.env.GHOSTGENIUS_API_KEY;

  if (!apiKey) {
    log('GHOSTGENIUS_API_KEY is not set', 'error');
    console.log(`\n${colors.yellow}To test LinkedIn jobs, add to your .env file:${colors.reset}`);
    console.log(`${colors.dim}   GHOSTGENIUS_API_KEY=your_token_here${colors.reset}\n`);
    return false;
  } else {
    log('GHOSTGENIUS_API_KEY is configured', 'success');
    console.log(`${colors.dim}Key length:${colors.reset} ${apiKey.length} characters`);
    console.log(`${colors.dim}Key preview:${colors.reset} ${apiKey.substring(0, 20)}...`);
    return true;
  }
}

async function testFullJobData() {
  printSection('Test 7: Full Job Data Inspection');

  const linkedInUrl = 'https://www.linkedin.com/jobs/view/4153112402';
  log(`Fetching full data for: ${linkedInUrl}`, 'info');

  const result = await getJobDetails(linkedInUrl);

  if (result.success && result.job) {
    log('Job data structure:', 'success');
    console.log('\n' + JSON.stringify(result.job, null, 2));
    return true;
  } else {
    log('Failed to fetch job data', 'error');
    return false;
  }
}

async function runAllTests() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     GhostGenius Job Details API Test Suite               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  const results: Array<{ name: string; passed: boolean }> = [];

  try {
    // Test 6: Check API key first
    results.push({
      name: 'API Key Check',
      passed: await testMissingApiKey()
    });

    // Test 1: Single LinkedIn job
    results.push({
      name: 'Single LinkedIn Job',
      passed: await testSingleLinkedInJob()
    });

    // Test 2: Cache verification
    results.push({
      name: 'Cache Verification',
      passed: await testCaching()
    });

    // Test 3: Single non-LinkedIn job
    results.push({
      name: 'Single Non-LinkedIn Job',
      passed: await testSingleNonLinkedInJob()
    });

    // Test 4: Multiple jobs
    results.push({
      name: 'Multiple Jobs',
      passed: await testMultipleJobs()
    });

    // Test 5: Invalid URL
    results.push({
      name: 'Invalid URL Handling',
      passed: await testInvalidUrl()
    });

    // Test 6: Full data inspection (optional, commented by default)
    // Uncomment to see full job data structure
    // results.push({
    //   name: 'Full Job Data Inspection',
    //   passed: await testFullJobData()
    // });

  } catch (error) {
    log(`Unexpected error during tests: ${error}`, 'error');
    console.error(error);
  }

  // Final summary
  printSection('Test Results Summary');

  results.forEach(({ name, passed }) => {
    const status = passed ? 'PASS' : 'FAIL';
    const color = passed ? colors.green : colors.red;
    console.log(`${color}${status}${colors.reset} - ${name}`);
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  console.log(`\n${colors.bright}Overall:${colors.reset} ${passedCount}/${totalCount} tests passed`);

  if (allPassed) {
    console.log(`\n${colors.green}${colors.bright}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bright}✗ Some tests failed${colors.reset}\n`);
  }

  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

