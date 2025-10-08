# PDF Resume Upload Feature

## Overview

Enable users to upload a PDF of their current resume when creating or updating their profile, providing a more user-friendly alternative to manually copying and pasting resume content.

## User Flow

### New Users (No Profile)
1. User navigates to `/dashboard/profile`
2. System detects no existing profile and shows "Create Profile" form
3. User enters their name
4. User has two options for providing resume content:
   - **Option A**: Upload PDF file (drag-and-drop or file picker)
   - **Option B**: Paste text manually (existing functionality)
5. System extracts text from PDF and populates `raw_content` field
6. User can preview/edit extracted content if needed
7. User submits form
8. System generates base resume from profile data

### Existing Users (Updating Profile)
1. User clicks "Edit Profile" button
2. System shows current profile data
3. User can upload a new PDF to replace existing `raw_content`
4. User clicks "Update Profile"
5. System regenerates base resume with new data

## Current Implementation

### Profile Data Structure
```typescript
interface Person {
  name: string;
  raw_content: string;
}

interface UserProfile extends Person {
  timestamp: number;
  baseResume?: Resume;
  metadata?: {
    lastUpdated?: number;
    version?: number;
    notes?: string;
  };
}
```

### Current Form Component
- **Location**: `src/components/resumeGenerator/forms/PersonForm.tsx`
- **Fields**: Name (text input), Raw Content (textarea)
- **Storage**: `ProfileStorageService` → localStorage

## Technical Requirements

### 1. Frontend Components

#### A. File Upload Component (`components/form/components/PdfUploadField.tsx`)
- Drag-and-drop zone with visual feedback
- File picker button as alternative
- File type validation (PDF only)
- File size validation (max 10MB recommended)
- Upload progress indicator
- Preview of uploaded file name
- "Clear" button to remove uploaded file
- Error handling and user feedback

#### B. Enhanced PersonForm
- Integrate PDF upload component
- Toggle between "Upload PDF" and "Paste Text" modes
- Show extracted text in preview area
- Allow manual editing of extracted text
- Loading state during PDF processing

### 2. PDF Processing

#### A. LLM-Based Extraction with LangChain (Recommended)
**Approach**: Send PDF to LLM via LangChain to intelligently extract and structure resume data
- Use LangChain's PDF document loaders
- LLM understands context and structure (not just raw text)
- Can extract directly into structured format
- Handles poorly formatted PDFs better
- Can parse multi-column layouts intelligently

**Implementation**:
```typescript
// app/actions/pdfExtraction.ts
'use server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { ChatOpenAI } from '@langchain/openai';

export async function extractResumeFromPdf(pdfBuffer: Buffer): Promise<Person> {
  // Load PDF using LangChain
  const loader = new PDFLoader(pdfBuffer);
  const docs = await loader.load();

  // Use LLM to extract structured data
  const llm = new ChatOpenAI({ /* config */ });
  const extractedData = await llm.invoke(/* extraction prompt */);

  return {
    name: extractedData.name,
    raw_content: extractedData.fullText
  };
}
```

**API Route**: `/api/extract-pdf`
- Accept multipart/form-data with PDF file
- Convert file to buffer
- Call LangChain extraction service
- Return structured Person data

#### B. Fallback: Simple Text Extraction
If LLM extraction fails or is too slow:
- Use `pdf-parse` for basic text extraction
- Return raw text in `raw_content` field
- User can manually edit if needed

### 3. Data Flow

```
User uploads PDF
    ↓
Send PDF to server (/api/extract-pdf)
    ↓
Server: Load PDF with LangChain PDFLoader
    ↓
Server: Extract text and metadata
    ↓
Server: Send to LLM with extraction prompt
    ↓
Server: LLM returns structured Person data
    ↓
Client: Display extracted data in form
    ↓
User confirms/edits extracted information
    ↓
Submit form (existing flow)
    ↓
Generate base resume (existing flow)
```

