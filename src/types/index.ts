// Base types for the resume generation system
export interface SocialMediaLink {
  socialMedia: string;
  link: string;
}

export interface Education {
  school: string;
  degree: string;
  startYear: string;
  endYear: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  description: string;
  keyAchievements: string;
  startYear: string;
  endYear: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  startYear: string;
  endYear: string;
  link?: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

// Person data structure
export interface Person {
  name: string;
  raw_content: string;

}

// Target job data structure (job posting details)
export interface TargetJobJson {
  name: string;
  url: string;
  company: string;
  description: string;
  raw_content: string;
}

export interface CustomSection {
  title: string;
  content: string;
}

// Resume data structure (matches DefaultResumeData.jsx structure exactly)
// This structure is IMMUTABLE and must not be changed
export interface Resume {
  id?: string; // Hash-based unique identifier (optional for backward compatibility)
  name: string;
  position: string;
  contactInformation: string;
  email: string;
  address: string;
  profilePicture: string;
  showProfilePicture?: boolean; // Toggle to show/hide profile picture in resume
  socialMedia: SocialMediaLink[];
  summary: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: SkillCategory[];
  languages: string[];
  certifications: string[];

  // Generation metadata (tracks how this resume was created)
  generationMetadata?: {
    generatedAt: number; // Timestamp
    baseResume?: Resume; // Base resume used (without nested metadata to avoid circular refs)
    targetJob?: TargetJobJson; // Job it was optimized for
    steps?: {
      // Step 1: Job Analysis
      jobAnalysis?: {
        technicalSkills: string[];
        softSkills: string[];
        keyResponsibilities: string[];
        preferredQualifications: string[];
        companyCulture: string[];
        industryTerms: string[];
        actionVerbs: string[];
      };

      // Step 2: Keywords
      keywordsExtracted?: string[];

      // Step 3: Summary
      originalSummary?: string; // From base resume
      summaryOptimized?: string; // After optimization

      // Step 4: Work Experience
      originalWorkExperience?: WorkExperience[]; // From base resume
      enhancedWorkExperience?: WorkExperience[]; // After enhancement

      // Step 5: Skills
      originalSkills?: SkillCategory[]; // From base resume
      optimizedSkills?: SkillCategory[]; // After optimization
    };
  };
}

// Error types
export enum ResumeGenerationError {
  INVALID_PERSON_DATA = 'INVALID_PERSON_DATA',
  INVALID_JOB_DATA = 'INVALID_JOB_DATA',
  OPENROUTER_API_ERROR = 'OPENROUTER_API_ERROR',
  RESUME_PARSING_ERROR = 'RESUME_PARSING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class ResumeGenerationException extends Error {
  constructor(
    public type: ResumeGenerationError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ResumeGenerationException';
  }
}

// Utility types for data transformation
export interface DataTransformationResult {
  resume: Resume;
  steps: {
    summaryOptimized: string;
    keywordsExtracted: string[];
    achievementsEnhanced: WorkExperience[];
  };
}

// AI processing input
export interface ResumeGenerationInput {
  baseResume: Resume; // Required base resume (generated from profile)
  targetJob: TargetJobJson;
}

// Generation tracking - Simplified 3-step process
export enum GenerationStatus {
  PENDING = 'PENDING',
  ANALYZING_JOB = 'ANALYZING_JOB',           // Step 1
  EXTRACTING_KEYWORDS = 'EXTRACTING_KEYWORDS', // Step 2
  GENERATING_RESUME = 'GENERATING_RESUME',   // Step 3 (single-shot optimization)
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Generation {
  id: string;
  status: GenerationStatus;
  progress: number; // 0-100
  currentStep: string;
  input: ResumeGenerationInput;
  result?: Resume;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    jobTitle: string;
    company: string;
    duration?: number; // milliseconds
  };
}

export interface GenerationHistory {
  generations: Generation[];
  currentGenerationId?: string;
}

// Context types for React integration
export interface ResumeContextType {
  resumeData: Resume;
  setResumeData: (resume: Resume) => void;

  // New data sources
  personData: Person;
  targetJobData: TargetJobJson;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  currentStep: string;
  error: string | null;
  currentGeneration?: Generation;
  generationHistory: Generation[];

  // Methods
  generateResume: (input: ResumeGenerationInput) => Promise<void>;
  loadPersonData: (data: Person) => void;
  loadTargetJobData: (data: TargetJobJson) => void;
  validatePersonData: (data: any) => data is Person;
  validateTargetJobData: (data: any) => data is TargetJobJson;
  syncPersonAndTargetJobToResume: () => void;
  syncResumeToPerson: () => void;
  createNewPerson: () => Person;
  createNewTargetJob: () => TargetJobJson;
  clearAllData: () => void;

  // Generation history methods
  getGenerationById: (id: string) => Generation | undefined;
  clearGenerationHistory: () => void;

  // Backward compatibility handlers
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProfilePicture: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Data manager access
  dataManager: any; // DataManagerService type
}