/**
 * Admin activity audit log
 *
 * Records all important admin activities to enable security and accountability tracking.
 * Uses the AuditLog model to provide detailed audit trails.
 */

import { prisma } from "@/app/lib/infra/prisma";
import { Prisma } from "@/prisma/generated/client";

// Action types
export type AdminActionType =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "DECRYPT"
  | "EXPORT"
  | "SEARCH"
  | "GRANT_ADMIN"
  | "REVOKE_ADMIN"
  | "LOGIN"
  | "ACCESS";

// Resource types
export type AdminResourceType =
  | "User"
  | "AbuseAlert"
  | "Notification"
  | "AdminPanel"
  | "SystemConfig";

export interface AdminAuditLogInput {
  adminId: string;
  action: AdminActionType;
  resource: AdminResourceType;
  resourceId: string;
  changes?: { before?: any; after?: any };
  reason?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Record admin activity to AuditLog
 */
export async function logAdminAction(input: AdminAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: input.adminId,
        actor_type: "ADMIN",
        action: input.action,
        resource: input.resource,
        resource_id: input.resourceId,
        changes: input.changes ? input.changes : undefined,
        reason: input.reason ?? null,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log admin activity:", error);
    // Log failure should not affect main logic (silent fail)
  }
}

/**
 * Log admin role grant/revoke
 */
export async function logAdminRoleChange(
  adminId: string,
  targetUserId: string,
  action: "GRANT_ADMIN" | "REVOKE_ADMIN",
  previousRole: string,
  newRole: string,
  reason: string | undefined,
  ipAddress: string,
  userAgent: string,
): Promise<void> {
  await logAdminAction({
    adminId,
    action,
    resource: "User",
    resourceId: targetUserId,
    changes: {
      before: { role: previousRole },
      after: { role: newRole },
    },
    reason,
    ipAddress,
    userAgent,
  });
}

/**
 * Log admin panel access
 */
export async function logAdminAccess(
  adminId: string,
  ipAddress: string,
  userAgent: string,
): Promise<void> {
  await logAdminAction({
    adminId,
    action: "ACCESS",
    resource: "AdminPanel",
    resourceId: adminId, // Self-access
    ipAddress,
    userAgent,
  });
}

/**
 * Log admin search activity
 */
export async function logAdminSearch(
  adminId: string,
  searchType: "USERS",
  searchQuery: string,
  resultCount: number,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  const resourceMap: Record<string, AdminResourceType> = {
    USERS: "User",
  };

  await logAdminAction({
    adminId,
    action: "SEARCH",
    resource: resourceMap[searchType] || "User",
    resourceId: adminId, // Search is not targeted at a specific resource
    changes: {
      after: {
        query: searchQuery.substring(0, 100),
        resultCount,
      },
    },
    ipAddress: ipAddress || "unknown",
    userAgent: userAgent || "unknown",
  });
}

/**
 * Log admin view activity
 */
export async function logAdminView(
  adminId: string,
  targetType: "USER",
  targetId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  const resourceMap: Record<string, AdminResourceType> = {
    USER: "User",
  };

  await logAdminAction({
    adminId,
    action: "READ",
    resource: resourceMap[targetType] || "User",
    resourceId: targetId,
    ipAddress: ipAddress || "unknown",
    userAgent: userAgent || "unknown",
  });
}
