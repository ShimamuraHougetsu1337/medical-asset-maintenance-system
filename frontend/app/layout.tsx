import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedAsset | Medical Asset Management",
  description: "Advanced Medical Asset & Maintenance Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user")?.value;

  let user = null;

  // Priority 1: NextAuth Session
  if (session?.user) {
    user = {
      username: session.user.name || session.user.email,
      role: (session.user as { role: string }).role,
    };
  }
  // Priority 2: Legacy Cookies
  else if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      console.error("Failed to parse user cookie");
    }
  }

  // If there's no token (NextAuth or Cookie), we assume unauthorized state
  const showShell = !!session || !!token;

  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 min-h-screen")}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
