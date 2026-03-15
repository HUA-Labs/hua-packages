/**
 * Abuse detection penalty application API
 *
 * POST: Apply user penalty (warning, rate limiting, temporary ban, permanent ban)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  UserState,
  PenaltyLevel,
  NotificationType,
} from "@/prisma/generated/client";
import { withAdmin } from "@/app/lib/admin/admin";
import { prisma } from "@/app/lib/infra/prisma";
import { setUserRateLimit } from "@/app/lib/rate-limit/rate-limit";
import { notFound, validationError, internalError } from "@/app/lib/errors";

export const POST = withAdmin(
  async (
    request: NextRequest,
    { userId, params }: { userId: string; params: { id: string } },
  ) => {
    try {
      const { id } = params;

      const body = await request.json();
      const { penaltyLevel, reason, banDurationDays } = body;

      const alert = await prisma.abuseAlert.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              state: true,
            },
          },
        },
      });

      if (!alert) {
        return notFound("ADMIN_ABUSE");
      }

      if (!alert.user) {
        return notFound("USER");
      }
      let newUserState: UserState = alert.user.state;
      let actionTaken = "";

      switch (penaltyLevel) {
        case PenaltyLevel.WARNING:
          actionTaken = `Warning issued: ${reason || "Abuse pattern detected"}`;

          await prisma.notification.create({
            data: {
              user_id: alert.user_id,
              type: NotificationType.system,
              title: "Service Usage Warning",
              message:
                reason ||
                "An abuse pattern was detected. Please use the service responsibly.",
              read: false,
              visible_from: new Date(),
              visible_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
          break;

        case PenaltyLevel.RATE_LIMIT:
          actionTaken = `Rate limiting applied: ${reason || "Abuse pattern detected"}`;

          setUserRateLimit(alert.user_id, 3);

          await prisma.notification.create({
            data: {
              user_id: alert.user_id,
              type: NotificationType.system,
              title: "Service Usage Restricted",
              message:
                reason ||
                "An abuse pattern was detected. Your service usage has been restricted.",
              read: false,
              visible_from: new Date(),
              visible_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          break;

        case PenaltyLevel.TEMPORARY_BAN:
          newUserState = UserState.banned;
          actionTaken = `Temporary ban (${banDurationDays || 7} days): ${reason || "Abuse pattern detected"}`;
          break;

        case PenaltyLevel.PERMANENT_BAN:
          newUserState = UserState.banned;
          actionTaken = `Permanent ban: ${reason || "Abuse pattern detected"}`;
          break;

        default:
          return validationError();
      }

      if (newUserState !== alert.user.state) {
        await prisma.user.update({
          where: { id: alert.user_id },
          data: { state: newUserState },
        });

        let reasonCode = "ABUSE_DETECTION";
        if (penaltyLevel === PenaltyLevel.TEMPORARY_BAN) {
          const banUntil = banDurationDays
            ? new Date(Date.now() + banDurationDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          reasonCode = JSON.stringify({
            code: "ABUSE_DETECTION",
            banUntil: banUntil.toISOString(),
            banDurationDays: banDurationDays || 7,
          });
        }

        // Status change logged via AuditLog

        if (penaltyLevel === PenaltyLevel.TEMPORARY_BAN) {
          const banUntil = banDurationDays
            ? new Date(Date.now() + banDurationDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          await prisma.notification.create({
            data: {
              user_id: alert.user_id,
              type: NotificationType.system,
              title: "Account Temporarily Banned",
              message:
                reason ||
                `An abuse pattern was detected. Your account has been temporarily banned until ${banUntil.toLocaleDateString("en-US")}.`,
              read: false,
              visible_from: new Date(),
              visible_to: banUntil,
            },
          });
        }

        if (penaltyLevel === PenaltyLevel.PERMANENT_BAN) {
          await prisma.notification.create({
            data: {
              user_id: alert.user_id,
              type: NotificationType.system,
              title: "Account Permanently Banned",
              message:
                reason ||
                "An abuse pattern was detected. Your account has been permanently banned.",
              read: false,
              visible_from: new Date(),
              visible_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      const updatedAlert = await prisma.abuseAlert.update({
        where: { id },
        data: {
          status: "ACTION_TAKEN",
          penalty_level: penaltyLevel,
          reviewed_by: userId,
          reviewed_at: new Date(),
          action_taken: actionTaken,
          admin_notes: reason || undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              state: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Penalty applied.",
        alert: updatedAlert,
        userState: newUserState,
      });
    } catch (error) {
      console.error("Penalty application failed:", error);
      return internalError();
    }
  },
);
