import { redirect } from 'next/navigation';
import { getProfileRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';

/**
 * Simple redirect page for /resume/base
 * Loads the base resume from profile and redirects to /resume/base-resume
 */
export default async function BaseResumePage() {
  // Get userId from session
  const userId = await getUserId();

  const profileRepo = getProfileRepository(userId);
  const profile = await profileRepo.getProfile();

  if (!profile || !profile.baseResume) {
    // No profile or base resume, redirect to profile creation
    redirect('/dashboard/profile');
  }

  // Redirect to the resume editor with the base-resume ID
  redirect('/resume/base-resume');
}
