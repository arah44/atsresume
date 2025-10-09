'use server';

import { getProfileRepository, type UserProfile } from '@/services/repositories';
import { Person } from '@/types';
import { generateBaseResumeAction } from './resumeGeneration';
import { getUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

/**
 * MUTATION: Save or update user profile with base resume generation
 */
export async function saveProfileAction(
  data: Person
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get userId from session
    const userId = await getUserId();
    const profileRepo = getProfileRepository(userId);

    console.log('📝 Saving profile for user:', userId);

    // Generate base resume from profile
    const baseResume = await generateBaseResumeAction(data);

    // Save profile with base resume
    await profileRepo.saveProfile({
      name: data.name,
      raw_content: data.raw_content,
      email: data.email,
      phone: data.phone,
      baseResume,
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
    const profileRepo = getProfileRepository(userId);

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
    const profileRepo = getProfileRepository(userId);

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
    const profileRepo = getProfileRepository(userId);

    const profile = await profileRepo.getProfile();

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Generate new base resume
    const baseResume = await generateBaseResumeAction({
      name: profile.name,
      raw_content: profile.raw_content
    });

    // Update profile with new base resume
    await profileRepo.updateProfile({ baseResume });

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
