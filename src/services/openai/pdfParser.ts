import { getOpenAIClient, OPENAI_CONFIG } from './config';
import { Person } from '@/types';

/**
 * Extract resume data from PDF using OpenAI's Responses API
 *
 * OpenAI's Responses API can read PDFs natively - it extracts text
 * and also processes images of each page for diagrams/charts
 *
 * @param base64Pdf - Base64 encoded PDF data
 * @param fileName - Original filename
 * @returns Extracted Person data
 */
export async function extractPersonFromPdf(
  base64Pdf: string,
  fileName: string
): Promise<Person> {
  const client = getOpenAIClient();

  console.log(`📄 Extracting resume from ${fileName} using OpenAI Responses API...`);
  const startTime = Date.now();

  const response = await client.responses.create({
    model: OPENAI_CONFIG.defaultModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_file',
            filename: fileName,
            file_data: `data:application/pdf;base64,${base64Pdf}`,
          },
          {
            type: 'input_text',
            text: `You are an expert resume parser. Extract the following information from this PDF resume and return ONLY valid JSON (no markdown, no code blocks):

{
  "name": "person's full name exactly as it appears",
  "raw_content": "complete resume content with ALL sections: contact info, summary, work experience (companies, positions, dates, achievements), education, skills, certifications, projects, etc. Preserve all details and formatting."
}

CRITICAL INSTRUCTIONS:
- Extract the exact full name from the resume
- Include EVERY detail from every section - do not summarize or omit anything
- Preserve dates, companies, positions, achievements exactly as written
- Maintain structure with bullet points and sections
- Keep chronological order
- Return ONLY the JSON object, nothing else`,
          },
        ],
      },
    ],
  });

  const duration = Date.now() - startTime;
  console.log(`✅ OpenAI extraction completed in ${duration}ms`);

  // Parse JSON response
  const extracted: Person = JSON.parse(response.output_text);

  // Validate
  if (!extracted.name || !extracted.raw_content) {
    throw new Error('OpenAI extraction failed: Missing required fields');
  }

  if (extracted.name.trim().length === 0) {
    throw new Error('Could not find your name in the PDF');
  }

  if (extracted.raw_content.trim().length < 100) {
    throw new Error('Extracted content is too short. PDF may be image-based.');
  }

  return extracted;
}

