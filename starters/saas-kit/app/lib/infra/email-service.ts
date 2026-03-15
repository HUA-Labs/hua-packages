/**
 * Email sending service
 * Email delivery using AWS SES
 * Up to 50,000 emails per day
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { escapeHtml } from "@hua-labs/hua/utils";
import { getServerEnv } from "../env/env";
import { logger } from "./logger";

// AWS SES client (singleton)
let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    let region: string;
    let accessKeyId: string | undefined;
    let secretAccessKey: string | undefined;

    try {
      const serverEnv = getServerEnv();
      region =
        serverEnv.AWS_SES_REGION || serverEnv.AWS_REGION || "ap-northeast-2";
      accessKeyId = serverEnv.AWS_ACCESS_KEY_ID;
      secretAccessKey = serverEnv.AWS_SECRET_ACCESS_KEY;
    } catch {
      region =
        process.env.AWS_SES_REGION ||
        process.env.AWS_REGION ||
        "ap-northeast-2";
      accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    }

    logger.info("Creating AWS SES client", {
      region,
      defaultRegion: "ap-northeast-2",
    });

    // Set credentials explicitly only when env vars are present
    // Otherwise SDK uses the default credential chain (env vars, IAM role, etc.)
    sesClient = new SESClient({
      region,
      ...(accessKeyId &&
        secretAccessKey && {
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        }),
    });
  }
  return sesClient;
}

/**
 * Send contact inquiry email
 */
export async function sendContactInquiryEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryId: string;
}): Promise<{ success: boolean; error?: any }> {
  try {
    // Check AWS credentials
    let hasAccessKey: boolean;
    try {
      const serverEnv = getServerEnv();
      hasAccessKey = !!serverEnv.AWS_ACCESS_KEY_ID;
    } catch {
      hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID;
    }
    const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY;
    const region =
      process.env.AWS_SES_REGION || process.env.AWS_REGION || "ap-northeast-2";

    if (!hasAccessKey || !hasSecretKey) {
      logger.warn("AWS credentials not configured, skipping email send", {
        hasAccessKey,
        hasSecretKey,
        region,
        envKeys: Object.keys(process.env).filter(
          (key) => key.includes("AWS") || key.includes("SES"),
        ),
      });
      return { success: false, error: "AWS credentials are missing." };
    }

    const contactEmail = process.env.CONTACT_EMAIL || "contact@hua.ai.kr";
    const fromEmail =
      process.env.AWS_SES_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      process.env.NOREPLY_EMAIL ||
      "noreply@hua.ai.kr";

    logger.info("Attempting to send email", {
      from: fromEmail,
      to: contactEmail,
      region,
      inquiryId: data.inquiryId,
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New inquiry received</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Inquiry details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 100px;">Inquiry ID</td>
                <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.inquiryId)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name</td>
                <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject</td>
                <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.subject)}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Inquiry content</h2>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; white-space: pre-wrap; font-family: inherit; line-height: 1.8; color: #374151;">
${escapeHtml(data.message)}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This email was automatically sent by the inquiry system.<br>
            Inquiry ID: ${escapeHtml(data.inquiryId)}
          </p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New inquiry received

Inquiry ID: ${data.inquiryId}
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Inquiry content:
${data.message}
    `.trim();

    const command = new SendEmailCommand({
      Source: `"${process.env.APP_NAME || "Your App"}" <${fromEmail}>`,
      Destination: {
        ToAddresses: [contactEmail],
      },
      Message: {
        Subject: {
          Data: `[Contact] ${data.subject}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
          Text: {
            Data: textContent,
            Charset: "UTF-8",
          },
        },
      },
      ReplyToAddresses: [data.email], // Allow user to reply
    });

    const response = await getSESClient().send(command);

    logger.info("Contact inquiry email sent successfully (AWS SES)", {
      messageId: response.MessageId,
      inquiryId: data.inquiryId,
      to: contactEmail,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact inquiry email send failed (AWS SES):", error);
    return { success: false, error };
  }
}

/**
 * Send system notification email (signup, password reset, etc.)
 */
