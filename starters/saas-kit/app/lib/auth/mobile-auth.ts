/**
 * Mobile Authentication Utilities
 *
 * Stateless JWT Bearer token for mobile app (React Native).
 * Uses jose for signing/verification with NEXTAUTH_SECRET.
 * 30-day expiry.
 */

import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";

const ALGORITHM = "HS256";
const AUDIENCE = "saas-kit-app";
const ISSUER = "saas-kit";
const EXPIRY = "30d";

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Generate a mobile JWT token for a user
 */
export async function generateMobileToken(userId: string): Promise<string> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRY)
    .sign(getSecret());

  return token;
}

/**
 * Verify a mobile JWT token and return the userId
 */
export async function verifyMobileToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Verify token and check if it needs refresh (within 7 days of expiry)
 */
export async function verifyMobileTokenWithExpiry(token: string): Promise<{
  userId: string | null;
  needsRefresh: boolean;
}> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const userId = payload.sub ?? null;
    const exp = payload.exp ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const REFRESH_WINDOW = 7 * 24 * 60 * 60; // 7 days

    return {
      userId,
      needsRefresh: exp - now < REFRESH_WINDOW,
    };
  } catch {
    return { userId: null, needsRefresh: false };
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Extract + verify Bearer token from request, return userId.
 * Also checks that the user is active (not banned/inactive/resigned).
 */
export async function getUserIdFromBearer(
  request: NextRequest,
): Promise<string | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const userId = await verifyMobileToken(token);
  if (!userId) return null;

  // Check user state — reject banned/inactive/resigned users
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { state: true },
  });

  if (!user || user.state !== "active") {
    return null;
  }

  return userId;
}
