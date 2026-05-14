"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Bell, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function SettingsView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System", icon: SettingsIcon, adminOnly: true },
  ];

  const isAdmin = (session?.user as unknown as { role: string })?.role === "ADMIN";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and system preferences.
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
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={session?.user?.name || ""} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Account Role</Label>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 w-fit">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">{(session?.user as unknown as { role: string })?.role}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={() => toast.success("Profile updated")}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password and secure your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" />
                </div>
                <div className="pt-4">
                  <Button variant="destructive" onClick={() => toast.success("Password changed successfully")}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you want to be alerted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Asset Failure Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive notifications when a new repair request is created.</p>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Low Stock Warnings</p>
                    <p className="text-xs text-muted-foreground">Get alerted when inventory parts fall below safety thresholds.</p>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "system" && isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Administrative settings for the entire hospital system.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="h-name">Hospital Name</Label>
                  <Input id="h-name" defaultValue="Central Medical Center" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Global Low Stock Threshold</Label>
                  <Input id="threshold" type="number" defaultValue="5" />
                </div>
                <div className="pt-4">
                  <Button onClick={() => toast.success("System configuration saved")}>Save Global Settings</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
