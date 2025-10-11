'use server';

import { CachedLangChainResumeGenerator } from '../../services/langchain/cache';
import { Person, TargetJobJson, Resume, DataTransformationResult, ResumeGenerationInput } from '../../types';
import { getUserId } from '@/lib/auth-utils';

/**
 * Generate a base resume from a person's profile
 * This creates the initial structured resume from raw profile content
 * The base resume is cached and reused for job-specific optimizations
 */
export async function generateBaseResumeAction(person: Person): Promise<Resume> {
  console.log('='.repeat(80));
  console.log('🚀 SERVER ACTION: generateBaseResumeAction called');
  console.log('='.repeat(80));
  console.log('Input person:', {
    name: person?.name,
    raw_content_length: person?.raw_content?.length || 0,
    raw_content_preview: person?.raw_content?.substring(0, 200) || 'MISSING'
  });
  console.log('='.repeat(80));

  if (!person || !person.name || !person.raw_content) {
    const errorMsg = 'Invalid person data: name and raw_content are required';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const generator = new CachedLangChainResumeGenerator();
    const baseResume = await generator.generateBaseResume(person);

    if (!baseResume) {
      throw new Error('Base resume generation returned null/undefined');
    }

    console.log('='.repeat(80));
    console.log('✅ SERVER ACTION: Base resume generation completed');
    console.log('Result summary:', {
      name: baseResume?.name,
      position: baseResume?.position,
      workExperience_count: baseResume?.workExperience?.length || 0,
      skills_count: baseResume?.skills?.length || 0,
      education_count: baseResume?.education?.length || 0,
      summary_length: baseResume?.summary?.length || 0
    });
    console.log('='.repeat(80));

    return baseResume;
  } catch (error) {
    console.error('❌ SERVER ACTION: Base resume generation failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to generate base resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateResumeAction(
  input: ResumeGenerationInput | { targetJob: TargetJobJson }
): Promise<DataTransformationResult> {
  try {
    console.log('='.repeat(80));
    console.log('🚀 SERVER ACTION: generateResumeAction called');
    console.log('='.repeat(80));

    let baseResume: Resume;

    // If baseResume not provided, fetch from profile repository
    if (!('baseResume' in input) || !input.baseResume || !input.baseResume.name) {
      console.log('📥 Fetching base resume from resume repository...');
      const userId = await getUserId();
      const { getProfileRepository, getResumeRepository } = await import('@/services/repositories');
      const profileRepo = await getProfileRepository(userId);
      const resumeRepo = await getResumeRepository(userId);
      
      const profile = await profileRepo.getProfile();

      if (!profile?.baseResumeId) {
        throw new Error('No base resume found. Please create your profile first.');
      }

      const baseResumeFromRepo = await resumeRepo.findById(profile.baseResumeId);
      if (!baseResumeFromRepo) {
        throw new Error('Base resume not found in repository. Please regenerate your profile.');
      }

      baseResume = baseResumeFromRepo;
      console.log('✅ Base resume loaded from repository');
    } else {
      baseResume = input.baseResume;
    }

    console.log('Input baseResume:', {
      name: baseResume?.name,
      position: baseResume?.position,
      workExperience_count: baseResume?.workExperience?.length || 0,
      skills_count: baseResume?.skills?.length || 0
    });
    console.log('Input targetJob:', {
      name: input.targetJob?.name,
      company: input.targetJob?.company,
      raw_content_length: input.targetJob?.raw_content?.length || 0
    });
    console.log('='.repeat(80));

    const generator = new CachedLangChainResumeGenerator();
    const result = await generator.generateResumeWithSteps({
      baseResume,
      targetJob: input.targetJob
    });

    console.log('='.repeat(80));
    console.log('✅ SERVER ACTION: Resume generation completed');
    console.log('Result summary:', {
      name: result.resume?.name,
      position: result.resume?.position,
      workExperience_count: result.resume?.workExperience?.length || 0,
      skills_count: result.resume?.skills?.length || 0,
      education_count: result.resume?.education?.length || 0,
      summary_length: result.resume?.summary?.length || 0
    });
    console.log('='.repeat(80));

    return result;
  } catch (error) {
    console.error('❌ SERVER ACTION: Resume generation failed:', error);
    throw new Error(`Failed to generate resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateResumeSimpleAction(
  input: ResumeGenerationInput
): Promise<Resume> {
  try {
    const generator = new CachedLangChainResumeGenerator();
    const result = await generator.generateResumeWithSteps(input);
    return result.resume;
  } catch (error) {
    console.error('Resume generation failed:', error);
    throw new Error('Failed to generate resume. Please try again.');
  }
}