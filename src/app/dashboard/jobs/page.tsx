import { getJobRepository, getProfileRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { JobsClientPage } from './JobsClientPage';

/**
 * Server Component - Fetches jobs data server-side
 */
export default async function JobsPage() {
  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const jobRepo = getJobRepository();
  const profileRepo = getProfileRepository(userId);

  const [jobs, profile] = await Promise.all([
    jobRepo.getAllSorted(),
    profileRepo.getProfile()
  ]);

  // Pass data to client component
  return (
    <JobsClientPage
      initialJobs={jobs}
      hasProfile={!!profile}
      hasBaseResume={!!profile?.baseResume}
    />
  );
}
