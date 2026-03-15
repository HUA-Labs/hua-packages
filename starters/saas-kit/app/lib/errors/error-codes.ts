/**
 * Unified error code system
 *
 * All API errors follow this code scheme.
 * To add a new code, modify only this file.
 *
 * @see docs/areas/architecture/error-code-system.md
 */

interface ErrorDef {
  status: number;
  message: string;
}

function def(status: number, message: string): ErrorDef {
  return { status, message };
}

export const Errors = {
  // ── AUTH ──
  AUTH_REQUIRED: def(401, "Authentication required."),
  AUTH_TOKEN_EXPIRED: def(401, "Session expired. Please sign in again."),
  AUTH_TOKEN_INVALID: def(401, "Invalid credentials."),
  AUTH_FORBIDDEN: def(403, "Access denied."),
  AUTH_ADMIN_REQUIRED: def(403, "Admin privileges required."),
  AUTH_SUSPICIOUS_REQUEST: def(403, "Suspicious request detected."),
  AUTH_PROVIDER_ERROR: def(401, "Social login authentication failed."),
  AUTH_ACCOUNT_WITHDRAWN: def(403, "Account withdrawal in progress."),
  AUTH_USER_BANNED: def(403, "This account has been suspended."),
  AUTH_USER_INACTIVE: def(
    403,
    "This account is inactive. Please contact support.",
  ),
  AUTH_USER_RESIGNED: def(403, "This account has been deleted."),
  AUTH_AUDIENCE_MISMATCH: def(401, "Invalid authentication token."),

  // ── VALIDATION ──
  VALIDATION_FAILED: def(400, "Please check your input."),
  VALIDATION_MISSING_FIELD: def(400, "Please fill in all required fields."),
  VALIDATION_INVALID_FORMAT: def(400, "Please enter a valid format."),
  VALIDATION_TOO_LONG: def(400, "Input exceeds the maximum length."),
  VALIDATION_INVALID_FILE: def(400, "Unsupported file type."),

  // ── QUOTA ──
  QUOTA_EXCEEDED: def(403, "Daily quota exhausted."),
  RATE_LIMIT_EXCEEDED: def(429, "Too many requests. Please try again later."),
  RATE_LIMIT_PENALIZED: def(429, "Access temporarily restricted."),

  // ── USER ──
  USER_NOT_FOUND: def(404, "User not found."),
  USER_PROFILE_UPDATE_FAILED: def(500, "Failed to update profile."),
  USER_NICKNAME_DUPLICATE: def(409, "This nickname is already taken."),
  USER_SETTINGS_FAILED: def(500, "Failed to save settings."),

  // ── NOTIFICATION ──
  NOTIFICATION_NOT_FOUND: def(404, "Notification not found."),

  // ── ADMIN ──
  ADMIN_CRISIS_NOT_FOUND: def(404, "Crisis alert not found."),
  ADMIN_ABUSE_NOT_FOUND: def(404, "Abuse report not found."),
  ADMIN_DECRYPT_FAILED: def(500, "Failed to decrypt data."),

  // ── FILE ──
  FILE_REQUIRED: def(400, "Please select a file."),
  FILE_INVALID_TYPE: def(400, "Only image files are allowed."),
  FILE_UPLOAD_FAILED: def(500, "File upload failed."),

  // ── SERVER ──
  TRANSACTION_CONFLICT: def(409, "Request conflict. Please try again later."),
  INTERNAL_ERROR: def(500, "Server error. Please try again later."),
  SERVICE_UNAVAILABLE: def(503, "Service is under maintenance."),
  SERVICE_WAKING: def(503, "Service is starting up. Please wait."),
  METHOD_NOT_ALLOWED: def(405, "Method not allowed."),

  // ── EXPORT ──
  EXPORT_NOT_FOUND: def(404, "Export request not found."),
  EXPORT_EXPIRED: def(410, "Download link has expired."),
  EXPORT_IN_PROGRESS: def(409, "An export is already in progress."),
  EXPORT_SEND_FAILED: def(500, "Failed to send export data."),

  // ── INVITE ──
  INVITE_CODE_INVALID: def(400, "Invalid invite code."),
  INVITE_CODE_EXPIRED: def(410, "Invite code has expired."),
  INVITE_CODE_USED: def(409, "Invite code has already been used."),
  INVITE_CODE_GENERATE_FAILED: def(500, "Failed to generate invite code."),

  // ── TRANSLATION ──
  TRANSLATION_NOT_FOUND: def(404, "Translation data not found."),

  // ── ANNOUNCEMENT ──
  ANNOUNCEMENT_NOT_FOUND: def(404, "Announcement not found."),

  // ── BLOG ──
  BLOG_NOT_FOUND: def(404, "Post not found."),

  // ── PAYMENT ──
  PAYMENT_PLAN_NOT_FOUND: def(404, "Plan not found."),
  PAYMENT_ALREADY_SUBSCRIBED: def(
    409,
    "An active subscription already exists.",
  ),
  PAYMENT_SUBSCRIPTION_NOT_FOUND: def(404, "Subscription not found."),
  PAYMENT_CHECKOUT_FAILED: def(500, "Failed to create checkout session."),
  PAYMENT_CANCEL_FAILED: def(500, "Failed to cancel subscription."),
  PAYMENT_WEBHOOK_INVALID_SIGNATURE: def(401, "Invalid webhook signature."),
  PAYMENT_WEBHOOK_PROCESSING_FAILED: def(500, "Webhook processing failed."),
  PAYMENT_PROVIDER_NOT_CONFIGURED: def(
    503,
    "Payment service is not configured.",
  ),
} as const;

export type ErrorCode = keyof typeof Errors;