**LLM Extraction Prompt**:
```
You are a resume parser. Extract the following information from this resume:
1. Person's full name
2. Complete resume content (preserve all information)

Return as JSON:
{
  "name": "Full Name",
  "raw_content": "Complete resume text with all sections preserved"
}
```

### 4. Storage Considerations

**Option A: Text-Only Storage (Recommended)**
- Extract text from PDF
- Store only extracted text in `raw_content`
- Original PDF not stored
- **Pros**: Simple, existing data structure works, no storage bloat
- **Cons**: Original PDF lost after processing

**Option B: Store PDF + Text**
- Extend `UserProfile` interface with `pdfFile` field
- Store base64-encoded PDF or file path
- **Pros**: Can re-process later if extraction improves
- **Cons**: Larger localStorage usage, potential quota issues

**Recommendation**: Start with Option A (text-only), add PDF storage later if needed.

## Implementation Steps

### Phase 1: Core Upload Functionality
1. ✅ Create plan document (this file)
2. Install PDF processing library: `bun add pdf-parse`
3. Create LangChain PDF extraction service (`services/langchain/pdfResumeExtractor.ts`)
4. Create server action for PDF upload (`app/actions/pdfExtraction.ts`)
5. Create reusable file upload component (`components/ui/file-upload.tsx`)
6. Create PDF-specific upload component (`components/form/components/PdfUploadField.tsx`)
7. Test LLM-based extraction with various resume formats

### Phase 2: Form Integration
7. Update `PersonForm` component to include PDF upload option
8. Add UI toggle between "Upload PDF" and "Paste Text"
9. Implement preview area for extracted text
10. Add validation and error handling
11. Update form submission to handle both input methods

### Phase 3: UX Enhancements
12. Add drag-and-drop visual feedback
13. Add upload progress indicator
14. Add success/error toast notifications
15. Add "Try Again" option if extraction fails
16. Add help text and examples

### Phase 4: Testing & Polish
17. Test with various PDF formats (native PDF, scanned, image-based)
18. Test file size limits and validation
19. Test error scenarios (invalid files, network issues)
20. Add loading states and skeletons
21. Update documentation

## Dependencies

### Required Libraries
```json
{
  "langchain": "latest", // Already installed - LangChain core
  "@langchain/openai": "latest", // Already installed - OpenAI LLM integration
  "pdf-parse": "^1.1.1", // PDF parsing for LangChain
  "react-dropzone": "^14.2.3" // Drag-and-drop functionality (optional)
}
```

**Note**: LangChain and OpenAI packages are already in the project (used for resume generation)

### UI Components (shadcn/ui)
- `Button` ✅ (already exists)
- `Card` ✅ (already exists)
- `Alert` ✅ (already exists)
- `Progress` (may need to add)
- `Badge` ✅ (already exists)

## Security Considerations

1. **File Type Validation**
   - Check MIME type: `application/pdf`
   - Verify file extension: `.pdf`
   - Validate PDF structure (magic bytes)

2. **File Size Limits**
   - Client-side: 10MB max (configurable)
   - Prevent DOS attacks
   - Show clear error messages

3. **Content Sanitization**
   - Sanitize extracted text before storing
   - Remove potentially malicious content
   - Escape HTML entities

4. **Privacy**
   - Process PDFs client-side when possible
   - Clear file input after processing
   - Don't store PDFs unnecessarily

## Error Handling

### Scenarios to Handle
1. **Invalid file type** → "Please upload a PDF file"
2. **File too large** → "File size exceeds 10MB limit"
3. **Extraction failed** → "Could not extract text. Please paste manually."
4. **Empty PDF** → "No text found in PDF. Please paste manually."
5. **Corrupted PDF** → "PDF file is corrupted or unreadable"
6. **Browser compatibility** → "PDF upload not supported in this browser"

### Fallback Strategy
If PDF extraction fails for any reason, gracefully fall back to manual text input:
```
"We couldn't extract text from your PDF.
Please paste your resume content manually below."
```

## UI/UX Design

