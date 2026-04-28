"use server";

import { cookies } from "next/headers";
import { ApiResponse, ServiceRequest, InventoryItem } from "@/types";
import { revalidatePath } from "next/cache";

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const token = cookies().get("token")?.value;

  try {
    const response = await fetch("http://localhost:8080/api/service-requests", {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) throw new Error("Failed to fetch service requests");
    
    const result: ApiResponse<ServiceRequest[]> = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Could not fetch service requests from backend, using fallback mock data", error);
    // Mock data if backend endpoint doesn't exist yet
    return [];
  }
}

export async function completeRepair(requestId: string, resolutionDetails: string, usedParts: { partId: number, quantity: number }[]) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const response = await fetch(`http://localhost:8080/api/service-requests/${requestId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ resolutionDetails, usedParts }),
    });

    const result: ApiResponse<any> = await response.json();

    if (response.ok) {
      revalidatePath("/repairs");
      revalidatePath("/assets");
      return { success: true };
    }

    return { success: false, message: result.message || "Failed to complete repair" };
  } catch (error) {
    console.error("Complete repair error:", error);
    return { success: false, message: "Server connection failed" };
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  const token = cookies().get("token")?.value;

  try {
    const response = await fetch("http://localhost:8080/api/inventory", {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) throw new Error("Failed to fetch inventory");
    
    const result: ApiResponse<InventoryItem[]> = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Could not fetch inventory from backend, using fallback mock data", error);
    return [];

  }
}
