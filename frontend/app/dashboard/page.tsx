import { getDashboardStats } from "@/actions/dashboard";
import { getServiceRequests } from "@/actions/repairs";
import { DashboardStatsDisplay } from "@/components/features/DashboardStatsDisplay";

/**
 * Trang Dashboard dành cho Manager (Giai đoạn 5).
 * Server Component: fetch data trực tiếp, không dùng useEffect.
 */
export default async function ManagerDashboardPage() {
  // Fetch song song để tối ưu thời gian tải
  const [stats, requests] = await Promise.all([
    getDashboardStats(),
    getServiceRequests(),
  ]);

  return <DashboardStatsDisplay stats={stats} requests={requests} />;
}
