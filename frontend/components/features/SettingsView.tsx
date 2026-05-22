"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Bell, Settings as SettingsIcon, ShieldCheck, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth";

type SafeUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  accessToken?: string;
};

export function SettingsView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Preference / System States
  const [alertAssetFailure, setAlertAssetFailure] = useState(true);
  const [warnLowStock, setWarnLowStock] = useState(true);
  const [hospitalName, setHospitalName] = useState("Hospital Asset Management");
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAlertAssetFailure = localStorage.getItem("alert_asset_failure");
      if (savedAlertAssetFailure !== null) {
        setAlertAssetFailure(savedAlertAssetFailure !== "false");
      }

      const savedWarnLowStock = localStorage.getItem("warn_low_stock");
      if (savedWarnLowStock !== null) {
        setWarnLowStock(savedWarnLowStock !== "false");
      }

      const savedHospitalName = localStorage.getItem("system_hospital_name");
      if (savedHospitalName !== null) {
        setHospitalName(savedHospitalName);
      }

      const savedLowStockThreshold = localStorage.getItem("system_low_stock_threshold");
      if (savedLowStockThreshold !== null) {
        const val = parseInt(savedLowStockThreshold, 10);
        if (!isNaN(val)) {
          setLowStockThreshold(val);
        }
      }
    }
  }, []);

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "security", label: "Bảo mật", icon: Lock },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "system", label: "Hệ thống", icon: SettingsIcon, adminOnly: true },
  ];

  const userObj = session?.user as SafeUser | undefined;
  const isAdmin = userObj?.role === "ADMIN";

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ các thông tin mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có độ dài ít nhất 6 ký tự");
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast.success(response.message || "Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi kết nối máy chủ: " + (err as Error).message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleToggleAlertAssetFailure = () => {
    const nextVal = !alertAssetFailure;
    setAlertAssetFailure(nextVal);
    localStorage.setItem("alert_asset_failure", nextVal ? "true" : "false");
    toast.success(nextVal ? "Đã bật thông báo sự cố thiết bị" : "Đã tắt thông báo sự cố thiết bị");
  };

  const handleToggleWarnLowStock = () => {
    const nextVal = !warnLowStock;
    setWarnLowStock(nextVal);
    localStorage.setItem("warn_low_stock", nextVal ? "true" : "false");
    toast.success(nextVal ? "Đã bật cảnh báo linh kiện sắp hết" : "Đã tắt cảnh báo linh kiện sắp hết");
  };

  const handleSaveGlobalSettings = () => {
    if (!hospitalName.trim()) {
      toast.error("Tên bệnh viện không được để trống");
      return;
    }
    if (lowStockThreshold < 0) {
      toast.error("Ngưỡng cảnh báo phải lớn hơn hoặc bằng 0");
      return;
    }

    localStorage.setItem("system_hospital_name", hospitalName.trim());
    localStorage.setItem("system_low_stock_threshold", lowStockThreshold.toString());

    // Dispatch events to notify other components instantly
    window.dispatchEvent(new Event("system-hospital-name-updated"));
    window.dispatchEvent(new Event("system-low-stock-threshold-updated"));

    toast.success("Cấu hình hệ thống đã được cập nhật thành công!");
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    DOCTOR: "Bác sĩ",
    ENGINEER: "Kỹ sư"
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cấu hình tài khoản cá nhân và tùy chọn hệ thống của bạn.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1">
          {tabs.map((tab) => {
            if (tab.adminOnly && !isAdmin) return null;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Quản lý thông tin tài khoản của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input id="username" value={userObj?.name || ""} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò tài khoản</Label>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 w-fit">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">
                      {userObj?.role ? (roleLabels[userObj.role] || userObj.role) : ""}
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button disabled variant="outline">Thông tin tài khoản được quản lý bởi Quản trị viên</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
                <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current">Mật khẩu hiện tại</Label>
                  <Input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new">Mật khẩu mới</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleUpdatePassword}
                    disabled={loadingPassword}
                  >
                    {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình thông báo</CardTitle>
                <CardDescription>Cấu hình các sự kiện bạn muốn nhận thông báo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Thông báo sự cố thiết bị</p>
                    <p className="text-xs text-muted-foreground">Nhận thông báo khi có yêu cầu sửa chữa thiết bị mới được tạo.</p>
                  </div>
                  <div
                    onClick={handleToggleAlertAssetFailure}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${alertAssetFailure ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${alertAssetFailure ? "right-0.5" : "left-0.5"}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Cảnh báo linh kiện sắp hết</p>
                    <p className="text-xs text-muted-foreground">Nhận cảnh báo khi số lượng linh kiện trong kho giảm xuống dưới ngưỡng an toàn.</p>
                  </div>
                  <div
                    onClick={handleToggleWarnLowStock}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${warnLowStock ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${warnLowStock ? "right-0.5" : "left-0.5"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "system" && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình hệ thống</CardTitle>
                <CardDescription>Thiết lập cấu hình quản trị cho toàn bộ hệ thống bệnh viện.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="h-name">Tên bệnh viện / Cơ sở y tế</Label>
                  <Input
                    id="h-name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Ngưỡng cảnh báo hết linh kiện chung</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => {
                       const val = parseInt(e.target.value, 10);
                       setLowStockThreshold(isNaN(val) ? 0 : val);
                    }}
                  />
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveGlobalSettings}>Lưu cấu hình hệ thống</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