### Upload Component Layout
```
┌─────────────────────────────────────────┐
│  Upload Resume PDF                       │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  📄 Drag & drop your resume here   │ │
│  │        or                           │ │
│  │     [Choose File]                   │ │
│  │                                     │ │
│  │  Accepts: PDF (max 10MB)           │ │
│  └────────────────────────────────────┘ │
│                                          │
│         ─── OR ───                       │
│                                          │
│  [Paste Text Manually Instead]          │
└─────────────────────────────────────────┘
```

### After Upload (Processing)
```
┌─────────────────────────────────────────┐
│  Processing resume.pdf... 75% ⏳        │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░                   │
└─────────────────────────────────────────┘
```

### After Extraction (Preview)
```
┌─────────────────────────────────────────┐
│  ✅ Text extracted from resume.pdf      │
│                                   [Clear]│
│  ┌────────────────────────────────────┐ │
│  │ John Doe                           │ │
│  │ Software Engineer                  │ │
│  │ ...                                │ │
│  │                                    │ │
│  │ (Editable preview area)            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Edit] [Continue]                       │
└─────────────────────────────────────────┘
```

## Accessibility

1. **Keyboard Navigation**
   - File input accessible via Tab key
   - Drag-drop zone has keyboard alternative
   - All buttons keyboard-accessible

2. **Screen Readers**
   - Proper ARIA labels for file input
   - Announce upload status changes
   - Announce errors clearly

3. **Visual Feedback**
   - Clear focus indicators
   - Loading states with spinners
   - Success/error colors (not color-only)

## Future Enhancements

### Phase 2 (Post-MVP)
1. **Multi-format Support**
   - Accept DOCX files
   - Accept plain text files
   - Accept RTF files

2. **OCR Support**
   - Handle scanned PDFs with OCR (Tesseract.js)
   - Process image-based PDFs

3. **LinkedIn Import**
   - "Import from LinkedIn" button
   - OAuth integration
   - Auto-fill profile from LinkedIn data

4. **Resume Analysis**
   - Provide feedback on uploaded resume
   - Suggest improvements before generating base resume
   - Detect missing sections

5. **PDF Storage**
   - Store original PDF for re-processing
   - Allow users to download original
   - Cloud storage integration (optional)

6. **Batch Upload**
   - Upload multiple versions
   - Compare different resumes
   - Merge information from multiple sources

## Testing Strategy

### Unit Tests
- PDF extraction service
- File validation functions
- Text sanitization

### Integration Tests
- File upload component with form
- End-to-end profile creation with PDF
- Error handling flows

### Manual Testing Checklist
- [ ] Upload valid PDF → text extracted correctly
- [ ] Upload invalid file → appropriate error shown
- [ ] Upload oversized file → size limit enforced
- [ ] Upload corrupted PDF → graceful fallback
- [ ] Drag and drop → works same as file picker
- [ ] Extract then edit text → changes preserved
- [ ] Upload on mobile → works on mobile devices
- [ ] Cancel upload → clears state properly
- [ ] Upload with slow connection → progress shown
- [ ] Upload then navigate away → no memory leaks

## Success Metrics

1. **Adoption**: % of users who use PDF upload vs manual entry
2. **Success Rate**: % of uploads that successfully extract text
3. **User Satisfaction**: Reduced support tickets about profile creation
4. **Time Saved**: Average time to create profile (before vs after)

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| PDF extraction fails | High | Medium | Provide manual fallback |
| Large file sizes | Medium | Low | Enforce 10MB limit |
| Browser compatibility | Medium | Low | Feature detection + fallback |
| Scanned PDFs (no text) | Medium | Medium | OCR or manual entry fallback |
| LocalStorage quota exceeded | Low | Low | Show warning, suggest text-only |

## Open Questions

1. Should we store the original PDF or just extracted text?
   - **Recommendation**: Text-only initially, revisit if users request PDF storage

2. What's the maximum file size we should allow?
   - **Recommendation**: 10MB (typical resume PDFs are 100KB-2MB)

