import { getProfileRepository, getResumeRepository, getJobRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { DashboardClientPage } from './DashboardClientPage';

/**
 * Server Component - Fetches all resume data server-side
 */
export default async function DashboardPage() {
  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const profileRepo = getProfileRepository(userId);
  const resumeRepo = getResumeRepository(userId);
  const jobRepo = getJobRepository();

  const [profile, resumesList, jobs] = await Promise.all([
    profileRepo.getProfile(),
    resumeRepo.getResumesList(),
    jobRepo.getAll()
  ]);

  // Pass data to client component
  return (
    <DashboardClientPage
      initialProfile={profile}
      initialResumesList={resumesList}
      initialJobs={jobs}
    />
  );
}
