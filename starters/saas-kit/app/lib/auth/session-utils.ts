/**
 * Session utility functions
 *
 * Helper functions to safely extract data from NextAuth sessions in a type-safe way
 */

/**
 * Supported auth provider types
 */
export type AuthProvider =
  | "kakao"
  | "google"
  | "line"
  | "discord"
  | "credentials";

/**
 * Session type (compatible with useSession return type)
 * Flexibly handles the type returned by useSession in NextAuth v5 beta.30
 */
type SessionLike =
  | {
      user?: {
        provider?: string | AuthProvider;
        id?: string;
        [key: string]: unknown;
      } | null;
    }
  | null
  | undefined;

/**
 * Get auth provider from session
 *
 * @param session - NextAuth session object (useSession return type)
 * @returns Auth provider or undefined
 */
export function getSessionProvider(
  session: SessionLike | unknown,
): AuthProvider | undefined {
  if (!session || typeof session !== "object") return undefined;

  const sessionObj = session as {
    user?: { provider?: string | AuthProvider; [key: string]: unknown } | null;
  };
  if (!sessionObj.user) return undefined;

  const user = sessionObj.user;
  if (!user || typeof user !== "object") return undefined;

  const provider = "provider" in user ? user.provider : undefined;

  // Return only valid provider via type guard
  if (
    provider === "kakao" ||
    provider === "google" ||
    provider === "line" ||
    provider === "discord" ||
    provider === "credentials"
  ) {
    return provider;
  }

  return undefined;
}

/**
 * Check if logged in via social provider
 *
 * @param session - NextAuth session object (useSession return type)
 * @returns Whether it's a social login
 */
export function isSocialLogin(session: SessionLike | unknown): boolean {
  const provider = getSessionProvider(session);
  return provider !== undefined && provider !== "credentials";
}

/**
 * Get display name for social login provider
 *
 * @param provider - Auth provider
 * @returns Display name
 */
export function getProviderDisplayName(
  provider: AuthProvider | undefined,
): string {
  if (!provider) return "Email/Password";

  switch (provider) {
    case "kakao":
      return "Kakao";
    case "google":
      return "Google";
    case "line":
      return "LINE";
    case "discord":
      return "Discord";
    case "credentials":
      return "Email/Password";
    default:
      return provider;
  }
}

/**
 * Safely extract user ID from session (client-side)
 *
 * @param session - NextAuth session object (useSession return type)
 * @returns User ID or undefined
 */
export function getSessionUserId(
  session: SessionLike | unknown,
): string | undefined {
  if (!session || typeof session !== "object") return undefined;

  const sessionObj = session as {
    user?: { id?: string; [key: string]: unknown } | null;
  };
  if (!sessionObj.user) return undefined;

  const user = sessionObj.user;
  if (!user || typeof user !== "object") return undefined;

  return "id" in user && typeof user.id === "string" ? user.id : undefined;
}
