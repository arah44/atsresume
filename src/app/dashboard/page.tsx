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

  const baseResume = profile?.baseResumeId ? await resumeRepo.getById(profile.baseResumeId) : null;

  const filteredResumesList = resumesList.filter(resume => resume.id !== profile?.baseResumeId);



  // Pass data to client component
  return (
    <DashboardClientPage
      profile={profile}
      resumesList={filteredResumesList}
      jobs={jobs}
      baseResume={baseResume}
    />
  );
}
