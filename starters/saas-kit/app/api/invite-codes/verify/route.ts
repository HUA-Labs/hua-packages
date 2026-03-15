import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

// POST: Verify invite code validity (no usage — for pre-login check)
async function handleVerifyInviteCode(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          valid: false,
          error: "invalid_code",
        },
        { status: 400 },
      );
    }

    const normalizedCode = code.trim().toUpperCase();

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
      select: {
        id: true,
        code: true,
        type: true,
        is_premium: true,
        max_uses: true,
        used_count: true,
      },
    });

    if (!inviteCode) {
      return NextResponse.json({
        valid: false,
        error: "not_found",
      });
    }

    if (
      inviteCode.max_uses !== null &&
      inviteCode.used_count >= inviteCode.max_uses
    ) {
      return NextResponse.json({
        valid: false,
        error: "exhausted",
      });
    }

    return NextResponse.json({
      valid: true,
      code: inviteCode.code,
      type: inviteCode.type,
      is_premium: inviteCode.is_premium,
    });
  } catch (error) {
    console.error("[invite-codes/verify] Error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "server_error",
      },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(
  handleVerifyInviteCode,
  RATE_LIMIT_PRESETS.sensitive,
);
