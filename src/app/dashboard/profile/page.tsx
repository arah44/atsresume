import { getProfileRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { ProfileClientPage } from './ProfileClientPage';

/**
 * Server Component - Fetches data server-side
 * Passes data to client component
 * Note: Onboarding wizard is handled in dashboard layout
 */
export default async function ProfilePage() {
  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const profileRepo = await getProfileRepository(userId);
  const { getResumeRepository } = await import('@/services/repositories');
  const resumeRepo = await getResumeRepository(userId);

  const profile = await profileRepo.getProfile();
  const baseResume = profile?.baseResumeId ? await resumeRepo.findById(profile.baseResumeId) : null;

  // Pass data to client component
  return (
    <ProfileClientPage
      initialProfile={profile}
      baseResume={baseResume}
    />
  );
}