3. Should we support DOCX files too?
   - **Recommendation**: Start with PDF only, add DOCX in Phase 2

4. How do we handle multi-column PDF layouts?
   - **Recommendation**: Extract as-is, user can edit if needed

5. Should extraction happen on client or server?
   - **Recommendation**: Server-side using LangChain + LLM for intelligent extraction and better accuracy

## LangChain Integration Benefits

### Why LLM Extraction vs Simple Text Extraction?

1. **Structural Understanding**
   - LLM understands resume sections (Experience, Education, Skills)
   - Can handle various resume formats and layouts
   - Preserves semantic meaning, not just text order

2. **Smart Parsing**
   - Handles multi-column layouts intelligently
   - Extracts dates, companies, positions correctly
   - Understands bullet points and hierarchies

3. **Data Cleaning**
   - Removes headers/footers automatically
   - Fixes formatting issues
   - Normalizes inconsistent spacing

4. **Error Recovery**
   - Can handle scanned PDFs with OCR errors
   - Makes intelligent guesses for ambiguous content
   - Provides reasonable defaults for missing fields

5. **Existing Infrastructure**
   - Already using LangChain for resume generation
   - Same LLM configuration and prompts
   - Consistent caching strategy

### Cost Considerations

- Each PDF extraction requires ~1 LLM call
- Estimated cost: $0.001 - $0.01 per resume (using GPT-4 Turbo)
- Can use cheaper models (GPT-3.5) for extraction if needed
- Cache extracted results to avoid re-processing

### Performance

- Average extraction time: 3-8 seconds
- Show loading spinner during extraction
- Stream results if possible for faster perceived performance
- Fallback to basic extraction if timeout occurs

## References