export async function sendSystemEmail(data: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
}): Promise<{ success: boolean; error?: any }> {
  try {
    // Check AWS credentials
    let hasAwsCredentials: boolean;
    try {
      const serverEnv = getServerEnv();
      hasAwsCredentials =
        !!(serverEnv.AWS_ACCESS_KEY_ID || serverEnv.AWS_SES_ACCESS_KEY_ID) &&
        !!(
          serverEnv.AWS_SECRET_ACCESS_KEY || serverEnv.AWS_SES_SECRET_ACCESS_KEY
        );
    } catch {
      hasAwsCredentials = !!(
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      );
    }

    if (!hasAwsCredentials) {
      logger.warn("AWS credentials not configured, skipping email send");
      return { success: false, error: "AWS credentials are missing." };
    }

    const fromEmail =
      process.env.AWS_SES_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      process.env.NOREPLY_EMAIL ||
      "noreply@hua.ai.kr";

    // Convert to to array
    const toAddresses = Array.isArray(data.to) ? data.to : [data.to];

    // Convert replyTo to array (if present)
    const replyToAddresses = data.replyTo
      ? Array.isArray(data.replyTo)
        ? data.replyTo
        : [data.replyTo]
      : undefined;

    const command = new SendEmailCommand({
      Source: `"${process.env.APP_NAME || "Your App"}" <${fromEmail}>`,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: data.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: data.html,
            Charset: "UTF-8",
          },
          Text: {
            Data: data.text || data.html.replace(/<[^>]*>/g, ""), // Strip HTML tags
            Charset: "UTF-8",
          },
        },
      },
      ...(replyToAddresses && { ReplyToAddresses: replyToAddresses }),
    });

    const response = await getSESClient().send(command);

    logger.info("System email sent successfully (AWS SES)", {
      messageId: response.MessageId,
      to: toAddresses,
      subject: data.subject,
    });

    return { success: true };
  } catch (error) {
    console.error("System email send failed (AWS SES):", error);
    return { success: false, error };
  }
}

/**
 * Send data export email
 */
export async function sendDataExportEmail(data: {
  to: string;
  userName: string;
  downloadUrl: string;
  expiresAt: Date;
  format: string;
}): Promise<{ success: boolean; error?: any }> {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLabel = data.format === "json" ? "JSON" : "HTML";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">📥 Your data export is ready</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Hello, <strong>${escapeHtml(data.userName)}</strong>!<br>
            Your requested data is ready.
          </p>

          <!-- Download Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${escapeHtml(data.downloadUrl)}"
               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                      color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none;
                      font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              📥 Download ${formatLabel} file
            </a>
          </div>

          <!-- Info Box -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 24px;">
            <h3 style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
              📋 Download info
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">File format</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 500; text-align: right;">${formatLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Link expires</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 500; text-align: right;">${formatDate(data.expiresAt)}</td>
              </tr>
            </table>
          </div>

          <!-- Warning -->
          <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ This download link expires in <strong>7 days</strong>. Please request a new export after expiration.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            This email was sent automatically.<br>
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Your data export is ready

Hello, ${data.userName}!
Your requested data is ready.

Download link: ${data.downloadUrl}
File format: ${formatLabel}
Link expires: ${formatDate(data.expiresAt)}

⚠️ This download link expires in 7 days.

---
This email was sent automatically.
  `.trim();

  return sendSystemEmail({
    to: data.to,
    subject: `[${process.env.APP_NAME || "YOUR_APP_NAME"}] Your data export is ready`,
    html: htmlContent,
    text: textContent,
  });
}

/**
 * Send notification email (announcements, events, etc.)
 */
export async function sendNotificationEmail(data: {
  to: string;
  userName: string;
  title: string;
  message: string;
  type: "notice" | "system" | "event";
  actionUrl?: string;
  actionLabel?: string;
}): Promise<{ success: boolean; error?: any }> {
  const typeLabels = {
    notice: { ko: "Notice", icon: "📢" },
    system: { ko: "System notification", icon: "⚙️" },
    event: { ko: "Event", icon: "🎉" },
  };

  const typeInfo = typeLabels[data.type];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            ${typeInfo.icon} ${typeInfo.ko}
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 16px;">
            Hello, <strong>${escapeHtml(data.userName)}</strong>!
          </p>

          <h2 style="font-size: 20px; color: #1f2937; margin-bottom: 16px;">
            ${escapeHtml(data.title)}
          </h2>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #06b6d4;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${escapeHtml(data.message)}
            </p>
          </div>

          ${
            data.actionUrl
              ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${escapeHtml(data.actionUrl)}"
               style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                      color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none;
                      font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
              ${escapeHtml(data.actionLabel || "View details")}
            </a>
          </div>
          `
              : ""
          }
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            This email was sent automatically.<br>
            You can manage your preferences in <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/settings" style="color: #06b6d4;">notification settings</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
${typeInfo.icon} ${typeInfo.ko}

Hello, ${data.userName}!

${data.title}

${data.message}

${data.actionUrl ? `View details: ${data.actionUrl}` : ""}

---
This email was sent automatically.
Notification settings: ${process.env.NEXT_PUBLIC_APP_URL || "#"}/settings
  `.trim();

  return sendSystemEmail({
    to: data.to,
    subject: `[${process.env.APP_NAME || "YOUR_APP_NAME"}] ${data.title}`,
    html: htmlContent,
    text: textContent,
  });
}
