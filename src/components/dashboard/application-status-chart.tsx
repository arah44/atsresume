'use client';

import * as React from 'react';
import { Pie, PieChart, Label } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DashboardStats {
  totalJobs: number;
  totalResumes: number;
  totalApplications: number;
  submittedApplications: number;
  pendingApplications: number;
  failedApplications: number;
}

interface ApplicationStatusChartProps {
  stats: DashboardStats;
}

export function ApplicationStatusChart({ stats }: ApplicationStatusChartProps) {
  const chartData = [
    { status: 'submitted', count: stats.submittedApplications, fill: 'hsl(var(--chart-1))' },
    { status: 'pending', count: stats.pendingApplications, fill: 'hsl(var(--chart-2))' },
    { status: 'failed', count: stats.failedApplications, fill: 'hsl(var(--chart-3))' },
  ];

  const chartConfig = {
    count: {
      label: 'Applications',
    },
    submitted: {
      label: 'Submitted',
      color: 'hsl(var(--chart-1))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-2))',
    },
    failed: {
      label: 'Failed',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  const totalApplications = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Breakdown of application statuses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalApplications}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {stats.submittedApplications} applications successfully submitted
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {stats.pendingApplications} pending, {stats.failedApplications} failed
        </div>
      </CardFooter>
    </Card>
  );
}

