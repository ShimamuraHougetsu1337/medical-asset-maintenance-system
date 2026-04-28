"use server";

import { cookies } from "next/headers";
import { Asset, ApiResponse } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Server Action to report an asset failure.
 */
export async function reportAssetFailure(assetId: string, description: string) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const response = await fetch(`http://localhost:8080/api/assets/${assetId}/report-failure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ description }),
    });

    const result: ApiResponse<any> = await response.json();

    if (response.ok) {
      revalidatePath("/assets");
      return { success: true };
    }

    return { success: false, message: result.message || "Failed to report failure" };
  } catch (error) {
    console.error("Report failure error:", error);
    return { success: false, message: "Server connection failed" };
  }
}

/**
 * Server Action to fetch all assets.
 */
export async function getAssets(): Promise<Asset[]> {
  const token = cookies().get("token")?.value;

  try {
    const response = await fetch("http://localhost:8080/api/assets", {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) throw new Error("Failed to fetch assets");
    
    const result: ApiResponse<Asset[]> = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Could not fetch assets from backend, using fallback mock data", error);
    return [];


  }
}
