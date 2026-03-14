"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface UsageChartClientProps {
  data: { date: string; requests: number }[];
}

export function UsageChartClient({ data }: UsageChartClientProps) {
  return (
    <Card className="col-span-4 mt-4">
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
        <CardDescription>Your API request volume over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="pl-0 sm:pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={data}
            margin={{
              left: 0,
              right: 12,
              top: 12,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="requests"
              type="monotone"
              fill="var(--color-requests)"
              fillOpacity={0.4}
              stroke="var(--color-requests)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
