import { getServiceRequests, getInventory } from "@/actions/repairs";
import { RepairsView } from "@/components/features/RepairsView";

export default async function RepairsPage() {
  const [requests, inventory] = await Promise.all([
    getServiceRequests(),
    getInventory()
  ]);

  return <RepairsView initialRequests={requests} inventory={inventory} />;
}
