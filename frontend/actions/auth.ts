"use server";

import { cookies } from "next/headers";
import { AuthResponse, ApiResponse } from "@/types";

const API_URL = process.env.API_URL || "http://localhost:8080/api";

export async function login(formData: unknown) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const body = await response.text();
      return {
        success: false,
        message: `Backend returned ${response.status}: ${body.slice(0, 120)}`,
      };
    }

    const result: ApiResponse<AuthResponse> = await response.json();
    console.log("Login API result:", result);

    if (response.ok && result.data && result.data.token) {
      const cookieOpts = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
      };

      // Access token – httpOnly, 15 minutes
      cookies().set("token", result.data.token, {
        ...cookieOpts,
        httpOnly: true,
        maxAge: 60 * 15,
      });

      // Refresh token – httpOnly, 7 days
      cookies().set("refreshToken", result.data.refreshToken, {
        ...cookieOpts,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });

      // User info (non-sensitive) – readable by client
      cookies().set(
        "user",
        JSON.stringify({
          username: result.data.username,
          role: result.data.role,
        }),
        {
          ...cookieOpts,
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      return { success: true };
    }

    return {
      success: false,
      message: result.message || `Login failed with status ${response.status}`,
    };
  } catch (error) {
    console.error("Login server action error:", error);
    return {
      success: false,
      message: "Server connection failed: " + (error as Error).message,
    };
  }
}

export async function logout() {
  // Best-effort: call backend to revoke refresh token
  try {
    const token = cookies().get("token")?.value;
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // Non-fatal: proceed with local cookie cleanup regardless
  }

  cookies().delete("token");
  cookies().delete("refreshToken");
  cookies().delete("user");
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Returns the new access token on success, or null on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = cookies().get("refreshToken")?.value;
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const result = await response.json();
    const data = result.data as { accessToken: string; refreshToken: string };

    if (!data?.accessToken) return null;

    // Rotate cookies
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    cookies().set("token", data.accessToken, {
      ...cookieOpts,
      maxAge: 60 * 15,
    });

    cookies().set("refreshToken", data.refreshToken, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 7,
    });

    return data.accessToken;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function changePassword(formData: unknown) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return { success: false, message: "Unauthorized: No session token found" };
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const body = await response.text();
      return {
        success: false,
        message: `Backend returned ${response.status}: ${body.slice(0, 120)}`,
      };
    }

    const result: ApiResponse<string> = await response.json();
    if (response.ok) {
      return { success: true, message: result.message || "Password changed successfully" };
    }

    return {
      success: false,
      message:
        result.message || `Password change failed with status ${response.status}`,
    };
  } catch (error) {
    console.error("Change password server action error:", error);
    return {
      success: false,
      message: "Server connection failed: " + (error as Error).message,
    };
  }
}
