"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, ServiceRequest } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AssignEngineerModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  engineers: User[];
  onAssignSuccess: () => void;
  onAssignAction: (requestId: string, engineerId: string) => Promise<{ success: boolean; message?: string }>;
}

export function AssignEngineerModal({
  request,
  isOpen,
  onClose,
  engineers,
  onAssignSuccess,
  onAssignAction,
}: AssignEngineerModalProps) {
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedEngineerId("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    if (!selectedEngineerId) {
      toast.error("Vui lòng chọn kỹ sư để phân công.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAssignAction(request.id as string, selectedEngineerId);
      if (result.success) {
        const selectedEng = engineers.find(eng => String(eng.id) === selectedEngineerId);
        toast.success(`Đã phân công việc cho kỹ sư ${selectedEng?.username || selectedEngineerId}`);
        onAssignSuccess();
        onClose();
      } else {
        toast.error(result.message || "Không thể phân công kỹ sư.");
      }
    } catch (error) {
      console.error("Lỗi phân công kỹ sư:", error);
      toast.error("Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Phân công kỹ sư sửa chữa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Thiết bị cần sửa chữa:</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md font-semibold">
              {request?.asset?.name ?? request?.assetName ?? "Không rõ"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Mô tả sự cố:</p>
            <p className="text-sm text-muted-foreground max-h-24 overflow-y-auto bg-muted p-2 rounded-md italic">
              {request?.description || "Không có mô tả"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineerSelect">Chọn Kỹ sư đảm nhận</Label>
            <select
              id="engineerSelect"
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
              className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Chọn kỹ sư từ danh sách --</option>
              {engineers.map((engineer) => (
                <option key={engineer.id} value={String(engineer.id)}>
                  {engineer.username}
                </option>
              ))}
            </select>
            {engineers.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Không tìm thấy kỹ sư nào trong hệ thống.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || engineers.length === 0}>
              {isSubmitting ? "Đang phân công..." : "Xác nhận phân công"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
