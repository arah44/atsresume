import { getProfileRepository, getResumeRepository, getJobRepository } from '@/services/repositories';
import { getUserId } from '@/lib/auth-utils';
import { ResumeClientPage } from './ResumeClientPage';

/**
 * Server Component - Fetches all resume data server-side
 */
export default async function DashboardPage() {
  // Get userId from session
  const userId = await getUserId();

  // Fetch data server-side using repositories
  const profileRepo = await getProfileRepository(userId);
  const resumeRepo = await getResumeRepository(userId);
  const jobRepo = await getJobRepository();

  const [profile, resumesList, jobs] = await Promise.all([
    profileRepo.getProfile(),
    resumeRepo.getResumesList(),
    jobRepo.findAll(),
  ]);

  const baseResume = profile?.baseResumeId ? await resumeRepo.findById(profile.baseResumeId) : null;

  const filteredResumesList = resumesList.filter(resume => resume.id !== profile?.baseResumeId);



  // Pass data to client component
  return (
    <ResumeClientPage
      profile={profile}
      resumesList={filteredResumesList}
      jobs={jobs}
      baseResume={baseResume}
    />
  );
}
