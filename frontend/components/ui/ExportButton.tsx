"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ExportButtonProps {
  url: string;
  filename: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function ExportButton({ 
  url, 
  filename, 
  label = "Export to Excel",
  className,
  size,
  variant = "outline"
}: ExportButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = (session?.user as unknown as { accessToken?: string })?.accessToken;
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success("Export successful!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export report");
    } finally {
      setLoading(false);
      window.focus();
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={loading} 
      variant={variant} 
      size={size}
      className={`gap-2 ${className || ""}`}
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : label}
    </Button>
  );
}
