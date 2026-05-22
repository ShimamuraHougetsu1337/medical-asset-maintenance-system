"use client";

import { useState } from "react";
import { Asset } from "@/types";
import { createAsset, deleteAsset, updateAsset } from "@/actions/assets";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Search, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExportButton } from "@/components/ui/ExportButton";
import { Badge } from "@/components/ui/badge";

interface AssetManagementViewProps {
  initialAssets: Asset[];
}

export function AssetManagementView({ initialAssets }: AssetManagementViewProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    code: "", 
    name: "",
    status: "AVAILABLE" as Asset['status']
  });

  const filteredAssets = initialAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ code: "", name: "", status: "AVAILABLE" });
    setEditingId(null);
  };


  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      setFormData({
        code: asset.code,
        name: asset.name,
        status: asset.status
      });
      setEditingId(asset.id as number);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    if (editingId) {
      result = await updateAsset(editingId, formData);
    } else {
      result = await createAsset(formData);
    }

    if (result.success) {
      toast.success(editingId ? "Cập nhật thiết bị thành công" : "Đăng ký thiết bị mới thành công");
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message || "Lưu thông tin thiết bị thất bại");
    }
  };

  const handleDelete = async () => {
    if (assetToDelete === null) return;
    
    const result = await deleteAsset(assetToDelete);
    if (result.success) {
      toast.success("Đã xóa thiết bị thành công");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsDeleteConfirmOpen(false);
    setAssetToDelete(null);
  };

  const openDeleteConfirm = (id: number) => {
    setAssetToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Monitor className="w-8 h-8 text-blue-600" />
            Quản lý thiết bị
          </h1>
          <p className="text-muted-foreground mt-1">Đăng ký và quản lý các thiết bị y tế và tài sản của bệnh viện.</p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton url="http://localhost:8080/api/finance/assets/export" filename="asset_report.xlsx" label="Xuất báo cáo tài chính" />
          <ExportButton url="http://localhost:8080/api/assets/export-depreciation" filename="asset_depreciation.xlsx" label="Xuất báo cáo khấu hao" />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger
              render={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Đăng ký thiết bị mới
                </Button>
              }
            />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}</DialogTitle>
                <DialogDescription>
                  Nhập các thông tin chi tiết kỹ thuật cho thiết bị y tế.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã thiết bị</Label>
                  <Input 
                    id="code" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Ví dụ: MRI-001, VENT-102"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên thiết bị</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ví dụ: Máy chụp MRI, Máy thở"
                    required
                  />
                </div>
                {editingId && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái hiện tại</Label>
                    <select 
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'AVAILABLE' | 'BROKEN' | 'UNDER_MAINTENANCE'})}
                    >
                      <option value="AVAILABLE">Sẵn sàng sử dụng (Hoạt động tốt)</option>
                      <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
                      <option value="BROKEN">Hỏng hóc / Ngừng hoạt động</option>
                      <option value="MAINTENANCE_DUE">Đến hạn bảo trì (Theo lịch)</option>
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingId ? "Cập nhật" : "Lưu thiết bị"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm theo mã hoặc tên thiết bị..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Mã thiết bị</TableHead>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Bảo trì tiếp theo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                  Không tìm thấy thiết bị nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-semibold text-blue-700">{asset.code}</TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <span className="font-medium text-xs">
                      {asset.status === 'AVAILABLE' && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 border">Hoạt động tốt</Badge>}
                      {asset.status === 'UNDER_MAINTENANCE' && <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 border">Đang bảo trì</Badge>}
                      {asset.status === 'BROKEN' && <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 border">Hỏng hóc</Badge>}
                      {asset.status === 'MAINTENANCE_DUE' && <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 border">Đến hạn bảo trì</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>
                    {asset.nextMaintenanceDate ? (
                      <span className="text-sm text-muted-foreground">{formatDate(asset.nextMaintenanceDate)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Chưa đặt lịch</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(asset)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteConfirm(asset.id as number)}
                        className="hover:bg-rose-50 group"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xóa thiết bị"
        description="Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này cũng sẽ ảnh hưởng đến các phiếu yêu cầu sửa chữa liên quan."
        confirmText="Xóa thiết bị"
        variant="destructive"
      />
    </div>
  );
}
