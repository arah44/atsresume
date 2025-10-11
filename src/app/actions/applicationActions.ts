'use server';

import { getApplicationRepository } from '@/services/repositories';
import { JobApplication } from '@/types';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

/**
 * MUTATION: Save new application
 */
export async function saveApplicationAction(
  application: Omit<JobApplication, 'id' | 'timestamp'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const applicationRepo = await getApplicationRepository(userId);

    const id = await applicationRepo.save({ ...application, userId });

    console.log('✅ Application saved for user:', userId, 'ID:', id);

    // Revalidate job pages
    revalidatePath(`/dashboard/jobs/${application.job_id}`);

    return { success: true, id };
  } catch (error) {
    console.error('❌ Failed to save application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save application'
    };
  }
}

/**
 * MUTATION: Update application
 */
export async function updateApplicationAction(
  id: string,
  updates: Partial<JobApplication>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const applicationRepo = await getApplicationRepository(userId);

    const updated = await applicationRepo.updateOne(id, updates);

    if (!updated) {
      return { success: false, error: 'Application not found' };
    }

    console.log('✅ Application updated for user:', userId, 'ID:', id);

    // Revalidate pages
    revalidatePath('/dashboard/jobs');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update application'
    };
  }
}

/**
 * MUTATION: Delete application
 */
export async function deleteApplicationAction(id: string): Promise<{ success: boolean }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const applicationRepo = await getApplicationRepository(userId);

    const deleted = await applicationRepo.deleteOne(id);

    if (deleted) {
      console.log('✅ Application deleted for user:', userId, 'ID:', id);
    }

    // Revalidate pages
    revalidatePath('/dashboard/jobs');

    return { success: deleted };
  } catch (error) {
    console.error('❌ Failed to delete application:', error);
    return { success: false };
  }
}

/**
 * MUTATION: Delete all applications for a job
 */
export async function deleteApplicationsByJobIdAction(
  jobId: string
): Promise<{ success: boolean; count: number }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const applicationRepo = await getApplicationRepository(userId);

    const count = await applicationRepo.deleteByJobId(jobId);
    console.log(`✅ Deleted ${count} applications for user: ${userId}, job: ${jobId}`);

    // Revalidate job pages
    revalidatePath(`/dashboard/jobs/${jobId}`);
    revalidatePath('/dashboard/jobs');

    return { success: true, count };
  } catch (error) {
    console.error('❌ Failed to delete applications:', error);
    return { success: false, count: 0 };
  }
}
