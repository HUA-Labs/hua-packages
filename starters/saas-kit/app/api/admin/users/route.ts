import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";
import { prisma } from "@/app/lib/infra/prisma";
import { decryptUser } from "@/app/lib/security/user-encryption";
import { logAdminSearch } from "@/app/lib/admin/audit-log";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";

// Admin user list
async function handleGetUsers(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Math.min(1000, parseInt(searchParams.get("page") || "1") || 1),
    );
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "20") || 20),
    );
    const state = searchParams.get("state");
    const searchRaw = searchParams.get("search") || "";

    const search =
      searchRaw.length > 200 ? searchRaw.substring(0, 200) : searchRaw;

    const where: any = {};
    const isPremiumFilter = searchParams.get("isPremium");

    if (state) {
      where.state = state;
    }

    if (isPremiumFilter === "true") {
      where.quota = { is_premium: true };
    } else if (isPremiumFilter === "false") {
      where.OR = [{ quota: null }, { quota: { is_premium: false } }];
    }

    if (search) {
      const searchLower = search.toLowerCase().trim();

      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          searchLower,
        )
      ) {
        where.id = searchLower;
      } else if (/^[0-9a-f]{1,64}$/i.test(searchLower)) {
        where.OR = [
          { email_hash: { startsWith: searchLower } },
          { nickname_hash: { startsWith: searchLower } },
        ];
      } else {
        where.id = "00000000-0000-0000-0000-000000000000";
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        profile_image: true,
        state: true,
        role: true,
        created_at: true,
        updated_at: true,
        email_enc: true,
        nickname_enc: true,
        email_hash: true,
        nickname_hash: true,
        quota: {
          select: {
            is_premium: true,
          },
        },
        _count: {
          select: {
            notifications: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    if (search) {
      logAdminSearch(
        userId,
        "USERS",
        search,
        total,
        ipAddress,
        userAgent,
      ).catch((err) => console.error("Log write failed:", err));
    }

    const decryptedUsers = await Promise.all(
      users.map(async (user) => {
        const decrypted = await decryptUser(user);
        return {
          id: decrypted.id,
          nickname: decrypted.nickname,
          profile_image: decrypted.profile_image,
          state: decrypted.state,
          role: user.role,
          created_at: decrypted.created_at,
          updated_at: decrypted.updated_at,
          email_hash: user.email_hash,
          nickname_hash: user.nickname_hash,
          is_premium: user.quota?.is_premium ?? false,
          _count: user._count,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      users: decryptedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return internalError();
  }
}

export const GET = withRateLimit(
  withAdmin(handleGetUsers),
  RATE_LIMIT_PRESETS.default,
);
