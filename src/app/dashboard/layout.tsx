import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProfileRepository, getJobRepository } from "@/services/repositories"
import { getUserId } from "@/lib/auth-utils"
import { DashboardLayoutClient } from "./DashboardLayoutClient"

/**
 * Dashboard Layout - Server Component
 * Fetches common data (profile, jobs) and shows onboarding wizard if no profile
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Get userId from session
  const userId = await getUserId()

  // Fetch profile and jobs for wizard
  const profileRepo = getProfileRepository(userId)
  const jobRepo = getJobRepository()

  const [profile, jobs] = await Promise.all([
    profileRepo.getProfile(),
    jobRepo.getAllSorted()
  ])

  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        initialProfile={profile}
        initialJobs={jobs}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardLayoutClient initialProfile={profile}>
                {children}
              </DashboardLayoutClient>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
