import { getProfileRepository, getResumeRepository, getJobRepository, getApplicationRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { DashboardOverviewClientPage } from './DashboardOverviewClientPage';

/**
 * Server Component - Fetches dashboard statistics and data
 */
export default async function DashboardPage() {
  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const profileRepo = await getProfileRepository(userId);
  const resumeRepo = await getResumeRepository(userId);
  const jobRepo = await getJobRepository();
  const applicationRepo = await getApplicationRepository(userId);

  const [profile, resumesList, jobs, applicationStats, allApplications] = await Promise.all([
    profileRepo.getProfile(),
    resumeRepo.getResumesList(),
    jobRepo.findAll(),
    applicationRepo.getStatistics(),
    applicationRepo.getAll(),
  ]);

  // Calculate counts
  const stats = {
    totalJobs: jobs.length,
    totalResumes: resumesList.length,
    totalApplications: applicationStats.total,
    submittedApplications: applicationStats.submitted,
    pendingApplications: applicationStats.pending,
    failedApplications: applicationStats.failed,
  };

  // Pass data to client component
  return (
    <DashboardOverviewClientPage
      stats={stats}
      applications={allApplications}
    />
  );
}