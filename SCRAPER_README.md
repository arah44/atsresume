# Job Scraper - Clean & Simple

## Overview

A streamlined job scraper that tries Cheerio first (direct HTTP), then falls back to Jina.ai if needed. No external APIs required.

## Architecture

```
JobScraper
├── tryCheerio()     → Direct HTTP with browser headers
├── tryJina()        → Jina.ai proxy as fallback
└── parseJobData()   → LangChain AI extraction
```

**Simple. No providers. No wrappers. Just works.**

## Features

✅ **Cheerio First**: Direct HTTP requests with realistic browser headers
✅ **Jina Fallback**: Automatic fallback to Jina.ai proxy service
✅ **AI Extraction**: LangChain-powered intelligent job data parsing
✅ **Smart Errors**: Helpful error messages with actionable advice
✅ **Parallel Scraping**: Batch process multiple URLs efficiently

## Usage

### Single Job
```typescript
import { JobScraper } from '@/lib/scraper';

const result = await JobScraper.scrapeJob('https://example.com/job/123');

if (result.success) {
  console.log(result.job.name);        // Job title
  console.log(result.job.company);     // Company name
  console.log(result.job.description); // Full description
}
```

### Multiple Jobs
```typescript
const urls = [
  'https://example.com/job/1',
  'https://example.com/job/2'
];

const results = await JobScraper.scrapeMultipleJobs(urls);
```

### API Endpoint
```bash
POST /api/scrape
{
  "urls": ["https://example.com/job/123"]
}
```

## What Gets Extracted

The AI extracts:
- 📌 Job title
- 🏢 Company name
- 📝 Full description
- 🏠 Remote work status
- 🔗 Apply URL (if available)
- ⚡ Easy apply flag (if available)

## Supported Sites

- ✅ Indeed
- ✅ Glassdoor
- ✅ Monster
- ✅ ZipRecruiter
- ✅ Dice
- ✅ Wellfound (AngelList)
- ✅ Greenhouse ATS
- ✅ Lever ATS
- ✅ Company career pages
- ⚠️  LinkedIn (requires manual copy-paste due to anti-bot measures)

## Error Handling

### LinkedIn (HTTP 451)
```
LinkedIn blocks automated scraping.
→ Copy the job content manually
→ Paste into "Raw Job Content" field
→ AI will extract everything
```

### Other Blocks (HTTP 403)
```
Site is blocking scrapers.
→ Try copying content manually
```

## File Structure

```
src/lib/scraper/
├── job-scraper.ts          → Main scraper with Cheerio + Jina
├── cheerio-scraper.ts      → Direct HTTP scraper
├── base-scraper.ts         → Base class (rate limiting, retries, etc.)
├── scraper-provider.ts     → Simple provider interface
└── index.ts                → Exports
```

## Testing

```bash
# Test the scraper
bun run test:scraper

# Test AI extraction
bun run scripts/langchain/test-job-data-extraction.ts
```

## Environment Variables

```bash
# Required for AI extraction
OPENROUTER_API_KEY=your_key_here
```

## How It Works

1. **Try Cheerio**
   - Direct HTTP fetch with browser headers
   - Rate limited (1 req/sec with randomization)
   - 2 retries with exponential backoff

2. **Fallback to Jina**
   - If Cheerio fails, try Jina.ai proxy
   - Uses `https://r.jina.ai/` prefix
   - 30 second timeout

3. **AI Extraction**
   - LangChain parses the HTML
   - Structured output via Zod schema
   - Falls back to regex if AI fails

## Benefits Over Old Architecture

| Before | After |
|--------|-------|
| ❌ Multiple provider wrappers | ✅ Single JobScraper class |
| ❌ Complex inheritance | ✅ Simple composition |
| ❌ GhostGenius dependency | ✅ No external APIs needed |
| ❌ Confusing file structure | ✅ Clean, flat structure |
| ❌ Hard to debug | ✅ Clear flow, better errors |

## Notes

- **No external job APIs required** - everything is self-contained
- **Rate limiting built-in** - respects target sites
- **Smart user-agent rotation** - appears more human-like
- **Automatic retries** - handles transient failures
- **LinkedIn workaround** - manual copy-paste with AI extraction

---

**Simple. Reliable. Self-contained.**

