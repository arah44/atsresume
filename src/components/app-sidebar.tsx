"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  HelpCircleIcon,
  HomeIcon,
  SparklesIcon,
  UserIcon,
  BriefcaseIcon,
  PlusIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { CreateResumeWizard } from "@/components/resumeGenerator/CreateResumeWizard"
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

const data = {
  user: {
    name: "Resume Builder",
    email: "user@atsresume.com",
    avatar: "/assets/logo.png",
  },
  navMain: [

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
  ],
  navSecondary: [
    {
      title: "Help & Guide",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isWizardOpen, setIsWizardOpen] = React.useState(false)

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
            >
              <PlusIcon className="w-4 h-4" />
              Create New Resume
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* Create Resume Wizard Dialog */}
      <CreateResumeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
    </>
  )
}
