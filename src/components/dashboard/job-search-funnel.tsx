'use client';

import { TrendingDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardStats {
  totalJobs: number;
  totalResumes: number;
  totalApplications: number;
  submittedApplications: number;
  pendingApplications: number;
  failedApplications: number;
}

interface JobSearchFunnelProps {
  stats: DashboardStats;
}

export function JobSearchFunnel({ stats }: JobSearchFunnelProps) {
  // Calculate conversion rates
  const jobToResumeRate = stats.totalJobs > 0 
    ? ((stats.totalResumes / stats.totalJobs) * 100).toFixed(0)
    : '0';
  const resumeToAppRate = stats.totalResumes > 0 
    ? ((stats.totalApplications / stats.totalResumes) * 100).toFixed(0)
    : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Search Funnel</CardTitle>
        <CardDescription>
          Conversion from saved jobs to applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Saved Jobs */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Saved Jobs</span>
                <span className="text-2xl font-bold tabular-nums">{stats.totalJobs}</span>
              </div>
              <div className="h-12 bg-chart-1 rounded-lg flex items-center justify-center text-white font-semibold">
                100%
              </div>
            </div>
          </div>

          {/* Arrow & Conversion */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
              <Badge variant="outline" className="text-sm">
                <TrendingDownIcon className="h-3 w-3 mr-1" />
                {jobToResumeRate}%
              </Badge>
            </div>
          </div>

          {/* Resumes Created */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Resumes Created</span>
                <span className="text-2xl font-bold tabular-nums">{stats.totalResumes}</span>
              </div>
              <div 
                className="h-12 bg-chart-2 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ 
                  width: stats.totalJobs > 0 ? `${Math.min((stats.totalResumes / stats.totalJobs) * 100, 100)}%` : '0%' 
                }}
              >
                {jobToResumeRate}%
              </div>
            </div>
          </div>

          {/* Arrow & Conversion */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
              <Badge variant="outline" className="text-sm">
                <TrendingDownIcon className="h-3 w-3 mr-1" />
                {resumeToAppRate}%
              </Badge>
            </div>
          </div>

          {/* Applications */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Applications</span>
                <span className="text-2xl font-bold tabular-nums">{stats.totalApplications}</span>
              </div>
              <div 
                className="h-12 bg-chart-3 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ 
                  width: stats.totalResumes > 0 ? `${Math.min((stats.totalApplications / stats.totalResumes) * 100, 100)}%` : '0%' 
                }}
              >
                {resumeToAppRate}%
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Conversion</span>
              <span className="font-semibold">
                {stats.totalJobs > 0 
                  ? `${((stats.totalApplications / stats.totalJobs) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

