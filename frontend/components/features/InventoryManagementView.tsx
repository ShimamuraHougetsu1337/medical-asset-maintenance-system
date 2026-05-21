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
        ? `Added ${formData.quantity} units to existing stock: ${existingItem.partName}`
        : (editingId ? "Item updated" : "New part registered");
        
      toast.success(message);
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message || "Failed to save item");
    }
  };

  const isDuplicate = !editingId && formData.partName.trim() !== "" && initialInventory.some(
    i => i.partName.toLowerCase().trim() === formData.partName.toLowerCase().trim()
  );

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    
    const result = await deleteInventoryItem(itemToDelete);
    if (result.success) {
      toast.success("Item deleted");
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
            Inventory & Spare Parts
          </h1>
          <p className="text-muted-foreground mt-1">Manage stock levels and unit prices for medical spare parts.</p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton url="http://localhost:8080/api/inventory/export" filename="inventory_report.xlsx" label="Export Inventory" />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger
              render={
                <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register New Part
                </Button>
              }
            />

          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Part" : "Add New Part"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the details for this inventory item."
                    : "Enter the details for the new spare part. If the name matches an existing item, stock will be merged."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="partName">Part Name</Label>
                  <Input
                    id="partName"
                    value={formData.partName}
                    onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                    placeholder="e.g. MRI Sensor, Battery Pack..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Stock Quantity</Label>
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
                    <Label htmlFor="minQuantity">Minimum Level</Label>
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
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
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
                    <strong>Note:</strong> A part with this name already exists. Saving will **merge** this quantity into the existing stock.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className={isDuplicate ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700"}>
                  {editingId ? "Update Item" : (isDuplicate ? "Merge Stock" : "Save Part")}
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
              placeholder="Search by part name..."
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
              <TableHead className="w-[300px]">Part Name</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                  No parts found in inventory.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{item.partName}</TableCell>
                  <TableCell>
                    <span className={item.minQuantity !== undefined && item.quantity <= item.minQuantity ? "text-red-600 font-bold" : ""}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell>${item.unitPrice?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    {item.minQuantity !== undefined && item.quantity <= item.minQuantity ? (
                      <Badge variant="destructive" className="animate-pulse">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">In Stock</Badge>
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
        title="Delete Inventory Item"
        description="Are you sure you want to delete this part from inventory? This action cannot be undone."
        confirmText="Delete Part"
        variant="destructive"
      />
    </div>
  );
}

