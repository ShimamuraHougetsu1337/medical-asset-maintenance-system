"use client";

import { useState } from "react";
import { createStaff, deleteStaff, updateStaff } from "@/actions/management";
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
import { Plus, Trash2, Edit2, Search, Users, Eye, EyeOff } from "lucide-react";

import { toast } from "sonner";
import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface StaffManagementViewProps {
  initialStaff: User[];
}

export function StaffManagementView({ initialStaff }: StaffManagementViewProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  
  const [formData, setFormData] = useState<{ username: string; password?: string; role: User['role'] }>({ 
    username: "", 
    password: "", 
    role: "DOCTOR"
  });


  const filteredStaff = initialStaff.filter(member =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ username: "", password: "", role: "DOCTOR" });
    setEditingId(null);
  };

  const handleOpenDialog = (member?: User) => {
    if (member) {
      setFormData({
        username: member.username,
        password: "", // Don't show password
        role: member.role
      });
      setEditingId(member.id as number);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    if (editingId) {
      // For updates, only send password if it's not empty
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      result = await updateStaff(editingId, updateData);
    } else {
      result = await createStaff(formData);
    }

    if (result.success) {
      toast.success(editingId ? "Staff updated" : "Staff member created");
      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message || "Failed to save staff member");
    }
  };

  const handleDelete = async () => {
    if (memberToDelete === null) return;
    
    const result = await deleteStaff(memberToDelete);
    if (result.success) {
      toast.success("Staff member removed");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsDeleteConfirmOpen(false);
    setMemberToDelete(null);
  };

  const openDeleteConfirm = (id: number) => {
    setMemberToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Personnel Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage hospital staff accounts and system access roles.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Staff" : "Add New Staff"}</DialogTitle>
                <DialogDescription>
                  Configure account credentials and system roles.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="e.g. john_doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {editingId ? "New Password (Leave blank to keep current)" : "Password"}
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      required={!editingId}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'DOCTOR' | 'NURSE' | 'ENGINEER' | 'MANAGER'})}

                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="ENGINEER">Engineer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editingId ? "Update Staff" : "Save Member"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by username or role..." 
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
              <TableHead>Username</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{member.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(member)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => member.id && openDeleteConfirm(member.id as number)}
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
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member? They will no longer be able to log in to the system."
        confirmText="Remove Member"
        variant="destructive"
      />
    </div>
  );
}
