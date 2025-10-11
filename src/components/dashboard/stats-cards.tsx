'use client';

import { TrendingUpIcon, TrendingDownIcon, BriefcaseIcon, FileTextIcon, SendIcon, CheckCircle2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardFooter,
  CardHeader,
  CardDescription,
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

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Calculate success rate
  const successRate = stats.totalApplications > 0 
    ? ((stats.submittedApplications / stats.totalApplications) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="@xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2">
            <BriefcaseIcon className="h-4 w-4" />
            Saved Jobs
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalJobs}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Total jobs in your pipeline
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Resumes Created
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalResumes}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Tailored resumes generated
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2">
            <SendIcon className="h-4 w-4" />
            Total Applications
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalApplications}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <CheckCircle2Icon className="size-3" />
              {stats.submittedApplications} submitted
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Applications in progress and submitted
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4" />
            Success Rate
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {successRate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {parseFloat(successRate) >= 50 ? (
                <>
                  <TrendingUpIcon className="size-3" />
                  Good
                </>
              ) : (
                <>
                  <TrendingDownIcon className="size-3" />
                  Fair
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Application completion rate
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

