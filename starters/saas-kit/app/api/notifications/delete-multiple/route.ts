import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import type { Session } from "next-auth";
import { prisma } from "@/app/lib/infra/prisma";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

/**
 * Bulk delete multiple notifications
 * DELETE /api/notifications/delete-multiple
 * Body: { notificationIds: string[] }
 */
async function handleDeleteMultiple(request: NextRequest) {
  try {
    const session: Session | null = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "notificationIds array is required" },
        { status: 400 },
      );
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        user_id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} notifications deleted.`,
    });
  } catch (error) {
    console.error("Error deleting multiple notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const DELETE = withRateLimit(
  handleDeleteMultiple,
  RATE_LIMIT_PRESETS.default,
);
