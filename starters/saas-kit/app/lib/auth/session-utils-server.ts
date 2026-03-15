/**
 * Server-side session utility functions
 *
 * Helper functions to safely extract data from sessions fetched via NextAuth v5's auth() function
 * Used in API routes and server components
 */

import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import type { AuthProvider } from "./session-utils";

/**
 * Safely extract user ID from session
 *
 * @param session - Return type of NextAuth v5's auth() function (Session | null)
 * @returns User ID or null
 */
export function getSessionUserId(session: Session | null): string | null {
  if (!session?.user) return null;

  // Use type assertion to access extended type
  const user = session.user as { id?: string };
  return user.id || null;
}

/**
 * Return user ID when auth is required (returns error response if not authenticated)
 *
 * @param session - NextAuth session object
 * @returns User ID (returns error response if not authenticated)
 * @throws NextResponse (401 Unauthorized) - if not authenticated
 */
export function requireAuth(session: Session | null): string {
  const userId = getSessionUserId(session);

  if (!userId) {
    throw NextResponse.json(
      { error: "Unauthorized", message: "Authentication required." },
      { status: 401 },
    );
  }

  return userId;
}

/**
 * Get auth provider from session (server-side)
 *
 * @param session - NextAuth session object
 * @returns Auth provider or undefined
 */
export function getSessionProvider(
  session: Session | null,
): AuthProvider | undefined {
  if (!session?.user) return undefined;

  // Use type assertion to access extended type
  const user = session.user as { provider?: string | AuthProvider };
  const provider = user.provider;

  // Return only valid provider via type guard
  if (
    provider === "kakao" ||
    provider === "google" ||
    provider === "credentials"
  ) {
    return provider;
  }

  return undefined;
}

/**
 * Check if logged in via social provider (server-side)
 *
 * @param session - NextAuth session object
 * @returns Whether it's a social login
 */
export function isSocialLogin(session: Session | null): boolean {
  const provider = getSessionProvider(session);
  return provider !== undefined && provider !== "credentials";
}

/**
 * Safely extract user info from session
 *
 * @param session - NextAuth session object
 * @returns User info object or null
 */
export function getSessionUser(session: Session | null): {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  provider?: AuthProvider;
} | null {
  if (!session?.user) return null;

  const user = session.user as {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    provider?: string | AuthProvider;
  };

  if (!user.id) return null;

  const provider = getSessionProvider(session);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    provider,
  };
}
