"use client";

import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/types";

type StockFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

interface InventoryListTableProps {
  items: InventoryItem[];
}

export function InventoryListTable({ items }: InventoryListTableProps) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const handleThresholdUpdate = () => {
      const saved = localStorage.getItem("system_low_stock_threshold");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) {
          setThreshold(val);
        }
      }
    };
    handleThresholdUpdate();
    window.addEventListener("system-low-stock-threshold-updated", handleThresholdUpdate);
    window.addEventListener("storage", handleThresholdUpdate);
    return () => {
      window.removeEventListener("system-low-stock-threshold-updated", handleThresholdUpdate);
      window.removeEventListener("storage", handleThresholdUpdate);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = item.partName.toLowerCase().includes(normalizedQuery);
      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && item.quantity > threshold) ||
        (stockFilter === "LOW_STOCK" && item.quantity > 0 && item.quantity <= threshold) ||
        (stockFilter === "OUT_OF_STOCK" && item.quantity === 0);

      return matchesQuery && matchesStock;
    });
  }, [items, query, stockFilter, threshold]);

  const getStockLabel = (quantity: number) => {
    if (quantity === 0) return "Hết hàng";
    if (quantity <= threshold) return "Sắp hết";
    return "Còn hàng";
  };

  const getStockVariant = (quantity: number): "default" | "secondary" | "destructive" | "outline" => {
    if (quantity === 0) return "destructive";
    if (quantity <= threshold) return "outline";
    return "secondary";
  };

  const filterOptions: { label: string; value: StockFilter }[] = [
    { label: "Tất cả", value: "ALL" },
    { label: "Còn hàng", value: "IN_STOCK" },
    { label: "Sắp hết", value: "LOW_STOCK" },
    { label: "Hết hàng", value: "OUT_OF_STOCK" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm linh kiện..."
            className="pl-8"
          />
        </div>

        <div className="inline-flex w-fit rounded-lg border bg-background p-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStockFilter(option.value)}
              className={cn(
                "h-7 rounded-md px-3",
                stockFilter === option.value && "bg-muted text-foreground"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên linh kiện</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                Không tìm thấy linh kiện nào phù hợp với bộ lọc.
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.partName}</TableCell>
                <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                <TableCell>
                  <Badge variant={getStockVariant(item.quantity)}>
                    {getStockLabel(item.quantity)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
