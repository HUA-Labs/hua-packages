import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";

async function handleGetUserStats(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const [total, active, inactive, banned, premium] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { state: "active" } }),
      prisma.user.count({ where: { state: "inactive" } }),
      prisma.user.count({ where: { state: "banned" } }),
      prisma.userQuota.count({ where: { is_premium: true } }),
    ]);

    return NextResponse.json({
      total,
      active,
      inactive,
      banned,
      premium,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return internalError();
  }
}

export const GET = withAdmin(handleGetUserStats);
