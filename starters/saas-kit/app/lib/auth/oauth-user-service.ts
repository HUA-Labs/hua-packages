/**
 * Unified OAuth user find/create/link service
 *
 * Single source of truth for user resolution during OAuth login.
 * Used by both web (NextAuth signIn) and mobile (POST /api/auth/mobile).
 *
 * Rules:
 * 1. Find by provider + providerAccountId (exact match)
 * 2. Fall back to verified email_hash (cross-provider linking)
 * 3. Create new user if not found
 * 4. Never link by nickname
 *
 * Email linking policy:
 * - Only providers in EMAIL_LINK_ALLOWED_PROVIDERS may trigger email-based
 *   cross-provider account linking.
 * - Callers must also verify the provider's email_verified signal before
 *   passing email to findOrCreateOAuthUser (defense in depth).
 * - kakao, line, discord: email present but auto-link forbidden.
 *   Future explicit account-link flow will handle these.
 *
 * Concurrency:
 * - User creation + Account link are in a single transaction (no orphan users)
 * - P2002 unique constraint catch → retry fast path (idempotent on race)
 */

import { prisma } from "@/app/lib/infra/prisma";
import { hashUserData, encryptUserData } from "@/app/lib/security/encryption";
import { getUserStateErrorCode } from "./user-state";
import { logger } from "@/app/lib/infra/logger";
import type { ErrorCode } from "@/app/lib/errors/error-codes";

/**
 * Providers whose verified email may be used for cross-provider account linking.
 * All others: providerAccountId-only matching. No automatic email link.
 *
 * Criteria to add a provider here:
 * - Provider has a reliable email_verified signal
 * - Regional/setting-level variance is low
 * - Currently: google (OIDC standard). Next candidate: apple.
 * - Excluded: kakao, line, discord (regional variance, relay emails)
 */
export const EMAIL_LINK_ALLOWED_PROVIDERS: readonly string[] = ["google"];

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

export interface OAuthProviderProfile {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface OAuthAccountTokens {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  sessionState?: string | null;
  accountType?: string;
}

export interface OAuthUserResult {
  userId: string;
  isNewUser: boolean;
  blocked?: ErrorCode;
}

/**
 * Find or create a user for an OAuth login.
 *
 * This function is the single policy owner for:
 * - Which identifiers can link accounts (provider+accountId, verified email)
 * - User creation (User + Account + UserSettings + UserQuota in one transaction)
 * - Profile image sync
 * - User state checks (banned/inactive)
 */
export async function findOrCreateOAuthUser(
  profile: OAuthProviderProfile,
  tokens?: OAuthAccountTokens,
): Promise<OAuthUserResult> {
  const { provider, providerAccountId, email, image } = profile;

  // ── 1. Fast path: exact match by provider + providerAccountId ──
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: { provider, providerAccountId },
    },
    include: { user: true },
  });

  if (existingAccount) {
    return handleExistingAccount(existingAccount, profile, tokens);
  }

  // ── 2. Atomic: find/create user + link account in one transaction ──
  try {
    return await atomicCreateOrLink(profile, tokens);
  } catch (error) {
    // Race: another request already created the account → retry fast path
    if (isUniqueConstraintError(error)) {
      logger.warn("OAuth race condition detected, retrying lookup", {
        provider,
        providerAccountId,
      });
      const retryAccount = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      if (retryAccount) {
        const stateError = getUserStateErrorCode(retryAccount.user?.state);
        if (stateError) {
          return {
            userId: retryAccount.userId,
            isNewUser: false,
            blocked: stateError,
          };
        }
        if (image && retryAccount.user?.profile_image !== image) {
          await prisma.user.update({
            where: { id: retryAccount.userId },
            data: { profile_image: image, image },
          });
        }
        return { userId: retryAccount.userId, isNewUser: false };
      }
    }
    throw error;
  }
}

// ── Helpers ──

