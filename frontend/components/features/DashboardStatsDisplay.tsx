"use client";

import { DashboardStats, ServiceRequest } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  Wrench,
  BarChart3,
  ClipboardList,
  TrendingDown,
} from "lucide-react";

interface Props {
  stats: DashboardStats;
  requests: ServiceRequest[];
}

// Màu sắc cho Pie Chart
const PIE_COLORS: Record<string, string> = {
  Available: "#22c55e",       // green-500
  Broken: "#ef4444",          // red-500
  "Under Maintenance": "#f59e0b", // amber-500
};

export function DashboardStatsDisplay({ stats, requests }: Props) {
  const { assetStats, lowStockAlerts } = stats;

  // Dữ liệu cho Pie Chart thiết bị theo trạng thái
  const pieData = [
    { name: "Available", value: Number(assetStats.available) },
    { name: "Broken", value: Number(assetStats.broken) },
    { name: "Under Maintenance", value: Number(assetStats.underMaintenance) },
  ].filter((d) => d.value > 0); // Bỏ qua trạng thái có giá trị 0

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Báo cáo tổng hợp tình trạng thiết bị và tồn kho linh kiện.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thiết bị</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assetStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Trong hệ thống</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sẵn sàng</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{assetStats.available}</div>
            <p className="text-xs text-muted-foreground mt-1">Thiết bị đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hỏng hóc</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{assetStats.broken}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCount} phiếu chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang bảo trì</CardTitle>
            <Wrench className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{assetStats.underMaintenance}</div>
            <p className="text-xs text-muted-foreground mt-1">{completedCount} phiếu đã hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Row: Pie Chart + Low Stock Alerts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Pie Chart - Trạng thái thiết bị */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Phân bố trạng thái thiết bị
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground italic">
                Không có dữ liệu thiết bị.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [`${value} thiết bị`, ""]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Cảnh báo tồn kho thấp
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Tất cả linh kiện đều đủ hàng.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((alert) => {
                  const isCritical = alert.quantity <= 5;
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCritical
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-full ${
                            isCritical ? "bg-red-100" : "bg-amber-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              isCritical ? "text-red-600" : "text-amber-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{alert.partName}</p>
                          <p className="text-xs text-muted-foreground">
                            Ngưỡng: {alert.threshold} đơn vị
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={isCritical ? "destructive" : "outline"}
                        className={`font-bold ${
                          !isCritical && "text-amber-700 border-amber-400"
                        }`}
                      >
                        Còn {alert.quantity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Repair Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Phiếu sửa chữa gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-6 text-center">
              Chưa có phiếu sửa chữa nào.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 6).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <Wrench className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{req.asset?.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {req.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      req.status === "COMPLETED"
                        ? "secondary"
                        : req.status === "PENDING"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
