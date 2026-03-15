/**
 * NextAuth v5 configuration file
 *
 * Auth configuration migrated to NextAuth v5 (Auth.js) structure
 * Converted existing auth.ts to v5 structure
 */

import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, getPrismaForAdapter } from "../infra/prisma";

// Copy NEXTAUTH_SECRET to AUTH_SECRET (Auth.js v5 compatibility)
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}

import { hashUserData, decryptUserData } from "../security/encryption";
import {
  findOrCreateOAuthUser,
  EMAIL_LINK_ALLOWED_PROVIDERS,
} from "./oauth-user-service";
import type { AuthProvider } from "./session-utils";
import { getServerEnv } from "../env/env";
import {
  recordLoginEvent,
  extractRequestInfo,
  providerToAction,
} from "./login-logger";
import { logger } from "../infra/logger";

/**
 * Convert image URL to https (for Kakao and other http URLs)
 * CSP only allows https, so convert http URLs to https
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

/**
 * User info select fields used in JWT callback
 */
const USER_SELECT_FIELDS = {
  id: true,
  email_enc: true,
  nickname_enc: true,
  profile_image: true,
  image: true,
} as const;

/**
 * User info type (used in JWT callback)
 */
type UserForJWT = {
  id: string;
  email_enc: Buffer | Uint8Array | null;
  nickname_enc: Buffer | Uint8Array | null;
  profile_image: string | null;
  image: string | null;
};

/**
 * Helper function to decrypt user info and update token
 */
async function updateTokenFromUser(
  dbUser: UserForJWT,
  token: {
    id?: string;
    provider?: AuthProvider;
    accessToken?: string;
    providerAccountId?: string;
    user?: {
      id: string;
      provider?: AuthProvider;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  },
) {
  const emailBuffer = dbUser.email_enc
    ? Buffer.isBuffer(dbUser.email_enc)
      ? dbUser.email_enc
      : Buffer.from(dbUser.email_enc)
    : null;
  const nicknameBuffer = dbUser.nickname_enc
    ? Buffer.isBuffer(dbUser.nickname_enc)
      ? dbUser.nickname_enc
      : Buffer.from(dbUser.nickname_enc)
    : null;

  const decryptedEmail = emailBuffer
    ? await decryptUserData(emailBuffer)
    : null;
  const decryptedNickname = nicknameBuffer
    ? await decryptUserData(nicknameBuffer)
    : null;

  token.id = dbUser.id;
  token.user = {
    id: dbUser.id,
    provider: token.provider,
    name: decryptedNickname,
    email: decryptedEmail,
    image: normalizeImageUrl(dbUser.profile_image || dbUser.image),
  };
}

/**
 * Find user by Account
 */
async function findUserByAccount(
  provider: string,
  providerAccountId: string,
): Promise<UserForJWT | null> {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: {
      user: {
        select: USER_SELECT_FIELDS,
      },
    },
  });

  return existingAccount?.user || null;
}

/**
 * Find user by email hash
 */
async function findUserByEmail(email: string): Promise<UserForJWT | null> {
  const emailHash = hashUserData(email);
  return await prisma.user.findUnique({
    where: { email_hash: emailHash },
    select: USER_SELECT_FIELDS,
  });
}

/**
 * Get server environment variables (safely)
 */
const getServerEnvSafely = () => {
  try {
    return getServerEnv();
  } catch {
    return {
      NODE_ENV: (process.env.NODE_ENV || "development") as
        | "development"
        | "production"
        | "test",
      KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
      KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "",
      NEXTAUTH_URL:
        process.env.NEXTAUTH_URL ||
        process.env.AUTH_URL ||
        "http://localhost:3000",
    } as ReturnType<typeof getServerEnv>;
  }
};

const serverEnv = getServerEnvSafely();
const isProduction = serverEnv.NODE_ENV === "production";
// Check if HTTPS is used (production or Vercel environment)
const isSecure =
  isProduction ||
  process.env.VERCEL === "1" ||
  process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://");

// Add social login providers only when env vars are present
// NextAuth v5 providers can have multiple types, so handle with union types
// Note: Type assertion is required due to type definition limitations in NextAuth v5 beta.30.
// This is safer than any (using explicit union types).
type NextAuthProvider =
  | ReturnType<typeof Kakao>
  | ReturnType<typeof Google>
  | ReturnType<typeof Line>
  | ReturnType<typeof Discord>;
const providers: NextAuthProvider[] = [];

// Add Kakao login if configured
if (serverEnv.KAKAO_CLIENT_ID && serverEnv.KAKAO_CLIENT_SECRET) {
  providers.push(
    Kakao({
      clientId: serverEnv.KAKAO_CLIENT_ID,
      clientSecret: serverEnv.KAKAO_CLIENT_SECRET,
    }) as NextAuthProvider,
  );
}

