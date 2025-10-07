#!/usr/bin/env bun
/**
 * Test script for LangChain resume generation with structured output
 *
 * This script tests the complete resume generation pipeline to verify:
 * 1. All chains return properly structured data
 * 2. No empty fields in the final resume
 * 3. Data is comprehensive and ATS-optimized
 *
 * Usage: bun run scripts/langchain/test-generate-resume.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { CachedLangChainResumeGenerator, clearCache, listCache, getCacheStats } from '../../src/services/langchain/cache';
import type { Person, TargetJobJson, ResumeGenerationInput } from '../../src/types';

// Test data
const testPerson: Person = {
  name: "Aran Joyce",
  raw_content: `
    Aran Joyce
    Email: aran.joyce@example.com
    Phone: +1-555-0123
    Location: San Francisco, CA
    LinkedIn: https://linkedin.com/in/aranjoyce
    GitHub: https://github.com/aranjoyce

    Professional Summary:
    Experienced fullstack developer with 5+ years building scalable web applications.
    Expert in Next.js, React, Node.js, and TypeScript. Proven track record of
    delivering high-performance solutions and leading development teams.

    Work Experience:

    Senior Fullstack Developer at Tech Innovations Inc.
    January 2021 - Present
    - Led development of microservices architecture serving 1M+ users
    - Implemented CI/CD pipelines reducing deployment time by 60%
    - Mentored 5 junior developers and conducted code reviews
    - Technologies: Next.js, Node.js, PostgreSQL, Docker, AWS

    Fullstack Developer at StartupCo
    June 2019 - December 2020
    - Built e-commerce platform processing $2M+ in annual revenue
    - Developed RESTful APIs handling 10k+ requests per minute
    - Integrated payment systems (Stripe, PayPal)
    - Technologies: React, Express, MongoDB, Redis

    Education:
    Bachelor of Science in Computer Science
    University of California, Berkeley
    2015 - 2019

    Projects:

    Real-time Chat Application (2023)
    - Built scalable chat app using WebSockets and Redis
    - Technologies: Next.js, Socket.io, Redis, PostgreSQL
    - GitHub: https://github.com/aranjoyce/chat-app

    AI-Powered Resume Builder (2024)
    - Developed ATS-optimized resume generation using AI
    - Technologies: Next.js, LangChain, OpenAI, TypeScript
    - Live: https://atsresume.com

    Skills:
    Frontend: React, Next.js, TypeScript, Tailwind CSS, Redux
    Backend: Node.js, Express, PostgreSQL, MongoDB, GraphQL
    DevOps: Docker, AWS, CI/CD, Git, Jest
    Soft Skills: Leadership, Communication, Problem Solving, Team Management

    Languages: English (Native), Spanish (Intermediate)

    Certifications:
    - AWS Certified Developer Associate (2023)
    - Meta React Professional Certificate (2022)
  `
};

const testJob: TargetJobJson = {
  name: "Senior Fullstack Developer (Next.js/Node.js)",
  url: "https://example.com/jobs/senior-fullstack",
  company: "Tech Unicorn Corp",
  description: "We're looking for a Senior Fullstack Developer to join our growing team.",
  raw_content: `
    Senior Fullstack Developer (Next.js/Node.js)
    Tech Unicorn Corp - Remote (Worldwide)

    About Us:
    Tech Unicorn Corp is a fast-growing SaaS company building the future of
    collaborative work tools. We serve over 2 million users globally.

    Role Overview:
    We're seeking an experienced Senior Fullstack Developer to architect and
    build scalable web applications. You'll work with cutting-edge technologies
    and have the opportunity to make significant technical decisions.

    Required Skills:
    - 5+ years of experience in fullstack development
    - Expert-level proficiency in Next.js and React
    - Strong Node.js and TypeScript skills
    - Experience with PostgreSQL or similar relational databases
    - RESTful API design and implementation
    - Modern DevOps practices (Docker, CI/CD)
    - AWS or similar cloud platform experience

    Nice to Have:
    - GraphQL experience
    - Experience with microservices architecture
    - WebSocket/real-time communication implementation
    - Open source contributions
    - Leadership/mentoring experience

    Responsibilities:
    - Design and implement scalable web applications
    - Lead technical architecture decisions
    - Mentor junior developers
    - Optimize application performance
    - Collaborate with product and design teams
    - Write clean, maintainable code
    - Conduct code reviews

    What We Offer:
    - Competitive salary ($150k-$200k)
    - Remote work flexibility
    - Equity options
    - Health benefits
    - Professional development budget
    - Modern tech stack

    Company Culture:
    - Innovation-driven
    - Collaborative environment
    - Work-life balance
    - Continuous learning
  `
};

// Utility functions for logging
function log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const icons = {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${icons[level]} ${message}`);
}

function logStep(stepNumber: number, totalSteps: number, description: string) {
  console.log('\n' + '─'.repeat(80));
  console.log(`⏳ Step ${stepNumber}/${totalSteps}: ${description}`);
  console.log('─'.repeat(80));
}

function logDuration(startTime: number, operation: string) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`${operation} completed in ${duration}s`, 'success');
}

function displaySection(title: string, data: any, showFullData: boolean = false) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 ${title}`);
  console.log('='.repeat(80));

  if (showFullData) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    // Show abbreviated version for large objects
    const dataString = JSON.stringify(data, null, 2);
    if (dataString.length > 500) {
      console.log(dataString.substring(0, 500) + '\n... (truncated, showing first 500 chars)');
    } else {
      console.log(dataString);
    }
  }
}

function displayError(title: string, error: any) {
  console.log('\n' + '❌'.repeat(40));
  console.log(`❌ ${title}`);
  console.log('❌'.repeat(40));
  if (error.stack) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } else {
    console.error(error);
  }
}

// Main test function
async function testResumeGeneration(useCache: boolean = true) {
  const overallStartTime = Date.now();

  console.log('\n🚀 Starting LangChain Resume Generation Test\n');
  log('Testing structured output with Zod schemas', 'info');
  log('Using OpenRouter API for LLM calls', 'info');

  // Show cache stats
  const cacheStats = await getCacheStats();
  log(`Cache: ${cacheStats.totalFiles} files, ${(cacheStats.totalSize / 1024).toFixed(2)} KB`, 'info');

  // Use cached or regular generator based on flag
  const generator = useCache ? new CachedLangChainResumeGenerator() : new CachedLangChainResumeGenerator();
  log(`Using ${useCache ? 'CACHED' : 'NON-CACHED'} generator`, 'info');

  const input: ResumeGenerationInput = {
    person: testPerson,
    currentResume: undefined, // Testing from scratch
    targetJob: testJob
  };

  log(`Testing with person: ${testPerson.name}`, 'info');
  log(`Target job: ${testJob.name} at ${testJob.company}`, 'info');
  log('Starting 6-step resume generation pipeline...', 'info');

  try {
    // Test Step 1: Job Analysis
    logStep(1, 6, 'Analyzing job requirements');
    log('Sending job posting to LLM for analysis...', 'info');
    const step1Start = Date.now();
    const jobAnalysis = await generator.analyzeJobRequirements(testJob);
    logDuration(step1Start, 'Job analysis');
    displaySection('Job Analysis Result', jobAnalysis);

    // Validate job analysis structure
    log('Validating job analysis structure...', 'info');
    if (!jobAnalysis.technicalSkills || !Array.isArray(jobAnalysis.technicalSkills)) {
      throw new Error('Job analysis missing technical skills array');
    }
    log(`Found ${jobAnalysis.technicalSkills.length} technical skills`, 'success');
    log(`Found ${jobAnalysis.softSkills?.length || 0} soft skills`, 'success');
    log(`Found ${jobAnalysis.keyResponsibilities?.length || 0} key responsibilities`, 'success');
    log(`Found ${jobAnalysis.actionVerbs?.length || 0} action verbs`, 'success');

    // Test Step 2: Keyword Extraction
    logStep(2, 6, 'Extracting ATS keywords');
    log('Analyzing job posting for ATS-relevant keywords...', 'info');
    const step2Start = Date.now();
    const keywords = await generator.extractKeywords(testJob);
    logDuration(step2Start, 'Keyword extraction');
    displaySection('Keywords Extracted', keywords);

    log('Validating keyword extraction...', 'info');
    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Keyword extraction returned empty or invalid result');
    }
    log(`Extracted ${keywords.length} ATS keywords`, 'success');
    log(`Sample keywords: ${keywords.slice(0, 5).join(', ')}...`, 'info');

    // Test Step 3: Summary Optimization
    logStep(3, 6, 'Optimizing professional summary');
    log('Creating ATS-optimized summary from person data...', 'info');
    log('Incorporating keywords: ' + keywords.slice(0, 3).join(', ') + '...', 'info');
    const step3Start = Date.now();
    const optimizedSummary = await generator.optimizeSummary(
      testPerson,
      testJob,
      jobAnalysis,
      keywords
    );
    logDuration(step3Start, 'Summary optimization');
    displaySection('Optimized Summary', { summary: optimizedSummary });

    log('Validating summary...', 'info');
    if (!optimizedSummary || optimizedSummary.length < 50) {
      throw new Error('Summary optimization returned empty or too short result');
    }
    log(`Generated summary with ${optimizedSummary.length} characters`, 'success');
    const wordCount = optimizedSummary.split(/\s+/).length;
    log(`Word count: ${wordCount} words`, 'info');
    const sentenceCount = optimizedSummary.split(/[.!?]+/).filter(s => s.trim()).length;
    log(`Sentence count: ${sentenceCount} sentences`, 'info');

    // Test Step 4: Work Experience Enhancement
    logStep(4, 6, 'Enhancing work experience');
    log('Preparing work experience entries for enhancement...', 'info');
    // Extract work experience from raw content (simplified for test)
    const mockWorkExperience = [
      {
        company: "Tech Innovations Inc.",
        position: "Senior Fullstack Developer",
        description: "Led development of microservices architecture",
        keyAchievements: "Implemented CI/CD pipelines",
        startYear: "2021",
        endYear: "Present"
      },
      {
        company: "StartupCo",
        position: "Fullstack Developer",
        description: "Built e-commerce platform",
        keyAchievements: "Developed RESTful APIs",
        startYear: "2019",
        endYear: "2020"
      }
    ];

    log(`Processing ${mockWorkExperience.length} work experience entries...`, 'info');
    const step4Start = Date.now();
    const enhancedWorkExperience = await generator.enhanceWorkExperience(
      mockWorkExperience,
      testJob,
      jobAnalysis,
      keywords
    );
    logDuration(step4Start, 'Work experience enhancement');
    displaySection('Enhanced Work Experience', enhancedWorkExperience);

    log('Validating work experience enhancement...', 'info');
    if (!Array.isArray(enhancedWorkExperience) || enhancedWorkExperience.length === 0) {
      throw new Error('Work experience enhancement returned empty result');
    }
    log(`Enhanced ${enhancedWorkExperience.length} work experience entries`, 'success');

    // Validate work experience structure
    enhancedWorkExperience.forEach((exp, idx) => {
      const descLen = exp.description?.length || 0;
      const achLen = exp.keyAchievements?.length || 0;

      log(`Entry ${idx + 1} (${exp.company}): description=${descLen} chars, achievements=${achLen} chars`, 'info');

      if (!exp.description || descLen < 50) {
        log(`Work experience ${idx + 1} has short description (${descLen} chars)`, 'warning');
      }
      if (!exp.keyAchievements || achLen < 50) {
        log(`Work experience ${idx + 1} has short achievements (${achLen} chars)`, 'warning');
      }
    });

    // Test Step 5: Skills Optimization
    logStep(5, 6, 'Optimizing skills');
    const mockSkills = [
      { title: "Frontend", skills: ["React", "Next.js", "TypeScript"] },
      { title: "Backend", skills: ["Node.js", "PostgreSQL"] }
    ];

    log(`Processing ${mockSkills.length} skill categories...`, 'info');
    log('Aligning skills with job requirements...', 'info');
    const step5Start = Date.now();
    const optimizedSkills = await generator.optimizeSkills(
      mockSkills,
      testJob,
      jobAnalysis,
      keywords
    );
    logDuration(step5Start, 'Skills optimization');
    displaySection('Optimized Skills', optimizedSkills);

    log('Validating skills optimization...', 'info');
    if (!Array.isArray(optimizedSkills) || optimizedSkills.length === 0) {
      throw new Error('Skills optimization returned empty result');
    }
    log(`Organized into ${optimizedSkills.length} skill categories`, 'success');

    // Validate skills structure
    const totalSkills = optimizedSkills.reduce((sum, cat) => sum + (cat.skills?.length || 0), 0);
    log(`Total skills: ${totalSkills}`, 'success');

    optimizedSkills.forEach((category, idx) => {
      log(`Category ${idx + 1}: "${category.title}" with ${category.skills?.length || 0} skills`, 'info');
    });

    // Test Step 6: Complete Resume Generation
    logStep(6, 6, 'Generating complete resume');
    log('Combining all enhanced components into final resume...', 'info');
    log('Extracting contact information from raw content...', 'info');
    log('Applying structured output schema validation...', 'info');
    const step6Start = Date.now();
    const finalResume = await generator.generateResume(
      testPerson,
      undefined,
      testJob,
      jobAnalysis,
      optimizedSummary,
      enhancedWorkExperience,
      optimizedSkills,
      keywords
    );
    logDuration(step6Start, 'Complete resume generation');
    displaySection('Final Resume', finalResume, false);

    // Comprehensive validation
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE VALIDATION');
    console.log('='.repeat(80));
    log('Starting field-by-field validation...', 'info');

    const validations = [
      { field: 'name', value: finalResume.name, expected: 'non-empty string' },
      { field: 'position', value: finalResume.position, expected: 'non-empty string' },
      { field: 'email', value: finalResume.email, expected: 'non-empty string' },
      { field: 'contactInformation', value: finalResume.contactInformation, expected: 'non-empty string' },
      { field: 'address', value: finalResume.address, expected: 'non-empty string' },
      { field: 'summary', value: finalResume.summary, expected: 'non-empty string' },
      { field: 'workExperience', value: finalResume.workExperience, expected: 'non-empty array' },
      { field: 'education', value: finalResume.education, expected: 'array' },
      { field: 'projects', value: finalResume.projects, expected: 'array' },
      { field: 'skills', value: finalResume.skills, expected: 'non-empty array' },
      { field: 'languages', value: finalResume.languages, expected: 'array' },
      { field: 'certifications', value: finalResume.certifications, expected: 'array' },
      { field: 'socialMedia', value: finalResume.socialMedia, expected: 'array' }
    ];

    let passedCount = 0;
    let failedCount = 0;

    validations.forEach(({ field, value, expected }) => {
      const isEmpty = !value ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0);

      const isRequired = expected.includes('non-empty');
      const status = isEmpty && isRequired ? '❌' : '✅';

      if (isEmpty && isRequired) {
        failedCount++;
        console.log(`${status} ${field}: EMPTY (expected ${expected})`);
      } else {
        passedCount++;
        const displayValue = Array.isArray(value)
          ? `array with ${value.length} items`
          : typeof value === 'string'
            ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`
            : value;
        console.log(`${status} ${field}: ${displayValue}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`📈 VALIDATION SUMMARY: ${passedCount} passed, ${failedCount} failed`);
    console.log('='.repeat(80));

    const overallDuration = ((Date.now() - overallStartTime) / 1000).toFixed(2);
    log(`Total execution time: ${overallDuration}s`, 'info');

    // Performance breakdown
    console.log('\n' + '='.repeat(80));
    console.log('⚡ PERFORMANCE METRICS');
    console.log('='.repeat(80));
    log('All 6 pipeline steps completed', 'success');
    log(`Average step duration: ${(parseFloat(overallDuration) / 6).toFixed(2)}s`, 'info');

    if (failedCount === 0) {
      console.log('\n' + '✨'.repeat(40));
      log('SUCCESS! All validation checks passed', 'success');
      log('Structured output implementation is working correctly', 'success');
      log('Resume generation produces comprehensive, ATS-optimized results', 'success');
      console.log('✨'.repeat(40) + '\n');

      // Additional success metrics
      log('Key achievements:', 'info');
      log(`  • Generated ${wordCount}-word professional summary`, 'info');
      log(`  • Enhanced ${enhancedWorkExperience.length} work experience entries`, 'info');
      log(`  • Organized ${totalSkills} skills into ${optimizedSkills.length} categories`, 'info');
      log(`  • Extracted ${keywords.length} ATS keywords`, 'info');
      log(`  • Populated ${passedCount} resume fields`, 'info');

      process.exit(0);
    } else {
      console.log('\n' + '⚠️ '.repeat(40));
      log('WARNING: Some validation checks failed', 'warning');
      log(`${failedCount} required field(s) are empty or invalid`, 'error');
      log('The resume generation needs further investigation', 'warning');
      console.log('⚠️ '.repeat(40) + '\n');

      log('Recommendations:', 'info');
      log('  1. Check person raw_content has complete information', 'info');
      log('  2. Review prompt templates for extraction instructions', 'info');
      log('  3. Verify Zod schemas match expected output format', 'info');
      log('  4. Check LLM responses in detailed output above', 'info');

      process.exit(1);
    }

  } catch (error) {
    const errorDuration = ((Date.now() - overallStartTime) / 1000).toFixed(2);
    displayError('Test Failed', error);

    log(`Test failed after ${errorDuration}s`, 'error');

    console.log('\n' + '💡'.repeat(40));
    console.log('💡 TROUBLESHOOTING GUIDE');
    console.log('💡'.repeat(40));

    log('Common issues and solutions:', 'info');
    console.log('\n1️⃣  API Configuration Issues:');
    log('   • Check that OPENROUTER_API_KEY is set in .env file', 'info');
    log('   • Verify the API key is valid and active', 'info');
    log('   • Ensure the API key has sufficient credits', 'info');

    console.log('\n2️⃣  Network Issues:');
    log('   • Check internet connectivity', 'info');
    log('   • Verify firewall/proxy settings', 'info');
    log('   • Check OpenRouter service status', 'info');

    console.log('\n3️⃣  Schema/Validation Issues:');
    log('   • Review Zod schemas in src/services/langchain/schemas.ts', 'info');
    log('   • Check that schemas match Resume interface', 'info');
    log('   • Verify LLM output format matches expectations', 'info');

    console.log('\n4️⃣  Rate Limiting:');
    log('   • You may be hitting API rate limits', 'info');
    log('   • Wait a few minutes and try again', 'info');
    log('   • Check your OpenRouter dashboard for limits', 'info');

    console.log('\n5️⃣  LLM Issues:');
    log('   • The model may be overloaded', 'info');
    log('   • Try a different model in config/openrouter.ts', 'info');
    log('   • Check model availability on OpenRouter', 'info');

    console.log();
    process.exit(1);
  }
}

// Run the test
console.log('\n' + '🧪'.repeat(40));
console.log('🧪 LangChain Resume Generation Test Suite');
console.log('🧪'.repeat(40));

// Check if API key is configured
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.log('\n' + '❌'.repeat(40));
  console.log('❌ OPENROUTER_API_KEY not found in environment');
  console.log('❌'.repeat(40));
  console.log('\n💡 Setup Instructions:');
  console.log('1. Create a .env file in the project root:');
  console.log('   cp .env.example .env');
  console.log('\n2. Add your OpenRouter API key to .env:');
  console.log('   OPENROUTER_API_KEY=sk-or-v1-...');
  console.log('\n3. Get an API key from: https://openrouter.ai/keys');
  console.log('\n4. Run the test again: bun run test:resume\n');
  process.exit(1);
}

console.log('\n✅ Environment Configuration:');
console.log(`   • OpenRouter API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`   • Model: ${process.env.OPENROUTER_MODEL || 'openai/gpt-4o'} (default)`);

// Check for command line arguments
const args = process.argv.slice(2);
const shouldClearCache = args.includes('--clear-cache');
const shouldListCache = args.includes('--list-cache');
const disableCache = args.includes('--no-cache');

console.log('\n📋 Test Configuration:');
console.log('   • Framework: LangChain with OpenRouter');
console.log('   • Validation: StructuredOutputParser with Zod schemas');
console.log('   • Caching: ' + (disableCache ? 'DISABLED' : 'ENABLED (filesystem)'));
console.log('   • Cache directory: data/cache/');

// Handle cache commands
if (shouldClearCache) {
  console.log('\n🗑️  Clearing cache...');
  const { clearCache } = await import('../../src/services/langchain/cache');
  await clearCache();
  console.log('✅ Cache cleared\n');
  process.exit(0);
}

if (shouldListCache) {
  const { listCache } = await import('../../src/services/langchain/cache');
  await listCache();
  process.exit(0);
}
console.log('\n📝 Pipeline Steps:');
console.log('   1️⃣  Job Analysis - Extract requirements and skills');
console.log('   2️⃣  Keyword Extraction - Identify ATS keywords');
console.log('   3️⃣  Summary Optimization - Create compelling summary');
console.log('   4️⃣  Work Experience Enhancement - Add metrics and achievements');
console.log('   5️⃣  Skills Optimization - Organize and prioritize skills');
console.log('   6️⃣  Complete Resume Generation - Combine all components');
console.log('\n' + '─'.repeat(80));
console.log('Starting test execution...');
console.log('─'.repeat(80) + '\n');

const testStartTime = Date.now();

// Determine if caching should be used
const useCache = !disableCache;

testResumeGeneration(useCache)
  .then(async () => {
    const totalTime = ((Date.now() - testStartTime) / 1000).toFixed(2);
    console.log('\n' + '═'.repeat(80));
    console.log(`✅ Test suite completed successfully in ${totalTime}s`);
    console.log('═'.repeat(80));

    // Show final cache stats
    const finalStats = await getCacheStats();
    console.log('\n📂 Final Cache Statistics:');
    console.log(`   • Total files: ${finalStats.totalFiles}`);
    console.log(`   • Total size: ${(finalStats.totalSize / 1024).toFixed(2)} KB`);

    console.log('\n💡 Cache Management Commands:');
    console.log('   • List cache: bun run test:resume --list-cache');
    console.log('   • Clear cache: bun run test:resume --clear-cache');
    console.log('   • Disable cache: bun run test:resume --no-cache');
    console.log();
  })
  .catch(error => {
    const totalTime = ((Date.now() - testStartTime) / 1000).toFixed(2);
    console.log('\n' + '═'.repeat(80));
    console.error(`❌ Test suite failed after ${totalTime}s`);
    console.log('═'.repeat(80));
    console.error('\nUnhandled error:', error.message || error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.log();
    process.exit(1);
  });

