/**
 * User Profile API
 *
 * GET /api/user/profile — Get current user's profile
 * PUT /api/user/profile — Update current user's profile
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth-v5";
import { prisma } from "@/app/lib/infra/prisma";
import { decryptUser } from "@/app/lib/security/user-encryption";
import { getSessionUserId } from "@/app/lib/auth/session-utils-server";
import { UpdateProfileRequestSchema } from "@/app/lib/api/schemas";
import { createValidationErrorResponse } from "@/app/lib/api/response";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import {
  unauthorized,
  notFound,
  apiError,
  internalError,
} from "@/app/lib/errors";

async function handleGetProfile(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile_image: true,
        state: true,
        role: true,
        created_at: true,
        updated_at: true,
        image: true,
        email_enc: true,
        nickname_enc: true,
      },
    });

    if (!user) {
      return notFound("USER");
    }

    const decryptedUser = await decryptUser(user);

    const userQuota = await prisma.userQuota.findUnique({
      where: { user_id: userId },
      select: { is_premium: true },
    });

    const profileData = {
      id: decryptedUser.id,
      email: decryptedUser.email,
      nickname: decryptedUser.nickname,
      profile_image: decryptedUser.profile_image,
      state: decryptedUser.state,
      role: decryptedUser.role,
      created_at: decryptedUser.created_at,
      updated_at: decryptedUser.updated_at,
      is_premium: userQuota?.is_premium ?? false,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return internalError();
  }
}

export const GET = withRateLimit(handleGetProfile, RATE_LIMIT_PRESETS.default);

async function handleUpdateProfile(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return unauthorized();
    }
    const body: unknown = await request.json();

    const validationResult = UpdateProfileRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { name, nickname, profile_image } = validationResult.data;

    if (nickname) {
      const { hashUserData } = await import("@/app/lib/security/encryption");
      const nicknameHash = hashUserData(nickname);

      const existingUser = await prisma.user.findFirst({
        where: {
          nickname_hash: nicknameHash,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return apiError("USER_NICKNAME_DUPLICATE");
      }
    }

    const { encryptUserData, hashUserData } =
      await import("@/app/lib/security/encryption");

    const updateData: any = {
      updated_at: new Date(),
    };

    if (nickname !== undefined) {
      updateData.nickname_enc = encryptUserData(nickname);
      updateData.nickname_hash = hashUserData(nickname);
    }

    if (profile_image !== undefined) {
      updateData.profile_image = profile_image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        profile_image: true,
        state: true,
        role: true,
        updated_at: true,
        email_enc: true,
        nickname_enc: true,
      },
    });

    const decryptedUser = await decryptUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: decryptedUser.id,
        email: decryptedUser.email,
        nickname: decryptedUser.nickname,
        profile_image: decryptedUser.profile_image,
        state: decryptedUser.state,
        role: decryptedUser.role,
        updated_at: decryptedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return apiError("USER_PROFILE_UPDATE_FAILED");
  }
}

export const PUT = withRateLimit(handleUpdateProfile, RATE_LIMIT_PRESETS.api);