- [LangChain PDF Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/pdf)
- [LangChain Document Loaders](https://js.langchain.com/docs/integrations/document_loaders/)
- [OpenAI Structured Output](https://platform.openai.com/docs/guides/structured-outputs)
- [react-dropzone Documentation](https://react-dropzone.js.org/)
- [File API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [WCAG File Upload Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)

## Detailed Implementation Example

### Server Action (`app/actions/pdfExtraction.ts`)

```typescript
'use server';

import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getLLM } from '@/services/langchain/core';
import { getCachedOrRun } from './cacheActions';
import { Person } from '@/types';

// Define the schema for extraction
const PersonSchema = z.object({
  name: z.string().describe('Full name of the person'),
  raw_content: z.string().describe('Complete resume content with all sections preserved')
});

export async function extractResumeFromPdf(
  fileData: string, // base64 encoded PDF
  fileName: string
): Promise<{ success: boolean; data?: Person; error?: string }> {
  try {
    const cacheKey = `pdf-extract-${fileName}`;

    // Use existing cache utility
    const result = await getCachedOrRun(
      cacheKey,
      async () => {
        // Convert base64 to buffer
        const buffer = Buffer.from(fileData, 'base64');

        // Load PDF with LangChain PDFLoader
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const loader = new PDFLoader(blob);
        const documents = await loader.load();

        // Combine all pages
        const fullText = documents.map(doc => doc.pageContent).join('\n\n');

        // Setup structured output parser
        const parser = StructuredOutputParser.fromZodSchema(PersonSchema);

        // Use existing LLM instance (already configured with OpenRouter)
        const llm = getLLM();

        // Create prompt template
        const promptTemplate = PromptTemplate.fromTemplate(`
You are a resume parser. Extract the following information from this resume:

Resume Content:
{resumeText}

{formatInstructions}

Important:
- Extract the person's full name
- Preserve ALL resume content in raw_content (work experience, education, skills, etc.)
- Maintain the original structure and formatting as much as possible
- Do not summarize or omit any information
        `);

        // Generate prompt
        const prompt = await promptTemplate.format({
          resumeText: fullText,
          formatInstructions: parser.getFormatInstructions()
        });

        // Extract structured data
        const response = await llm.invoke(prompt);
        const extracted = await parser.parse(response.content as string);

        return extracted;
      }
    );

    return { success: true, data: result };

  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract resume data'
    };
  }
}
```

### LangChain Service (`services/langchain/pdfResumeExtractor.ts`)

```typescript
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { getLLM } from './core';
import { Person } from '@/types';

// Schema for Person extraction
const PersonSchema = z.object({
  name: z.string().describe('Full name of the person'),
  raw_content: z.string().describe('Complete resume content with all sections preserved')
});

/**
 * Extract Person data from PDF buffer using LangChain
 */
export async function extractPersonFromPdf(pdfBuffer: Buffer): Promise<Person> {
  // Load PDF
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const loader = new PDFLoader(blob);
  const documents = await loader.load();

  // Combine all pages
  const fullText = documents
    .map(doc => doc.pageContent)
    .join('\n\n');

  // Setup structured output parser
  const parser = StructuredOutputParser.fromZodSchema(PersonSchema);

  // Create prompt
  const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert resume parser. Your task is to extract structured information from the resume.

Resume Content:
{resumeText}

{formatInstructions}

IMPORTANT INSTRUCTIONS:
1. Extract the person's full name exactly as it appears
2. For raw_content, include ALL information from the resume:
   - Contact information
   - Professional summary
   - Work experience (all positions, dates, responsibilities, achievements)
   - Education (degrees, institutions, dates)
   - Skills (technical and soft skills)
   - Certifications
   - Projects
   - Any other sections
3. Preserve the structure and formatting
4. Do NOT summarize, paraphrase, or omit any details
5. Maintain chronological order and bullet points
  `);

  const prompt = await promptTemplate.format({
    resumeText: fullText,
    formatInstructions: parser.getFormatInstructions()
  });

  // Get LLM and extract
  const llm = getLLM();
  const response = await llm.invoke(prompt);
  const extracted = await parser.parse(response.content as string);

  return extracted as Person;
}

/**
 * Validate PDF file
 */
export function validatePdfFile(file: File | Buffer, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const fileSize = file instanceof File ? file.size : file.length;

  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type (if File object)
  if (file instanceof File) {
    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: 'File must be a PDF'
      };
    }
  }

  return { valid: true };
}
```

### React Component (`components/form/components/PdfUploadField.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, X, CheckCircle } from 'lucide-react';
import { extractResumeFromPdf } from '@/app/actions/pdfExtraction';
import { Person } from '@/types';
import { toast } from 'sonner';

interface PdfUploadFieldProps {
  onExtracted: (data: Person) => void;
  disabled?: boolean;
}

export function PdfUploadField({ onExtracted, disabled }: PdfUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setUploadedFile(file);
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // Convert to base64
      const fileData = await fileToBase64(file);
      setProgress(30);

      // Extract with LLM
      toast.info('Extracting resume data...');
      const result = await extractResumeFromPdf(fileData, file.name);
      setProgress(90);

      if (result.success && result.data) {
        setExtractedData(result.data);
        onExtracted(result.data);
        setProgress(100);
        toast.success('Resume extracted successfully!');
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      toast.error('Failed to extract resume. Please try pasting text manually.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: disabled || uploading
  });

  const clearUpload = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      {!extractedData ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
            <p className="text-lg font-medium">
              {uploading
                ? 'Processing resume...'
                : isDragActive
                ? 'Drop your resume here'
                : 'Drag & drop your resume PDF'}
            </p>
            {!uploading && (
              <>
                <p className="text-sm text-muted-foreground">or</p>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF files only (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{extractedData.name}</strong> - Resume extracted successfully
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearUpload}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {uploading && (
        <Progress value={progress} className="w-full" />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}
```

## Conclusion

This feature will significantly improve the user onboarding experience by allowing users to quickly upload their existing resume rather than manually copying and pasting content. By leveraging LangChain and LLM-based extraction, we get intelligent parsing that understands resume structure and handles edge cases gracefully. The implementation builds on existing LangChain infrastructure used for resume generation, with clear fallback strategies for edge cases.

