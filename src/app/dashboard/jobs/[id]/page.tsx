import { getJobRepository, getResumeRepository, getProfileRepository, getApplicationRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { JobDetailsClientPage } from './JobDetailsClientPage';
import { notFound } from 'next/navigation';

interface JobDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Server Component - Fetches job details and related data server-side
 */
export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id: jobId } = await params;

  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const jobRepo = getJobRepository();
  const resumeRepo = getResumeRepository(userId);
  const profileRepo = getProfileRepository(userId);
  const applicationRepo = getApplicationRepository(userId);

  const [job, resumes, profile, hasApplied] = await Promise.all([
    jobRepo.getById(jobId),
    resumeRepo.getAll(),
    profileRepo.getProfile(),
    applicationRepo.hasApplied(jobId)
  ]);

  // If job not found, show 404
  if (!job) {
    notFound();
  }

  // Find resume for this job
  const resumeForJob = resumes.find(resume => {
    const targetJob = resume.generationMetadata?.targetJob;
    return targetJob?.name === job.name && targetJob?.company === job.company;
  });

  // Pass data to client component
  return (
    <JobDetailsClientPage
      job={job}
      resumeId={resumeForJob?.id || null}
      hasProfile={!!profile}
      hasBaseResume={!!profile?.baseResumeId}
      hasApplied={hasApplied}
    />
  );
}
