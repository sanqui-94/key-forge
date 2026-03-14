import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsageOverview } from "@/app/actions/dashboard.actions";
import { Activity, Key, AlertTriangle } from "lucide-react";

export async function UsageOverviewCards() {
  const { totalRequests, activeKeys, errorRate } = await getUsageOverview();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all valid keys</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeKeys}</div>
          <p className="text-xs text-muted-foreground">Currently valid API keys</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{errorRate}%</div>
          <p className="text-xs text-muted-foreground">Requests resulting in an error</p>
        </CardContent>
      </Card>
    </div>
  );
}
