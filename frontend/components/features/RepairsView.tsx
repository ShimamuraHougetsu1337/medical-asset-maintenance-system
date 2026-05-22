"use client";

import { useState } from "react";
import { ServiceRequest, InventoryItem } from "@/types";
import { CompleteRepairModal } from "@/components/features/CompleteRepairModal";
import { startMaintenance } from "@/actions/repairs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wrench, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExportButton } from "@/components/ui/ExportButton";

interface RepairsViewProps {
  initialRequests: ServiceRequest[];
  inventory: InventoryItem[];
}

export function RepairsView({ initialRequests, inventory }: RepairsViewProps) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartMaintenance = async (id: string | number) => {
    const result = await startMaintenance(id);
    if (result.success) {
      toast.success("Bắt đầu sửa chữa. Trạng thái thiết bị cập nhật thành ĐANG BẢO TRÌ.");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleCompleteClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  
  const activeRequests = initialRequests
    .filter(r => r.status !== "COMPLETED")
    .sort((a, b) => priorityOrder[a.priority || 'LOW'] - priorityOrder[b.priority || 'LOW']);
  const completedRequests = initialRequests.filter(r => r.status === "COMPLETED");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng yêu cầu sửa chữa</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và tiếp nhận các yêu cầu sửa chữa, bảo trì thiết bị từ các khoa phòng.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton url="http://localhost:8080/api/service-requests/export-critical" filename="critical_incidents.xlsx" label="Xuất nhật ký khẩn cấp" />
          <ExportButton url="http://localhost:8080/api/service-requests/export" filename="service_requests_report.xlsx" label="Xuất danh sách yêu cầu" />
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Người báo cáo</TableHead>
              <TableHead>Mô tả sự cố</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Ngày báo cáo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                  Không có yêu cầu sửa chữa nào đang chờ xử lý.
                </TableCell>
              </TableRow>
            ) : (
              activeRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.assetName}</TableCell>
                  <TableCell>{req.reportedByUsername}</TableCell>
                  <TableCell className="max-w-xs truncate" title={req.description}>
                    {req.description}
                  </TableCell>
                  <TableCell>
                    {req.priority === 'CRITICAL' ? (
                      <Badge variant="destructive" className="animate-pulse bg-red-600">KHẨN CẤP</Badge>
                    ) : (
                      <Badge variant="outline" className={
                        req.priority === 'HIGH' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                        req.priority === 'MEDIUM' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                        'text-slate-600 border-slate-200 bg-slate-50'
                      }>
                        {req.priority === 'HIGH' ? 'CAO' : req.priority === 'MEDIUM' ? 'TRUNG BÌNH' : 'THẤP'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {req.createdAt ? formatDate(req.createdAt) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'PENDING' ? 'destructive' : 'default'} className={
                      req.status === 'PENDING' ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200' :
                      req.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200' :
                      'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
                    }>
                      {req.status === 'PENDING' ? 'Chờ xử lý' : req.status === 'ASSIGNED' ? 'Đang thực hiện' : req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'PENDING' ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleStartMaintenance(req.id)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Tiếp nhận
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteClick(req)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Hoàn thành
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Lịch sử sửa chữa & bảo trì</h2>
        <div className="rounded-md border shadow-sm bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên thiết bị</TableHead>
                <TableHead>Sự cố</TableHead>
                <TableHead>Phương án xử lý</TableHead>
                <TableHead>Linh kiện đã dùng</TableHead>
                <TableHead>Ngày hoàn thành</TableHead>
                <TableHead className="text-right">Biên bản bàn giao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                    Không có lịch sử sửa chữa nào.
                  </TableCell>
                </TableRow>
              ) : (
                completedRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.assetName}</TableCell>
                    <TableCell className="max-w-xs truncate" title={req.description}>
                      {req.description}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {req.logs && req.logs.length > 0 ? (
                        <div>
                          <p className="text-sm font-semibold text-primary">Kỹ sư: {req.logs[0].engineerUsername}</p>
                          <p className="text-sm italic">&quot;{req.logs[0].resolutionDetails}&quot;</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Không có chi tiết xử lý</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.logs && req.logs[0]?.usedParts?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {req.logs[0].usedParts.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {p.partName} x{p.quantity}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Không dùng linh kiện</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.completedAt ? formatDate(req.completedAt) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <ExportButton 
                        url={`http://localhost:8080/api/service-requests/${req.id}/export-protocol`} 
                        filename={`handover_protocol_${req.id}.xlsx`} 
                        label="Xuất biên bản" 
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CompleteRepairModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inventory={inventory}
      />
    </div>
  );
}
