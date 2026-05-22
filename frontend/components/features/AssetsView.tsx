"use client";

import { Asset } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportFailureForm } from "@/components/features/ReportFailureForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface AssetsViewProps {
  assets: Asset[];
  userRole?: string;
}

export function AssetsView({ assets, userRole }: AssetsViewProps) {
  const canReportFailure = ['ADMIN', 'DOCTOR'].includes(userRole || '');

  const statusLabels: Record<Asset['status'], string> = {
    AVAILABLE: "Sẵn sàng",
    BROKEN: "Hỏng hóc",
    UNDER_MAINTENANCE: "Đang bảo trì",
    MAINTENANCE_DUE: "Đến hạn bảo trì",
  };

  const statusBadgeStyles: Record<Asset['status'], string> = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 border font-medium",
    UNDER_MAINTENANCE: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 border font-medium",
    BROKEN: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 border font-medium",
    MAINTENANCE_DUE: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 border font-medium",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh mục thiết bị</h2>
          <p className="text-muted-foreground">Quản lý và theo dõi danh sách trang thiết bị y tế của bệnh viện.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên thiết bị</TableHead>
                <TableHead>Mã thiết bị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Bảo trì tiếp theo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.code}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeStyles[asset.status]}>
                      {statusLabels[asset.status] || asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.nextMaintenanceDate ? (
                      <span className="text-sm">{formatDate(asset.nextMaintenanceDate)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Không có</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {asset.status === 'AVAILABLE' && canReportFailure && (
                      <ReportFailureForm assetId={asset.id} assetName={asset.name} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
