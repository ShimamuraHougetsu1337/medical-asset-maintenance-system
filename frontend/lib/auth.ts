import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL || "http://localhost:8080/api";

/** Access token lifetime in seconds – must match backend expiration-ms (900 000 ms = 900 s). */
const ACCESS_TOKEN_LIFETIME_S = 900;

/**
 * Attempts to obtain a new access token + refresh token from the backend
 * using the stored refresh token (rotation pattern).
 */
async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
} | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    const data = result.data as { accessToken: string; refreshToken: string };
    if (!data?.accessToken) return null;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_S * 1000,
    };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const result = await res.json();

          if (res.ok && result.data?.token) {
            // Return user object — NextAuth stores this in the JWT
            return {
              id: result.data.username,
              name: result.data.username,
              email: result.data.username,
              role: result.data.role,
              accessToken: result.data.token,
              refreshToken: result.data.refreshToken,
              accessTokenExpires:
                Date.now() + ACCESS_TOKEN_LIFETIME_S * 1000,
            };
          }
          return null;
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: populate token from the user object
      if (user) {
        const u = user as unknown as {
          role: string;
          accessToken: string;
          refreshToken: string;
          accessTokenExpires: number;
        };
        token.role = u.role;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = u.accessTokenExpires;
        return token;
      }

      // Subsequent calls: check if access token has expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        // Still valid — return as-is
        return token;
      }

      // Access token expired — try to refresh
      console.log("[NextAuth] Access token expired, attempting refresh...");
      const refreshed = await refreshTokens(token.refreshToken as string);

      if (refreshed) {
        console.log("[NextAuth] Token refreshed successfully.");
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: refreshed.accessTokenExpires,
          error: undefined,
        };
      }

      // Refresh failed — mark session as errored (forces sign-out on client)
      console.error("[NextAuth] Refresh token invalid or expired.");
      return { ...token, error: "RefreshAccessTokenError" };
    },

    async session({ session, token }) {
      if (session.user) {
        const s = session.user as unknown as {
          role: string;
          accessToken: string;
        };
        s.role = token.role as string;
        s.accessToken = token.accessToken as string;
      }
      // Expose error to client so it can force a sign-out
      (session as unknown as Record<string, unknown>).error = token.error;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Session max-age matches refresh token lifetime (7 days)
    maxAge: 60 * 60 * 24 * 7,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
