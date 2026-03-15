import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/infra/prisma";
import { withAdmin } from "@/app/lib/admin/admin";
import { logAdminRoleChange } from "@/app/lib/admin/audit-log";
import { getClientIp } from "@/app/lib/rate-limit/middleware";
import { validationError, notFound, internalError } from "@/app/lib/errors";

const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
  reason: z.string().max(500).optional(),
});

/**
 * PATCH /api/admin/users/[id]/role
 * Change a user's role/permissions.
 *
 * - Cannot change own role (safety guard)
 * - All role changes are recorded in AuditLog
 */
export const PATCH = withAdmin(
  async (request: NextRequest, { userId: adminId }): Promise<Response> => {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split("/");
      const targetUserId = pathParts[pathParts.length - 2]; // /api/admin/users/[id]/role

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(targetUserId)) {
        return validationError("VALIDATION_INVALID_FORMAT");
      }

      if (targetUserId === adminId) {
        return validationError();
      }

      const body = await request.json();
      const parseResult = roleUpdateSchema.safeParse(body);

      if (!parseResult.success) {
        return validationError("VALIDATION_FAILED", parseResult.error.issues);
      }

      const { role: newRole, reason } = parseResult.data;

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, role: true },
      });

      if (!targetUser) {
        return notFound("USER");
      }

      const previousRole = targetUser.role;

      if (previousRole === newRole) {
        return validationError();
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get("user-agent") || "unknown";
      const action = newRole === "ADMIN" ? "GRANT_ADMIN" : "REVOKE_ADMIN";

      await logAdminRoleChange(
        adminId,
        targetUserId,
        action,
        previousRole,
        newRole,
        reason,
        ipAddress,
        userAgent,
      );

      return NextResponse.json({
        success: true,
        message:
          newRole === "ADMIN" ? "Admin role granted." : "Admin role revoked.",
        data: {
          userId: targetUserId,
          previousRole,
          newRole,
        },
      });
    } catch (error) {
      console.error("Role change error:", error);
      return internalError();
    }
  },
  { enableRateLimit: true, userLimitPerMinute: 30, ipLimitPerMinute: 50 },
);
