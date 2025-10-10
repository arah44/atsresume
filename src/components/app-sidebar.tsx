"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  HelpCircleIcon,
  SparklesIcon,
  UserIcon,
  BriefcaseIcon,
  PlusIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { CreateResumeWizard } from "@/components/dialogs/CreateResumeWizard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { UserProfile } from "@/services/repositories/ProfileRepository"
import { SavedJob } from "@/services/repositories/JobRepository"

const navMain = [
  {
    title: "My Resumes",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Profiles",
    url: "/dashboard/profile",
    icon: UserIcon,
  },
  {
    title: "Jobs",
    url: "/dashboard/jobs",
    icon: BriefcaseIcon,
  },
];

const navSecondary = [
  {
    title: "Help & Guide",
    url: "#",
    icon: HelpCircleIcon,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialProfile: UserProfile | null
  initialJobs: SavedJob[]
}

export function AppSidebar({ initialProfile, initialJobs, ...props }: AppSidebarProps) {
  const [isWizardOpen, setIsWizardOpen] = React.useState(false)
  const { data: session, isPending } = useSession()

  // Get user display data from session
  const userData = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email,
    avatar: session.user.image || '/assets/logo.png',
  } : {
    name: 'Guest',
    email: 'guest@atsresume.com',
    avatar: '/assets/logo.png',
  }

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="/">
                  <SparklesIcon className="w-5 h-5" />
                  <span className="text-base font-semibold">Jobsly</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Create New Resume Button */}
          <div className="px-2 pt-2">
            <Button
              onClick={() => setIsWizardOpen(true)}
              className="gap-2 w-full"
              size="sm"
              disabled={isPending}
            >
              <PlusIcon className="w-4 h-4" />
              Create New Resume
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      {/* Create Resume Wizard Dialog */}
      <CreateResumeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        initialProfile={initialProfile}
        initialJobs={initialJobs}
      />
    </>
  )
}
