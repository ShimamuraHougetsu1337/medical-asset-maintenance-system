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
      toast.success(editingId ? "Asset updated" : "Asset registered");
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message || "Failed to save asset");
    }
  };

  const handleDelete = async () => {
    if (assetToDelete === null) return;
    
    const result = await deleteAsset(assetToDelete);
    if (result.success) {
      toast.success("Asset deleted");
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
            Asset Management
          </h1>
          <p className="text-muted-foreground mt-1">Register and manage hospital medical equipment and assets.</p>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton url="http://localhost:8080/api/finance/assets/export" filename="asset_report.xlsx" label="Export Financials" />
          <ExportButton url="http://localhost:8080/api/assets/export-depreciation" filename="asset_depreciation.xlsx" label="Export Depreciation" />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger
              render={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register New Asset
                </Button>
              }
            />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Asset" : "Add New Asset"}</DialogTitle>
                <DialogDescription>
                  Enter the technical details for the medical equipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Asset Code</Label>
                  <Input 
                    id="code" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. MRI-001, VENT-102"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. MRI Scanner, Ventilator"
                    required
                  />
                </div>
                {editingId && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Current Status</Label>
                    <select 
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'AVAILABLE' | 'BROKEN' | 'UNDER_MAINTENANCE'})}
                    >
                      <option value="AVAILABLE">Available (Operational)</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      <option value="BROKEN">Broken / Out of Order</option>
                      <option value="MAINTENANCE_DUE">Maintenance Due (Scheduled)</option>
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingId ? "Update Asset" : "Save Asset"}
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
              placeholder="Search by code or name..." 
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
              <TableHead>Code</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-semibold text-blue-700">{asset.code}</TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{asset.status.toLowerCase().replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    {asset.nextMaintenanceDate ? (
                      <span className="text-sm text-muted-foreground">{formatDate(asset.nextMaintenanceDate)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not set</span>
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
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This will also affect any pending service requests."
        confirmText="Delete Asset"
        variant="destructive"
      />
    </div>
  );
}
