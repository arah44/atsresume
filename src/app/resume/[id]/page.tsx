import { getResumeRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { ResumeClientPage } from './ResumeClientPage';
import { notFound } from 'next/navigation';

interface ResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Server Component - Fetches resume server-side
 */
export default async function ResumePage({ params }: ResumePageProps) {
  const { id } = await params;

  // Get userId from session
  const userId = await getUserId();
  const resumeRepo = getResumeRepository(userId);

  // Special case: 'base-resume' ID
  const isBaseResume = id === 'base-resume';

  let resume;

  if (isBaseResume) {
    // Load base resume from profile
    const { getProfileRepository } = await import('@/services/repositories');
    const profileRepo = getProfileRepository(userId);
    const profile = await profileRepo.getProfile();

    if (!profile?.baseResume) {
      notFound();
    }

    resume = { ...profile.baseResume, id: 'base-resume' };
  } else {
    // Load regular resume by ID
    resume = await resumeRepo.getById(id);

    if (!resume) {
      notFound();
    }
  }

  return (
    <ResumeClientPage
      resume={resume}
      isBaseResume={isBaseResume}
    />
  );
}
