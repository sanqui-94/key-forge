import { Suspense } from "react";
import { UsageOverviewCards } from "@/components/dashboard/usage-overview-cards";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { UsageOverviewSkeleton, UsageChartSkeleton } from "@/components/dashboard/skeletons";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Suspense fallback={<UsageOverviewSkeleton />}>
        <UsageOverviewCards />
      </Suspense>

      <Suspense fallback={<UsageChartSkeleton />}>
        <UsageChart />
      </Suspense>
    </div>
  );
}
