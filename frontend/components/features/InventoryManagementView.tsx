"use client";

import { useState } from "react";
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/actions/management";
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
import { Plus, Trash2, Box, Edit2, Search } from "lucide-react";
import { toast } from "sonner";
import { InventoryItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportButton } from "@/components/ui/ExportButton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface InventoryManagementViewProps {
  initialInventory: InventoryItem[];
}

export function InventoryManagementView({ initialInventory }: InventoryManagementViewProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);


  const [formData, setFormData] = useState({
    partName: "",
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0
  });

  const filteredInventory = initialInventory.filter(item =>
    item.partName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ partName: "", quantity: 0, minQuantity: 5, unitPrice: 0 });
    setEditingId(null);
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setFormData({
        partName: item.partName,
        quantity: item.quantity,
        minQuantity: item.minQuantity || 5,
        unitPrice: item.unitPrice || 0
      });
      setEditingId(item.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const existingItem = initialInventory.find(
      i => i.partName.toLowerCase().trim() === formData.partName.toLowerCase().trim() && i.id !== editingId
    );

    let result;

    if (existingItem && !editingId) {
      // Automatic Merge: Add quantity to existing item without prompt as requested
      result = await updateInventoryItem(existingItem.id, {
        quantity: existingItem.quantity + formData.quantity,
        unitPrice: formData.unitPrice // Update to latest price
      });
    } else if (editingId) {
      // Regular Update
      result = await updateInventoryItem(editingId, formData);
    } else {
      // Regular Create
      result = await createInventoryItem(formData);
    }

    if (result.success) {
      const message = existingItem && !editingId 
        ? `Đã thêm ${formData.quantity} đơn vị vào linh kiện sẵn có: ${existingItem.partName}`
        : (editingId ? "Cập nhật linh kiện thành công" : "Đã đăng ký linh kiện mới");
        
      toast.success(message);
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message || "Lưu thông tin linh kiện thất bại");
    }
  };

  const isDuplicate = !editingId && formData.partName.trim() !== "" && initialInventory.some(
    i => i.partName.toLowerCase().trim() === formData.partName.toLowerCase().trim()
  );

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    
    const result = await deleteInventoryItem(itemToDelete);
    if (result.success) {
      toast.success("Đã xóa linh kiện thành công");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Box className="w-8 h-8 text-amber-600" />
            Kho & Linh kiện thay thế
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý mức độ tồn kho và đơn giá cho các linh kiện thiết bị y tế.</p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton url="http://localhost:8080/api/inventory/export" filename="inventory_report.xlsx" label="Xuất báo cáo kho" />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger
              render={
                <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Đăng ký linh kiện mới
                </Button>
              }
            />

          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Chỉnh sửa linh kiện" : "Thêm linh kiện mới"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Cập nhật thông tin chi tiết cho linh kiện này."
                    : "Nhập chi tiết linh kiện mới. Nếu tên trùng khớp với linh kiện đã có, hệ thống sẽ tự động gộp số lượng tồn kho."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="partName">Tên linh kiện</Label>
                  <Input
                    id="partName"
                    value={formData.partName}
                    onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                    placeholder="Ví dụ: Cảm biến MRI, Gói pin..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Số lượng tồn kho</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minQuantity">Ngưỡng tối thiểu</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="0"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Đơn giá ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              {isDuplicate && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <Box className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <strong>Lưu ý:</strong> Linh kiện với tên này đã tồn tại. Việc lưu sẽ tự động **gộp** số lượng mới vào kho hiện tại.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className={isDuplicate ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700 text-white"}>
                  {editingId ? "Cập nhật" : (isDuplicate ? "Gộp kho" : "Lưu linh kiện")}
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
              placeholder="Tìm kiếm theo tên linh kiện..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Tên linh kiện</TableHead>
              <TableHead>Số lượng khả dụng</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                  Không tìm thấy linh kiện nào trong kho.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{item.partName}</TableCell>
                  <TableCell>
                    <span className={item.minQuantity !== undefined && item.quantity <= item.minQuantity ? "text-red-600 font-bold animate-pulse" : ""}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell>${item.unitPrice?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    {item.minQuantity !== undefined && item.quantity <= item.minQuantity ? (
                      <Badge variant="destructive" className="animate-pulse bg-red-600">Sắp hết hàng</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Còn hàng</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteConfirm(item.id)}
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
        title="Xóa linh kiện khỏi kho"
        description="Bạn có chắc chắn muốn xóa linh kiện này khỏi kho không? Hành động này không thể hoàn tác."
        confirmText="Xóa linh kiện"
        variant="destructive"
      />
    </div>
  );
}

