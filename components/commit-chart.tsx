"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { CommitActivity } from "@/lib/github";

interface CommitChartProps {
  activity: CommitActivity[];
}

export function CommitChart({ activity }: CommitChartProps) {
  if (!activity || activity.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No commit activity data available
      </div>
    );
  }

  const data = activity.map((week) => ({
    week: new Date(week.week * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    commits: week.total,
  }));

  const chartConfig = {
    commits: {
      label: "Commits",
      color: "var(--chart-1)",
    },
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Commit Activity (last 52 weeks)</h3>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={data}>
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            interval={7}
          />
          <YAxis tickLine={false} axisLine={false} fontSize={10} width={30} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="commits"
            fill="var(--color-commits)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
