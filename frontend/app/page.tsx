"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getServiceRequests } from "@/app/actions/repairs";
import { ServiceRequest } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getServiceRequests();
        setRequests(data);
      } catch (error) {
        console.error("Dashboard data load error", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const inProgressCount = requests.filter(r => r.status === 'ASSIGNED').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
  
  const stats = [
    { name: 'Total Tickets', value: requests.length, icon: Package, color: 'text-blue-600' },
    { name: 'Pending Repairs', value: pendingCount, icon: AlertTriangle, color: 'text-red-600' },
    { name: 'In Progress', value: inProgressCount, icon: Wrench, color: 'text-amber-600' },
    { name: 'Completed Total', value: completedCount, icon: CheckCircle, color: 'text-green-600' },
  ];

  const recentLogs = requests
    .filter(r => r.status === 'COMPLETED' && r.logs && r.logs.length > 0)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Quick summary of the hospital's asset maintenance status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Maintenance Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 bg-muted animate-pulse rounded" />
                <div className="h-12 bg-muted animate-pulse rounded" />
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground italic py-4">
                No recent maintenance logs found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((req) => (
                  <div key={req.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="mt-1 bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold">{req.asset?.name}</p>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(req.completedAt!)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Engineer: {req.logs![0].engineerUsername}</p>
                      <p className="text-sm line-clamp-1 italic text-muted-foreground">
                        "{req.logs![0].resolutionDetails}"
                      </p>
                      <div className="flex gap-1 mt-1">
                        {req.logs![0].usedParts.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0">
                            {p.partName} x{p.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Repair Backlog</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {requests.filter(r => r.status === 'PENDING').slice(0, 4).map(req => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{req.asset?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.description}</p>
                  </div>
                </div>
              ))}
              {pendingCount > 4 && (
                <p className="text-xs text-center text-muted-foreground">+{pendingCount - 4} more pending requests</p>
              )}
              {pendingCount === 0 && (
                <div className="text-sm text-muted-foreground italic py-4">No pending repairs.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

