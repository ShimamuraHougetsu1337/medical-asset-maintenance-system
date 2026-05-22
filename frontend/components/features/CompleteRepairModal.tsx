"use client";

import { useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { completeRepair } from "@/actions/repairs";
import { InventoryItem, ServiceRequest } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

const repairSchema = z.object({
  resolutionDetails: z.string().min(1, "Vui lòng nhập chi tiết kết quả xử lý sự cố."),
  usedParts: z.array(
    z.object({
      partId: z.coerce.number().min(1, "Vui lòng chọn linh kiện"),
      quantity: z.coerce.number().min(1, "Số lượng phải ít nhất là 1"),
    })
  ).default([]),
  laborCost: z.coerce.number().min(0, "Chi phí nhân công không được là số âm").optional(),
});

type UsedPart = {
  partId: number;
  quantity: number;
};

type RepairFormValues = {
  resolutionDetails: string;
  usedParts: UsedPart[];
  laborCost?: number;
};

interface CompleteRepairModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
}

export function CompleteRepairModal({ request, isOpen, onClose, inventory }: CompleteRepairModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RepairFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(repairSchema) as any,
    defaultValues: {
      resolutionDetails: "",
      usedParts: [],
      laborCost: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "usedParts",
  });

  const onSubmit: SubmitHandler<RepairFormValues> = async (data) => {
    if (!request) return;
    setIsSubmitting(true);

    try {
      const result = await completeRepair(
        request.id,
        data.resolutionDetails,
        data.usedParts,
        data.laborCost
      );

      if (result.success) {
        toast.success("Báo cáo hoàn thành sửa chữa thành công!");
        reset();
        onClose();
      } else {
        toast.error(result.message || "Không thể hoàn thành sửa chữa.");
      }
    } catch (error) {
      console.error(error); // Log lỗi để debug
      toast.error("Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Hoàn tất sửa chữa: {request?.assetName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resolutionDetails">Mô tả phương án xử lý</Label>
            <Textarea
              id="resolutionDetails"
              placeholder="Nhập chi tiết về cách khắc phục sự cố, bộ phận sửa chữa..."
              {...register("resolutionDetails")}
              className="h-24"
            />
            {errors.resolutionDetails && (
              <p className="text-sm text-red-500">{errors.resolutionDetails.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="laborCost">Chi phí nhân công ($)</Label>
            <Input
              id="laborCost"
              type="number"
              min="0"
              step="1000"
              {...register("laborCost")}
            />
            {errors.laborCost && (
              <p className="text-sm text-red-500">{errors.laborCost.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Linh kiện đã sử dụng (Tùy chọn)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ partId: 0, quantity: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm linh kiện
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <select
                    {...register(`usedParts.${index}.partId` as const)}
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="0" disabled>Chọn linh kiện</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.partName} (Còn: {item.quantity})
                      </option>
                    ))}
                  </select>
                  {/* Truy cập lỗi an toàn hơn cho Array */}
                  {errors.usedParts?.[index]?.partId && (
                    <p className="text-xs text-red-500">
                      {errors.usedParts[index]?.partId?.message}
                    </p>
                  )}
                </div>

                <div className="w-24 space-y-1">
                  <Input
                    type="number"
                    min="1"
                    {...register(`usedParts.${index}.quantity` as const)}
                  />
                  {errors.usedParts?.[index]?.quantity && (
                    <p className="text-xs text-red-500">
                      {errors.usedParts[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Hoàn tất sửa chữa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
