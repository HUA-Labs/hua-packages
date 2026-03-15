/**
 * Discord Webhook notification utility
 *
 * Sends real-time alerts to the operations team on alert events.
 * Privacy: no content included; users identified by first 8 chars of nickname_hash.
 */

import { prisma } from "./prisma";

type WebhookChannel = "alert" | "system";

const WEBHOOK_URLS: Record<WebhookChannel, string | undefined> = {
  alert:
    process.env.DISCORD_WEBHOOK_ALERT || process.env.DISCORD_WEBHOOK_CRISIS,
  system: process.env.DISCORD_WEBHOOK_SYSTEM,
};

const COLORS = {
  CRITICAL: 0xed4245, // Red
  HIGH: 0xf57c00, // Orange
  MEDIUM: 0xfee75c, // Yellow
  LOW: 0x57f287, // Green
  INFO: 0x5865f2, // Blue
} as const;

async function getUserLabel(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname_hash: true },
    });
    if (user?.nickname_hash) return `#${user.nickname_hash.substring(0, 8)}`;
  } catch {}
  return userId.slice(0, 8) + "...";
}

async function sendWebhook(
  channel: WebhookChannel,
  payload: Record<string, unknown>,
): Promise<void> {
  const url = WEBHOOK_URLS[channel];
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Webhook failure does not affect service
    console.error(`[discord-webhook] Failed to send to ${channel} channel`);
  }
}

// ──────────────────────────────────────
// Risk Alert notification
// ──────────────────────────────────────

export function notifyRiskAlert(data: {
  userId: string;
  resourceId: string;
  riskLevel: number;
  riskTypes: string[];
  escalated?: boolean;
}): void {
  // Skip if risk_level is below 3
  if (data.riskLevel < 3) return;

  const color =
    data.riskLevel >= 4
      ? COLORS.CRITICAL
      : data.riskLevel === 3
        ? COLORS.HIGH
        : COLORS.MEDIUM;

  const mention = data.riskLevel >= 4 ? "@here " : "";

  getUserLabel(data.userId)
    .then((userLabel) => {
      sendWebhook("alert", {
        content: mention ? `${mention}Critical situation detected` : undefined,
        embeds: [
          {
            title: `🚨 Risk Alert — Level ${data.riskLevel}`,
            color,
            fields: [
              { name: "User", value: userLabel, inline: true },
              {
                name: "Resource",
                value: data.resourceId.slice(0, 8),
                inline: true,
              },
              {
                name: "Risk Level",
                value: String(data.riskLevel),
                inline: true,
              },
              { name: "Types", value: data.riskTypes.join(", ") || "N/A" },
              ...(data.escalated
                ? [{ name: "Escalated", value: "⬆️ Yes", inline: true }]
                : []),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    })
    .catch(() => {});
}

// ──────────────────────────────────────
// Abuse Alert notification
// ──────────────────────────────────────

const PENALTY_SEVERITY: Record<string, number> = {
  WARNING: 0,
  RATE_LIMIT: 1,
  TEMPORARY_BAN: 2,
  PERMANENT_BAN: 3,
};

export function notifyAbuseAlert(data: {
  userId: string;
  resourceId?: string;
  abusePatterns: string[];
  penaltyLevel: string;
}): void {
  // Notify only for RATE_LIMIT and above
  if ((PENALTY_SEVERITY[data.penaltyLevel] ?? 0) < 1) return;

  const color =
    data.penaltyLevel === "PERMANENT_BAN"
      ? COLORS.CRITICAL
      : data.penaltyLevel === "TEMPORARY_BAN"
        ? COLORS.HIGH
        : COLORS.MEDIUM;

  getUserLabel(data.userId)
    .then((userLabel) => {
      sendWebhook("system", {
        embeds: [
          {
            title: `⚠️ Abuse Alert — ${data.penaltyLevel}`,
            color,
            fields: [
              { name: "User", value: userLabel, inline: true },
              {
                name: "Resource",
                value: data.resourceId ? data.resourceId.slice(0, 8) : "N/A",
                inline: true,
              },
              { name: "Patterns", value: data.abusePatterns.join(", ") },
              { name: "Penalty", value: data.penaltyLevel, inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    })
    .catch(() => {});
}

// ──────────────────────────────────────
// General system notification
// ──────────────────────────────────────

export function notifySystem(data: {
  title: string;
  message: string;
  color?: keyof typeof COLORS;
}): void {
  sendWebhook("system", {
    embeds: [
      {
        title: data.title,
        description: data.message,
        color: COLORS[data.color ?? "INFO"],
        timestamp: new Date().toISOString(),
      },
    ],
  }).catch(() => {});
}
