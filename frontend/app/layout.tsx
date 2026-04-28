import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedAsset | Medical Asset Management",
  description: "Advanced Medical Asset & Maintenance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user")?.value;
  
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      console.error("Failed to parse user cookie");
    }
  }

  // If there's no token, we assume it's the login page or an unauthorized state
  // and we don't render the sidebar/header shell.
  const showShell = !!token;

  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 min-h-screen")}>
        {showShell ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar userRole={user?.role} />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header userName={user?.username} userRole={user?.role} />
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <main>{children}</main>
        )}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
