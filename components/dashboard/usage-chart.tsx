import { getUsageChartData } from "@/app/actions/dashboard.actions";
import { UsageChartClient } from "./usage-chart-client";

export async function UsageChart() {
  const data = await getUsageChartData(30);

  return <UsageChartClient data={data} />;
}
