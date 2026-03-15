import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { apiError } from "@/app/lib/errors";

// POST: Apply invite code for authenticated user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("AUTH_REQUIRED");
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return apiError("INVITE_CODE_INVALID");
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if already premium
    const existingQuota = await prisma.userQuota.findUnique({
      where: { user_id: session.user.id },
      select: { is_premium: true },
    });

    if (existingQuota?.is_premium) {
      return NextResponse.json({
        success: true,
        message: "already_premium",
        applied: false,
      });
    }

    // Validate invite code
    const inviteCode = await prisma.inviteCode.findFirst({
      where: {
        code: normalizedCode,
        is_active: true,
        AND: [
          {
            OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
          },
        ],
      },
    });

    if (!inviteCode) {
      return apiError("INVITE_CODE_INVALID");
    }

    if (
      inviteCode.max_uses !== null &&
      inviteCode.used_count >= inviteCode.max_uses
    ) {
      return apiError("INVITE_CODE_USED");
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    await prisma.$transaction([
      prisma.inviteCode.update({
        where: { id: inviteCode.id },
        data: { used_count: { increment: 1 } },
      }),
      prisma.userQuota.upsert({
        where: { user_id: session.user.id },
        create: {
          user_id: session.user.id,
          is_premium: inviteCode.is_premium,
          daily_diary_limit: inviteCode.is_premium ? 50 : 10,
          monthly_diary_limit: inviteCode.is_premium ? 1500 : 300,
          daily_analysis_limit: inviteCode.is_premium ? 50 : 10,
          monthly_analysis_limit: inviteCode.is_premium ? 1500 : 300,
          daily_reset_at: tomorrow,
          monthly_reset_at: nextMonth,
        },
        update: {
          is_premium: inviteCode.is_premium,
          daily_diary_limit: inviteCode.is_premium ? 50 : 10,
          monthly_diary_limit: inviteCode.is_premium ? 1500 : 300,
          daily_analysis_limit: inviteCode.is_premium ? 50 : 10,
          monthly_analysis_limit: inviteCode.is_premium ? 1500 : 300,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      applied: true,
      is_premium: inviteCode.is_premium,
      type: inviteCode.type,
    });
  } catch (error) {
    console.error("[invite-codes/apply] Error:", error);
    return apiError("INTERNAL_ERROR");
  }
}
