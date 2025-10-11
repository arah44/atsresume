/**
 * Test script for LangChain-based job data extraction
 *
 * Usage:
 *   bun run scripts/langchain/test-job-data-extraction.ts
 */

import { JobDataParser } from '@/services/jobDataParser';

// Sample job posting content
const sampleJobPosting = `
Senior Software Engineer - Full Stack

Company: TechCorp Solutions

Location: Remote (US Only)

About the Role:
We're looking for a Senior Full Stack Software Engineer to join our growing team.
In this role, you'll be responsible for designing, developing, and maintaining our
web applications using modern technologies.

Responsibilities:
- Design and implement scalable web applications using React and Node.js
- Collaborate with cross-functional teams to define and ship new features
- Write clean, maintainable code following best practices
- Mentor junior developers and conduct code reviews
- Participate in architecture decisions and technical planning

Requirements:
- 5+ years of experience in full-stack web development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with cloud platforms (AWS, GCP, or Azure)
- Excellent communication and teamwork skills
- Bachelor's degree in Computer Science or related field (or equivalent experience)

Nice to Have:
- Experience with microservices architecture
- Knowledge of containerization (Docker, Kubernetes)
- Contributions to open-source projects
- Experience with CI/CD pipelines

What We Offer:
- Competitive salary ($130k - $180k based on experience)
- 100% remote work
- Health, dental, and vision insurance
- 401(k) with company match
- Unlimited PTO
- Professional development budget

Apply now through our careers page or send your resume to careers@techcorp.com
LinkedIn Easy Apply available!
`;

const sampleJobUrl = 'https://careers.techcorp.com/jobs/senior-software-engineer';

async function testJobDataExtraction() {
  console.log('🧪 Testing LangChain-based Job Data Extraction\n');
  console.log('=' .repeat(80));
  console.log('\n📄 Sample Job Posting:\n');
  console.log(sampleJobPosting);
  console.log('\n' + '=' .repeat(80));

  try {
    console.log('\n🔄 Extracting job data using LangChain...\n');

    const startTime = Date.now();
    const extractedData = await JobDataParser.parseRawJobData(
      sampleJobPosting,
      sampleJobUrl
    );
    const endTime = Date.now();

    console.log('✅ Extraction completed successfully!\n');
    console.log('⏱️  Time taken:', (endTime - startTime) / 1000, 'seconds\n');
    console.log('=' .repeat(80));
    console.log('\n📊 Extracted Data:\n');
    console.log(JSON.stringify(extractedData, null, 2));
    console.log('\n' + '=' .repeat(80));

    // Validate the extracted data
    console.log('\n🔍 Validation:\n');
    const isValid = JobDataParser.validateParsedData(extractedData);
    console.log('Valid:', isValid ? '✅ Yes' : '❌ No');

    if (!isValid) {
      const suggestions = JobDataParser.getSuggestions(extractedData);
      console.log('\n💡 Suggestions:');
      suggestions.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion}`);
      });
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n✨ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error during extraction:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testJobDataExtraction();

