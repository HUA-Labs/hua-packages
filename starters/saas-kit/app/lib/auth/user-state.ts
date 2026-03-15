/**
 * User state validation utilities
 *
 * Checks whether a user is active before allowing auth/API access.
 * Used by web (NextAuth signIn), mobile (JWT login/refresh), and API routes.
 */

import { prisma } from "@/app/lib/infra/prisma";
import type { ErrorCode } from "@/app/lib/errors/error-codes";

export type BlockedReason = "banned" | "inactive" | "resigned" | "not_found";

export class UserBlockedError extends Error {
  public readonly errorCode: ErrorCode;

  constructor(public reason: BlockedReason) {
    super(`User is ${reason}`);
    this.name = "UserBlockedError";
    this.errorCode = reasonToErrorCode(reason);
  }
}

function reasonToErrorCode(reason: BlockedReason): ErrorCode {
  switch (reason) {
    case "banned":
      return "AUTH_USER_BANNED";
    case "inactive":
      return "AUTH_USER_INACTIVE";
    case "resigned":
      return "AUTH_USER_RESIGNED";
    case "not_found":
      return "USER_NOT_FOUND";
  }
}

/**
 * Assert that a user exists and is active.
 * Throws UserBlockedError if not.
 */
export async function assertActiveUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { state: true },
  });

  if (!user) {
    throw new UserBlockedError("not_found");
  }

  if (user.state !== "active") {
    throw new UserBlockedError(user.state as BlockedReason);
  }
}

/**
 * Check user state and return the appropriate error code, or null if active.
 * Non-throwing alternative to assertActiveUser.
 */
export function getUserStateErrorCode(
  state: string | null | undefined,
): ErrorCode | null {
  if (!state || state === "active") return null;
  switch (state) {
    case "banned":
      return "AUTH_USER_BANNED";
    case "inactive":
      return "AUTH_USER_INACTIVE";
    case "resigned":
      return "AUTH_USER_RESIGNED";
    default:
      return "AUTH_USER_INACTIVE";
  }
}
