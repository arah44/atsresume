'use server';

import { getJobRepository } from '@/services/repositories';
import { TargetJobJson } from '@/types';
import { revalidatePath } from 'next/cache';

const jobRepo = getJobRepository();

/**
 * MUTATION: Save new job
 */
export async function saveJobAction(
  job: TargetJobJson
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await jobRepo.save(job);
    console.log('✅ Job saved:', id);
    
    // Revalidate job pages
    revalidatePath('/dashboard/jobs');
    
    return { success: true, id };
  } catch (error) {
    console.error('❌ Failed to save job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save job'
    };
  }
}

/**
 * MUTATION: Update existing job
 */
export async function updateJobAction(
  id: string,
  updates: Partial<TargetJobJson>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = await jobRepo.update(id, updates);
    
    if (!updated) {
      return { success: false, error: 'Job not found' };
    }

    console.log('✅ Job updated:', id);
    
    // Revalidate job pages
    revalidatePath('/dashboard/jobs');
    revalidatePath(`/dashboard/jobs/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update job'
    };
  }
}

/**
 * MUTATION: Delete job
 */
export async function deleteJobAction(id: string): Promise<{ success: boolean }> {
  try {
    const deleted = await jobRepo.delete(id);
    
    if (deleted) {
      console.log('✅ Job deleted:', id);
    }
    
    // Revalidate job pages
    revalidatePath('/dashboard/jobs');
    
    return { success: deleted };
  } catch (error) {
    console.error('❌ Failed to delete job:', error);
    return { success: false };
  }
}
