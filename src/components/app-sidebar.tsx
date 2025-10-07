"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileTextIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  FolderIcon,
  HelpCircleIcon,
  HomeIcon,
  SparklesIcon,
  UserIcon,
  BriefcaseIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
      title: "Create Resume",
      url: "/",
      icon: PlusCircleIcon,
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
  documents: [
    {
      name: "Recent Resumes",
      url: "/dashboard",
      icon: FolderIcon,
    },
    {
      name: "Templates",
      url: "/",
      icon: FileTextIcon,
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
  return (
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
                <span className="text-base font-semibold">ATSResume</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
