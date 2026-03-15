/**
 * NextAuth type extensions
 *
 * Extends Session, User, JWT types for type safety.
 * Use `session.user.id` instead of `(session.user as any).id`.
 *
 * Official NextAuth v5 type extension:
 * https://authjs.dev/getting-started/typescript
 */

import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

/**
 * Supported auth provider types
 */
export type AuthProvider =
  | "kakao"
  | "google"
  | "line"
  | "discord"
  | "credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: AuthProvider;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id?: string;
    provider?: AuthProvider;
  }

  interface Account {
    provider: string;
    type: string;
    providerAccountId: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: AuthProvider;
    providerAccountId?: string;
    accessToken?: string;
    role?: string;
    user?: {
      id: string;
      provider?: AuthProvider;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
