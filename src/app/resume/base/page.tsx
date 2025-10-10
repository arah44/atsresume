import { redirect } from 'next/navigation';
import { getProfileRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';

/**
 * Simple redirect page for /resume/base
 * Loads the base resume ID from profile and redirects to the actual resume
 */
export default async function BaseResumePage() {
  // Get userId from session
  const userId = await getUserId();

  const profileRepo = getProfileRepository(userId);
  const profile = await profileRepo.getProfile();

  if (!profile || !profile.baseResumeId) {
    // No profile or base resume, redirect to profile creation
    redirect('/dashboard/profile');
  }

  // Redirect to the resume editor with the base resume ID
  redirect(`/resume/${profile.baseResumeId}`);
}
