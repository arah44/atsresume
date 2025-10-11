'use client';

import { SavedApplication } from '@/services/repositories';
import {
  StatsCards,
  ApplicationActivityChart,
  ApplicationStatusChart,
  JobSearchFunnel,
} from '@/components/dashboard';

interface DashboardStats {
  totalJobs: number;
  totalResumes: number;
  totalApplications: number;
  submittedApplications: number;
  pendingApplications: number;
  failedApplications: number;
}

interface DashboardOverviewClientPageProps {
  stats: DashboardStats;
  applications: SavedApplication[];
}

export function DashboardOverviewClientPage({
  stats,
  applications,
}: DashboardOverviewClientPageProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Section */}
      <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
        <ApplicationActivityChart applications={applications} />
        <ApplicationStatusChart stats={stats} />
      </div>

      {/* Funnel Visualization */}
      <div className="px-4 lg:px-6">
        <JobSearchFunnel stats={stats} />
      </div>
    </div>
  );
}

