import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/infra/prisma";
import { withAdmin } from "@/app/lib/admin/admin";
import { internalError } from "@/app/lib/errors";

/**
 * GET /api/admin/audit-logs
 * Retrieve admin activity audit logs.
 *
 * Query params:
 * - page: page number (default 1)
 * - limit: items per page (default 50, max 100)
 * - action: filter by action type (e.g. GRANT_ADMIN, REVOKE_ADMIN)
 * - resource: filter by resource type (e.g. User)
 * - actorId: retrieve specific admin's activities only
 */
export const GET = withAdmin(
  async (request: NextRequest): Promise<Response> => {
    try {
      const { searchParams } = new URL(request.url);

      const page = Math.max(
        1,
        Math.min(1000, parseInt(searchParams.get("page") || "1") || 1),
      );
      const limit = Math.max(
        1,
        Math.min(100, parseInt(searchParams.get("limit") || "50") || 50),
      );
      const action = searchParams.get("action");
      const resource = searchParams.get("resource");
      const actorId = searchParams.get("actorId");

      const where: any = {
        actor_type: "ADMIN",
      };

      if (action) {
        where.action = action;
      }
      if (resource) {
        where.resource = resource;
      }
      if (actorId) {
        where.actor_id = actorId;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      const actorIds = [...new Set(logs.map((log) => log.actor_id))];
      const actors = await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, nickname_enc: true },
      });

      const actorMap = new Map(actors.map((a) => [a.id, a.nickname_enc]));

      const formattedLogs = logs.map((log) => ({
        id: log.id,
        actorId: log.actor_id,
        actorNickname: actorMap.get(log.actor_id) || "Unknown",
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        changes: log.changes,
        reason: log.reason,
        ipAddress: log.ip_address,
        createdAt: log.created_at,
      }));

      return NextResponse.json({
        success: true,
        logs: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Audit log fetch error:", error);
      return internalError();
    }
  },
  { enableRateLimit: true, userLimitPerMinute: 60, ipLimitPerMinute: 100 },
);
