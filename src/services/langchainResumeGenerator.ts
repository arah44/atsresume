import {
  profileToBaseResumeChain,
  profileToBaseResumeParser,
  jobAnalysisChain,
  keywordExtractionChain,
  resumeOptimizationChain,
  runChain,
  jobAnalysisParser,
  keywordsParser,
  resumeOptimizationParser,
  JobAnalysis,
  WorkExperience,
  SkillCategory
} from './langchain';
import { Person, TargetJobJson, Resume, DataTransformationResult, ResumeGenerationException, ResumeGenerationError, ResumeGenerationInput } from '../types';

export class LangChainResumeGenerator {

  /**
   * Generate a base resume from a person's profile
   * This creates a complete, structured resume from raw profile content
   * This is the first step - creates a reusable base resume independent of any job
   */
  async generateBaseResume(person: Person): Promise<Resume> {
    try {
      const input = {
        personName: person.name,
        personRawContent: person.raw_content,
        format_instructions: profileToBaseResumeParser.getFormatInstructions()
      };

      console.log('🔄 Generating base resume from profile...');
      console.log('  Person:', person.name);
      console.log('  Content length:', person.raw_content.length);

      const result = await runChain(profileToBaseResumeChain, input) as Resume;

      console.log('✅ Base resume generated successfully!');
      console.log('  Position:', result.position);
      console.log('  Work experience entries:', result.workExperience?.length || 0);
      console.log('  Skill categories:', result.skills?.length || 0);

      return result;
    } catch (error) {
      console.error('Base resume generation error:', error);
      throw new ResumeGenerationException(
        ResumeGenerationError.OPENROUTER_API_ERROR,
        `Base resume generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Analyze job requirements and extract structured information
   */
  async analyzeJobRequirements(targetJob: TargetJobJson): Promise<JobAnalysis> {
    try {
      const input = {
        jobTitle: targetJob.name,
        company: targetJob.company,
        description: targetJob.description,
        rawContent: targetJob.raw_content,
        format_instructions: jobAnalysisParser.getFormatInstructions()
      };

      return await runChain(jobAnalysisChain, input) as JobAnalysis;
    } catch (error) {
      // Log the actual error for debugging
      console.error('Job analysis error:', error);
      throw new ResumeGenerationException(
        ResumeGenerationError.OPENROUTER_API_ERROR,
        `Job analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Extract ATS-relevant keywords from job posting
   */
  async extractKeywords(targetJob: TargetJobJson): Promise<string[]> {
    try {
      const input = {
        jobTitle: targetJob.name,
        company: targetJob.company,
        description: targetJob.description,
        rawContent: targetJob.raw_content,
        format_instructions: keywordsParser.getFormatInstructions()
      };

      return await runChain(keywordExtractionChain, input) as string[];
    } catch (error) {
      console.error('Keyword extraction error:', error);
      throw new ResumeGenerationException(
        ResumeGenerationError.OPENROUTER_API_ERROR,
        `Keyword extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate complete ATS-optimized resume in one coherent pass
   * This is the single-shot optimization that handles summary, work experience, and skills together
   */
  async generateOptimizedResume(
    baseResume: Resume,
    targetJob: TargetJobJson,
    jobAnalysis: JobAnalysis,
    keywords: string[]
  ): Promise<Resume> {
    try {
      const input = {
        baseResume: JSON.stringify(baseResume, null, 2),
        jobTitle: targetJob.name,
        company: targetJob.company,
        jobPosting: targetJob.raw_content,
        jobAnalysis: JSON.stringify(jobAnalysis, null, 2),
        keywords: keywords.join(', '),
        format_instructions: resumeOptimizationParser.getFormatInstructions()
      };

      console.log('🎯 Generating optimized resume (single-shot)...');
      const result = await runChain(resumeOptimizationChain, input);
      console.log('✅ Optimized resume generated successfully');

      return result as Resume;
    } catch (error) {
      console.error('Resume optimization error:', error);
      throw new ResumeGenerationException(
        ResumeGenerationError.OPENROUTER_API_ERROR,
        `Resume optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Complete resume generation pipeline with steps
   * Takes a base resume and optimizes it for a specific target job
   */
  async generateResumeWithSteps(input: ResumeGenerationInput): Promise<DataTransformationResult> {
    try {
      const { baseResume, targetJob } = input;

      console.log('📋 Starting simplified resume generation (3 steps)...');
      console.log('  Base resume:', baseResume?.name, '-', baseResume?.position);
      console.log('  Target job:', targetJob?.name, 'at', targetJob?.company);

      // Step 1: Analyze job requirements
      console.log('\n📊 Step 1: Analyzing job requirements...');
      const jobAnalysis = await this.analyzeJobRequirements(targetJob);
      console.log('  ✅ Job analysis complete');
      console.log('    - Technical skills:', jobAnalysis.technicalSkills?.length || 0);
      console.log('    - Key responsibilities:', jobAnalysis.keyResponsibilities?.length || 0);

      // Step 2: Extract ATS keywords
      console.log('\n🔑 Step 2: Extracting ATS keywords...');
      const keywords = await this.extractKeywords(targetJob);
      console.log('  ✅ Keywords extracted:', keywords.length);
      console.log('    - Sample:', keywords.slice(0, 5).join(', '));

      // Step 3: Generate complete optimized resume (SINGLE SHOT)
      console.log('\n🎯 Step 3: Generating optimized resume (single-shot optimization)...');
      console.log('  Optimizing all sections together: summary, work experience, skills');

      const optimizedResume = await this.generateOptimizedResume(
        baseResume,
        targetJob,
        jobAnalysis,
        keywords
      );

      console.log('  ✅ Complete resume generated!');
      console.log('    - Position:', optimizedResume.position);
      console.log('    - Summary length:', optimizedResume.summary?.length || 0);
      console.log('    - Work experience:', optimizedResume.workExperience?.length || 0);
      console.log('    - Skills:', optimizedResume.skills?.length || 0);
      console.log('    - Education:', optimizedResume.education?.length || 0);

      console.log('\n✅ All 3 steps complete!');

      // Add generation metadata
      const resumeWithMetadata: Resume = {
        ...optimizedResume,
        generationMetadata: {
          generatedAt: Date.now(),
          baseResume: {
            ...baseResume,
            generationMetadata: undefined // Avoid circular refs
          },
          targetJob,
          steps: {
            jobAnalysis: {
              technicalSkills: jobAnalysis.technicalSkills,
              softSkills: jobAnalysis.softSkills,
              keyResponsibilities: jobAnalysis.keyResponsibilities,
              preferredQualifications: jobAnalysis.preferredQualifications,
              companyCulture: jobAnalysis.companyCulture,
              industryTerms: jobAnalysis.industryTerms,
              actionVerbs: jobAnalysis.actionVerbs
            },
            keywordsExtracted: keywords,
            originalSummary: baseResume.summary,
            summaryOptimized: optimizedResume.summary,
            originalWorkExperience: baseResume.workExperience,
            enhancedWorkExperience: optimizedResume.workExperience,
            originalSkills: baseResume.skills,
            optimizedSkills: optimizedResume.skills
          }
        }
      };

      return {
        resume: resumeWithMetadata,
        steps: {
          summaryOptimized: optimizedResume.summary,
          keywordsExtracted: keywords,
          achievementsEnhanced: optimizedResume.workExperience
        }
      };

    } catch (error) {
      if (error instanceof ResumeGenerationException) {
        throw error;
      }
      throw new ResumeGenerationException(
        ResumeGenerationError.VALIDATION_ERROR,
        `Resume generation with steps failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Simple resume generation (without detailed steps)
   */
  async generateResumeSimple(input: ResumeGenerationInput): Promise<Resume> {
    try {
      const result = await this.generateResumeWithSteps(input);
      return result.resume;
    } catch (error) {
      if (error instanceof ResumeGenerationException) {
        throw error;
      }
      throw new ResumeGenerationException(
        ResumeGenerationError.VALIDATION_ERROR,
        `Resume generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }
}