// Add Google login if configured
if (serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }) as NextAuthProvider,
  );
}

// Add LINE login if configured
// Note: Email address permission must be requested in LINE Developer Console for email collection
if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
  providers.push(
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }) as NextAuthProvider,
  );
}

// Add Discord login if configured
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }) as NextAuthProvider,
  );
}

/**
 * NextAuth v5 configuration
 *
 * In v5, the NextAuth() function returns auth, handlers, signIn, signOut.
 */

const prismaAdapter = PrismaAdapter(getPrismaForAdapter() as any);

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: prismaAdapter,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Save account info on first login (provider, accessToken, etc.)
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider as AuthProvider;
        token.providerAccountId = account.providerAccountId;
      }

      // Look up user on social login or from existing token
      if (account && user) {
        let dbUser: UserForJWT | null = null;

        // Social login: find user by Account table (most accurate)
        if (account.providerAccountId && account.provider) {
          dbUser = await findUserByAccount(
            account.provider,
            account.providerAccountId,
          );
        }

        // Fall back to email-based search if not found by Account
        if (!dbUser && user.email) {
          dbUser = await findUserByEmail(user.email);
        }

        if (dbUser) {
          await updateTokenFromUser(dbUser, token);
        }
      }

      // Re-query by email if no user ID in existing token
      if (!token.id) {
        let dbUser: UserForJWT | null = null;

        if (token.email) {
          dbUser = await findUserByEmail(token.email as string);
        }

        if (dbUser) {
          await updateTokenFromUser(dbUser, token);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user info to session in a type-safe way
      if (token && session.user) {
        if (token.id) {
          session.user.id = token.id;
        }
        // Add provider and accessToken
        if (token.provider) {
          session.user.provider = token.provider;
        }
        if (token.accessToken) {
          session.accessToken = token.accessToken;
        }
        // Replace with full user info if token.user exists
        if (token.user) {
          session.user = {
            ...session.user,
            ...token.user,
          } as typeof session.user;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Save user info to database on social login
      // Provider-agnostic: supports all social logins (kakao, google, apple, etc.)
      if (account?.provider && account.provider !== "credentials") {
        try {
          if (!account.providerAccountId) {
            console.error(
              `[${account.provider}] providerAccountId is missing.`,
            );
            return false;
          }

          // Double gate: allowlist + provider's email_verified flag
          // 1) Provider must be in EMAIL_LINK_ALLOWED_PROVIDERS
          // 2) Provider raw profile's email_verified must be true
          // Both must pass to use email for account linking
          const email =
            EMAIL_LINK_ALLOWED_PROVIDERS.includes(account.provider) &&
            profile?.email_verified
              ? user.email
              : undefined;

          // Unified OAuth user find/create/link
          const result = await findOrCreateOAuthUser(
            {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email,
              name: user.name,
              image: user.image,
            },
            {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
              sessionState: account.session_state,
              accountType: account.type,
            },
          );

          if (result.blocked) {
            logger.warn("Blocked user attempted login", {
              userId: result.userId,
              provider: account.provider,
            });
            return false;
          }

          // Record social login/signup event (fire-and-forget)
          const loginAction = result.isNewUser
            ? "signup_social"
            : providerToAction(account.provider);
          extractRequestInfo().then((reqInfo) => {
            recordLoginEvent({
              userId: result.userId,
              action: loginAction,
              ip: reqInfo.ip,
              userAgent: reqInfo.userAgent,
              success: true,
            });
          });

          return true;
        } catch (error) {
          console.error(
            `[${account.provider}] Social login user creation error:`,
            error,
          );
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // 1. Combine with baseUrl if relative path
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        return fullUrl;
      }

      // 2. Allow absolute paths starting with baseUrl
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // 3. Prevent redirect to external URLs (security)
      // Use callbackUrl param if present, otherwise go home
      try {
        const urlObj = new URL(url, baseUrl);
        // Check if same origin
        if (urlObj.origin === new URL(baseUrl).origin) {
          return urlObj.toString();
        }
      } catch (e) {
        // Return baseUrl on URL parse failure
        logger.warn("Invalid redirect URL", { url });
      }

      // 4. Default: redirect to home
      return baseUrl;
    },
  },
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true, // Prevent XSS attacks
        sameSite: "lax", // Prevent CSRF
        path: "/",
        secure: isSecure, // Send over HTTPS only (production and Vercel environment)
      },
    },
    callbackUrl: {
      name: `authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecure,
      },
    },
    csrfToken: {
      name: `authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecure,
      },
    },
    pkceCodeVerifier: {
      name: `authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecure,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `authjs.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isSecure,
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
  trustHost: true,
});
