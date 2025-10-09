'use server';

import { getResumeRepository } from '@/services/repositories';
import { Resume } from '@/types';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

/**
 * MUTATION: Save resume
 */
export async function saveResumeAction(
  resume: Resume
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const resumeRepo = getResumeRepository(userId);

    const id = await resumeRepo.saveResume(resume);
    console.log('✅ Resume saved for user:', userId, 'ID:', id);

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath(`/resume/${id}`);

    return { success: true, id };
  } catch (error) {
    console.error('❌ Failed to save resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save resume'
    };
  }
}

/**
 * MUTATION: Save base resume
 */
export async function saveBaseResumeAction(
  resume: Resume
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const resumeRepo = getResumeRepository(userId);

    await resumeRepo.saveBaseResume(resume);
    console.log('✅ Base resume saved for user:', userId);

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/resume/base');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to save base resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save base resume'
    };
  }
}

/**
 * MUTATION: Update resume
 */
export async function updateResumeAction(
  id: string,
  updates: Partial<Resume>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const resumeRepo = getResumeRepository(userId);

    const updated = await resumeRepo.update(id, updates);

    if (!updated) {
      return { success: false, error: 'Resume not found' };
    }

    console.log('✅ Resume updated for user:', userId, 'ID:', id);

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath(`/resume/${id}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update resume'
    };
  }
}

/**
 * MUTATION: Delete resume
 */
export async function deleteResumeAction(id: string): Promise<{ success: boolean }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const resumeRepo = getResumeRepository(userId);

    const deleted = await resumeRepo.delete(id);

    if (deleted) {
      console.log('✅ Resume deleted for user:', userId, 'ID:', id);
    }

    // Revalidate pages
    revalidatePath('/dashboard');

    return { success: deleted };
  } catch (error) {
    console.error('❌ Failed to delete resume:', error);
    return { success: false };
  }
}
