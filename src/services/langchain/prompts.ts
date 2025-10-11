import { ChatPromptTemplate } from "@langchain/core/prompts";

// Prompt: Job Data Extraction
// Extracts structured job information from raw job posting content
export const jobDataExtractionPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert at extracting structured information from job postings.

Analyze the following raw job posting content and extract key information:

RAW CONTENT:
{rawContent}

SOURCE URL (if provided):
{url}

TASK: Extract the following information from the job posting:
1. Job Title/Position: The specific role being advertised
2. Company Name: The organization offering the position
3. Job Description: A comprehensive description of the role, responsibilities, and requirements (100-2000 characters)
4. Remote Work: Determine if remote work is allowed:
   - Set to true if keywords like "remote", "WFH", "work from home", "distributed", "telecommute" are mentioned
   - Set to false if explicitly on-site only (e.g., "on-site only", "no remote", "in-office required")
   - Leave undefined if unclear
5. Apply URL: The application link if explicitly mentioned in the content
6. Easy Apply: Whether this is an easy/quick apply position (e.g., "LinkedIn Easy Apply", "one-click apply")

EXTRACTION GUIDELINES:
- Be accurate and extract only what's present in the content
- For company name, check both the content and the URL
- For job description, extract or summarize the main content (responsibilities, requirements, qualifications)
- Use the URL as a hint for company name if not found in content
- If information is missing or unclear, use appropriate default or leave optional fields undefined

{format_instructions}
`);

// Prompt 0: Profile to Base Resume Conversion
// Converts a Person's raw content into a complete, structured base resume
export const profileToBaseResumePrompt = ChatPromptTemplate.fromTemplate(`
You are an expert resume writer. Convert the following profile information into a complete, structured base resume.

PERSON NAME: {personName}
PROFILE CONTENT:
{personRawContent}

TASK: Create a comprehensive base resume by extracting ALL information from the profile content above.

IMPORTANT INSTRUCTIONS:
1. Extract personal information (name, email, phone, location)
2. Extract ALL work experience with:
   - Company name and position
   - Detailed description of role and responsibilities (3-5 sentences)
   - Key achievements with metrics where available (3-5 specific achievements)
   - Start and end dates
3. Extract education background
4. Extract skills and organize into categories:
   - Technical Skills (languages, databases, etc.)
   - Frameworks & Libraries
   - Tools & Technologies
   - Soft Skills
   - Domain Expertise
5. Extract projects with technologies used
6. Extract social media links (LinkedIn, GitHub, etc.)
7. Extract languages and certifications
8. Create a general professional summary (3-4 sentences highlighting background and expertise)

DATA QUALITY REQUIREMENTS:
- Extract at least 1 work experience entry (if any experience exists in the content)
- Create at least 2 skill categories with 3+ skills each
- Position should be the most recent or primary role
- Do NOT make up information - only use what's provided in the profile content
- If information is missing (like email or phone), use empty string
- Write clear, professional descriptions

This base resume will be used later to generate job-specific optimized resumes.

{format_instructions}
`);

// Prompt 1: Job Requirements Analysis
export const jobAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
Analyze this job posting and extract key requirements, skills, and qualifications.

Job Title: {jobTitle}
Company: {company}
Job Description: {description}
Raw Content: {rawContent}

Extract and identify:
1. Required technical skills (programming languages, frameworks, tools)
2. Required soft skills (communication, leadership, etc.)
3. Key responsibilities and duties
4. Preferred qualifications and nice-to-haves
5. Company culture indicators (values, work style)
6. Industry-specific terms and jargon
7. Action verbs commonly used (for resume optimization)

Be thorough and extract as many relevant items as possible from the job posting.

{format_instructions}
`);

// Prompt 2: Keyword Extraction
export const keywordExtractionPrompt = ChatPromptTemplate.fromTemplate(`
Extract ATS-relevant keywords from this job posting for resume optimization.

Job Title: {jobTitle}
Company: {company}
Job Description: {description}
Raw Content: {rawContent}

Focus on extracting:
1. Technical skills and tools
2. Soft skills and competencies
3. Industry-specific terminology
4. Action verbs for achievements
5. Certifications and qualifications
6. Programming languages and frameworks
7. Methodologies and processes

Extract 20-40 relevant keywords that should be incorporated into the resume for ATS optimization.

{format_instructions}
`);

// Prompt 3: Single-Shot Resume Optimization
export const resumeOptimizationPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert ATS resume optimizer. Generate a complete, optimized resume tailored for a specific job in ONE coherent pass.

BASE RESUME (source of truth for candidate's information):
{baseResume}

TARGET JOB:
Position: {jobTitle}
Company: {company}
Job Posting: {jobPosting}

JOB ANALYSIS:
{jobAnalysis}

ATS KEYWORDS TO INCORPORATE:
{keywords}

TASK: Generate a complete, ATS-optimized resume tailored specifically for the {jobTitle} position at {company}.

OPTIMIZATION STRATEGY - ALL SECTIONS TOGETHER:

1. PROFESSIONAL SUMMARY (3-4 sentences):
   - Highlight experience from base resume most relevant to target job
   - Naturally incorporate 4-6 high-priority keywords
   - Quantify impact where possible
   - Position candidate as ideal fit for THIS specific role
   - Use strong action verbs

2. WORK EXPERIENCE (ALL entries):
   - Keep ALL entries from base resume with exact position/company/dates
   - Rewrite EACH description to emphasize skills matching job requirements
   - Add 3-5 quantified achievements per role (metrics, percentages, numbers)
   - Use action verbs from job analysis (Led, Developed, Achieved, Implemented, etc.)
   - Show career progression and increasing responsibility
   - Naturally weave in relevant ATS keywords
   - Demonstrate measurable business impact

3. SKILLS (organized categories):
   - Create 3-5 well-organized categories
   - Prioritize skills that match job requirements first
   - Include skills from base resume that are relevant
   - Add critical skills from job requirements (if candidate likely has them based on work history)
   - Order by relevance to target job
   - 5-12 skills per category
   - Balance technical and soft skills

4. PRESERVE FROM BASE RESUME (unchanged):
   - Personal information: name, contactInformation, email, address
   - Social media links
   - Education entries
   - Projects
   - Languages
   - Certifications
   - Profile picture

5. OVERALL QUALITY:
   - Maintain professional, consistent tone throughout
   - Ensure all sections work together cohesively
   - Natural keyword integration (NO keyword stuffing)
   - Tell a coherent story of the candidate's fit for this role
   - ATS-compatible formatting
   - Specific to {jobTitle} at {company}

CRITICAL INSTRUCTIONS:
- Generate the COMPLETE resume in one pass - all sections optimized together
- Ensure summary, work experience, and skills all align and reinforce each other
- Use the full context of the base resume to make intelligent decisions
- Do not lose any important information from the base resume
- The final resume should read as a unified, professional document tailored for this exact position

{format_instructions}
`);

