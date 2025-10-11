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
  const resumeRepo = await getResumeRepository(userId);

  // Load resume by ID from repository
  const resume = await resumeRepo.findById(id);

  if (!resume) {
    notFound();
  }

  // Determine if this is a base resume (no jobId)
  const isBaseResume = !resume.jobId;

  return (
    <ResumeClientPage
      resume={resume}
      isBaseResume={isBaseResume}
    />
  );
}
