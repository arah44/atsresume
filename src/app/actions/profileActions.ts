'use server';

import { getProfileRepository, type UserProfile } from '@/services/repositories';
import { Person, Resume } from '@/types';
import { generateBaseResumeAction } from './resumeGeneration';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Server-side validation schema (matches client-side)
 */
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  raw_content: z.string().min(10, 'Raw content must be at least 10 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional()
});

/**
 * MUTATION: Save or update user profile with base resume generation
 */
export async function saveProfileAction(
  data: Person
): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> {
  try {
    // Server-side validation using safeParse
    const validation = profileSchema.safeParse(data);

    if (!validation.success) {
      console.error('❌ Server validation failed:', validation.error.issues);

      // Convert Zod issues to field errors
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString();
        if (fieldName) {
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(issue.message);
        }
      });

      return {
        success: false,
        error: 'Validation failed. Please check your input.',
        fieldErrors
      };
    }

    // Get userId from session
    const userId = await getUserId();
    const profileRepo = await getProfileRepository(userId);

    console.log('📝 Saving profile for user:', userId);

    // Use validated data
    const validatedData = validation.data;

    // Generate base resume from profile
    const baseResume = await generateBaseResumeAction(validatedData);

    // Save base resume to resume repository
    const { getResumeRepository } = await import('@/services/repositories');
    const resumeRepo = await getResumeRepository(userId);
    const baseResumeId = await resumeRepo.saveBaseResume(baseResume);

    // Save profile with base resume ID reference
    await profileRepo.saveProfile({
      name: validatedData.name,
      raw_content: validatedData.raw_content,
      email: validatedData.email,
      phone: validatedData.phone,
      baseResumeId,
      metadata: {
        lastUpdated: Date.now()
      }
    });

    console.log('✅ Profile and base resume saved for user:', userId);

    // Revalidate profile page
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to save profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save profile'
    };
  }
}

/**
 * MUTATION: Update profile fields
 */
export async function updateProfileAction(
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const profileRepo = await getProfileRepository(userId);

    // If baseResume is being updated, save it to resume repository first
    if ('baseResume' in updates && updates.baseResume) {
      const { getResumeRepository } = await import('@/services/repositories');
      const resumeRepo = await getResumeRepository(userId);
      const baseResumeId = await resumeRepo.saveBaseResume(updates.baseResume as Resume);
      
      // Replace baseResume with baseResumeId
      const { baseResume, ...otherUpdates } = updates as any;
      updates = { ...otherUpdates, baseResumeId };
    }

    const updated = await profileRepo.updateProfile(updates);

    if (!updated) {
      return { success: false, error: 'Profile not found' };
    }

    console.log('✅ Profile updated for user:', userId);

    // Revalidate profile page
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}

/**
 * MUTATION: Delete user profile
 */
export async function deleteProfileAction(): Promise<{ success: boolean }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const profileRepo = await getProfileRepository(userId);

    await profileRepo.deleteProfile();
    console.log('✅ Profile deleted for user:', userId);

    // Revalidate pages
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to delete profile:', error);
    return { success: false };
  }
}

/**
 * MUTATION: Regenerate base resume from existing profile
 */
export async function regenerateBaseResumeAction(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const profileRepo = await getProfileRepository(userId);
    const { getResumeRepository } = await import('@/services/repositories');
    const resumeRepo = await getResumeRepository(userId);

    const profile = await profileRepo.getProfile();

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Delete old base resume if it exists
    if (profile.baseResumeId) {
      try {
        await resumeRepo.deleteOne(profile.baseResumeId);
      } catch (error) {
        console.warn('Failed to delete old base resume:', error);
      }
    }

    // Generate new base resume
    const baseResume = await generateBaseResumeAction({
      name: profile.name,
      raw_content: profile.raw_content
    });

    // Save new base resume to repository
    const baseResumeId = await resumeRepo.saveBaseResume(baseResume);

    // Update profile with new base resume ID
    await profileRepo.updateProfile({ baseResumeId });

    console.log('✅ Base resume regenerated for user:', userId);

    // Revalidate pages
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to regenerate base resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to regenerate base resume'
    };
  }
}
