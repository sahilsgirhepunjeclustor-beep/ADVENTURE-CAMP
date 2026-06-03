import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function SystemHealth() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Health</CardTitle>
        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">API Uptime</p>
            <p className="text-sm font-medium">99.98%</p>
          </div>
          <Progress value={99.98} className="h-2" />
          <p className="text-xs text-muted-foreground">Last 30d</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Server Health</p>
            <p className="text-sm font-medium">96%</p>
          </div>
          <Progress value={96} className="h-2" />
          <p className="text-xs text-muted-foreground">8 nodes - all green</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Database</p>
            <p className="text-sm font-medium">92%</p>
          </div>
          <Progress value={92} className="h-2" />
          <p className="text-xs text-muted-foreground">p95 18ms</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm font-medium">Failed Payments</p>
            <p className="text-sm font-medium">2.1%</p>
          </div>
          <Progress value={2.1} className="h-2 bg-red-500" />
          <p className="text-xs text-muted-foreground">Last 24h</p>
        </div>
      </CardContent>
    </Card>
  );
}
