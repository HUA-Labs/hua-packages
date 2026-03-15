import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth/auth-v5";
import { checkAdminPermission } from "@/app/lib/admin/admin";
import { unauthorized, internalError } from "@/app/lib/errors";

/**
 * GET /api/user/admin-check
 * Checks if the current user has admin permissions.
 */
export async function GET(request: NextRequest) {
  try {
    const session: Session | null = await auth();

    if (!session?.user?.id) {
      return unauthorized();
    }

    const isAdmin = await checkAdminPermission(session.user.id);

    return NextResponse.json({
      isAdmin,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return internalError();
  }
}
