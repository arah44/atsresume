'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { SavedApplication } from '@/services/repositories';

interface ApplicationActivityChartProps {
  applications: SavedApplication[];
}

export function ApplicationActivityChart({ applications }: ApplicationActivityChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('7d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  // Generate chart data from applications
  const chartData = React.useMemo(() => {
    const now = new Date();
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Create array of dates
    const dates: Date[] = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    // Count applications per day
    const dataMap = new Map<string, { date: string; applications: number; submitted: number }>();
    dates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, { date: dateStr, applications: 0, submitted: 0 });
    });

    applications.forEach(app => {
      const appDate = new Date(app.timestamp);
      appDate.setHours(0, 0, 0, 0);
      const dateStr = appDate.toISOString().split('T')[0];
      
      if (dataMap.has(dateStr)) {
        const data = dataMap.get(dateStr);
        if (data) {
          data.applications += 1;
          if (app.status === 'submitted') {
            data.submitted += 1;
          }
        }
      }
    });

    return Array.from(dataMap.values());
  }, [applications, timeRange]);

  const chartConfig = {
    applications: {
      label: 'Total Applications',
      color: 'hsl(var(--chart-1))',
    },
    submitted: {
      label: 'Submitted',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Application Activity</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Applications over the selected period
          </span>
          <span className="@[540px]/card:hidden">Application trends</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              7 days
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              90 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-32"
              aria-label="Select time range"
            >
              <SelectValue placeholder="7 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillApplications" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-applications)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-applications)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-submitted)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-submitted)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="applications"
              type="monotone"
              fill="url(#fillApplications)"
              stroke="var(--color-applications)"
              stackId="a"
            />
            <Area
              dataKey="submitted"
              type="monotone"
              fill="url(#fillSubmitted)"
              stroke="var(--color-submitted)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