async function handleExistingAccount(
  existingAccount: {
    userId: string;
    user: {
      id: string;
      state: string | null;
      profile_image: string | null;
    } | null;
  },
  profile: OAuthProviderProfile,
  tokens?: OAuthAccountTokens,
): Promise<OAuthUserResult> {
  const { provider, providerAccountId, image } = profile;

  const stateError = getUserStateErrorCode(existingAccount.user?.state);
  if (stateError) {
    logger.warn("Blocked user attempted login", {
      userId: existingAccount.userId,
      state: existingAccount.user?.state,
      provider,
    });
    return {
      userId: existingAccount.userId,
      isNewUser: false,
      blocked: stateError,
    };
  }

  // Sync profile image if changed
  if (image && existingAccount.user?.profile_image !== image) {
    await prisma.user.update({
      where: { id: existingAccount.userId },
      data: { profile_image: image, image },
    });
  }

  // Update account tokens if provided
  if (tokens) {
    await prisma.account.update({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      data: {
        access_token: tokens.accessToken ?? undefined,
        refresh_token: tokens.refreshToken ?? undefined,
        expires_at: tokens.expiresAt ?? undefined,
        token_type: tokens.tokenType ?? undefined,
        scope: tokens.scope ?? undefined,
        id_token: tokens.idToken ?? undefined,
        session_state: tokens.sessionState ?? undefined,
      },
    });
  }

  logger.info("OAuth login: existing account", {
    provider,
    userId: existingAccount.userId,
  });
  return { userId: existingAccount.userId, isNewUser: false };
}

async function atomicCreateOrLink(
  profile: OAuthProviderProfile,
  tokens?: OAuthAccountTokens,
): Promise<OAuthUserResult> {
  const { provider, providerAccountId, email, name, image } = profile;
  const emailHash = email ? hashUserData(email) : null;

  return prisma.$transaction(async (tx) => {
    // ── Email fallback: find user by verified email hash ──
    let user = emailHash
      ? await tx.user.findUnique({ where: { email_hash: emailHash } })
      : null;

    let isNewUser = false;

    if (user) {
      const stateError = getUserStateErrorCode(user.state);
      if (stateError) {
        logger.warn("Blocked user attempted login via email", {
          userId: user.id,
          state: user.state,
          provider,
        });
        return { userId: user.id, isNewUser: false, blocked: stateError };
      }

      // Sync profile image
      if (image && user.profile_image !== image) {
        await tx.user.update({
          where: { id: user.id },
          data: { profile_image: image, image },
        });
      }
    } else {
      // ── Create new user + settings + quota ──
      isNewUser = true;
      const encryptedEmail = email ? await encryptUserData(email) : null;
      const nickname = name || "사용자";
      const encryptedNickname = await encryptUserData(nickname);

      const now = new Date();
      const kstOffset = 9 * 60 * 60 * 1000;
      const kstNow = new Date(now.getTime() + kstOffset);
      const kstYear = kstNow.getUTCFullYear();
      const kstMonth = kstNow.getUTCMonth();
      const kstDate = kstNow.getUTCDate();
      const dailyResetAt = new Date(
        Date.UTC(kstYear, kstMonth, kstDate + 1, 0, 0, 0, 0) - kstOffset,
      );
      const monthlyResetAt = new Date(
        Date.UTC(kstYear, kstMonth + 1, 1, 0, 0, 0, 0) - kstOffset,
      );

      user = await tx.user.create({
        data: {
          email_enc: encryptedEmail ? new Uint8Array(encryptedEmail) : null,
          nickname_enc: new Uint8Array(encryptedNickname),
          email_hash: emailHash,
          nickname_hash: null,
          image: normalizeImageUrl(image),
          profile_image: normalizeImageUrl(image),
          state: "active",
        },
      });

      await tx.userSettings.create({
        data: {
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          language: "ko",
          theme_style: "paper",
          theme_mode: "system",
        },
      });

      await tx.userQuota.create({
        data: {
          user_id: user.id,
          daily_resource_limit: 10,
          monthly_resource_limit: 300,
          daily_api_limit: 10,
          monthly_api_limit: 300,
          daily_reset_at: dailyResetAt,
          monthly_reset_at: monthlyResetAt,
          is_premium: false,
        },
      });

      logger.info("OAuth login: new user created", {
        provider,
        userId: user.id,
      });
    }

    // ── Link account (inside transaction → atomic with user creation) ──
    await tx.account.create({
      data: {
        userId: user.id,
        type: tokens?.accountType || "oauth",
        provider,
        providerAccountId,
        access_token: tokens?.accessToken,
        refresh_token: tokens?.refreshToken,
        expires_at: tokens?.expiresAt,
        token_type: tokens?.tokenType,
        scope: tokens?.scope,
        id_token: tokens?.idToken,
        session_state: tokens?.sessionState,
      },
    });

    return { userId: user.id, isNewUser };
  });
}
