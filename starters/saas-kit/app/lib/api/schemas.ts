/**
 * Zod schemas for API request/response validation
 *
 * Type-safe validation for request bodies and responses across all API routes.
 */

import { z } from "zod";

// ============================================================================
// User profile schemas
// ============================================================================

/**
 * Profile entity schema (reusable)
 */
export const ProfileEntitySchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  nickname: z.string().nullable(),
  profile_image: z.string().nullable(),
  state: z.string(),
  role: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileEntity = z.infer<typeof ProfileEntitySchema>;

/**
 * Update profile request schema
 */
export const UpdateProfileRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter your name.")
    .max(50, "Name must be 50 characters or less.")
    .optional(),
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters.")
    .max(20, "Nickname must be 20 characters or less.")
    .regex(
      /^[a-zA-Z0-9가-힣_]+$/,
      "Nickname can only contain letters, numbers, Korean characters, and underscores.",
    )
    .optional(),
  profile_image: z
    .url({ error: "Invalid image URL format." })
    .nullable()
    .optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/**
 * Update profile response schema
 */
export const UpdateProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;

/**
 * Get profile response schema
 */
export const GetProfileResponseSchema = z.object({
  success: z.boolean(),
  data: ProfileEntitySchema,
});

export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;

// ============================================================================
// Notification schemas
// ============================================================================

/**
 * Notification entity schema (reusable)
 */
export const NotificationEntitySchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nullable(),
  type: z.enum(["notice", "system", "event", "announcement"]).nullable(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  read: z.boolean(),
  created_at: z.string(),
  visible_from: z.string().nullable(),
  visible_to: z.string().nullable(),
  announcement_id: z.uuid().nullable(),
  event_id: z.uuid().nullable(),
});

export type NotificationEntity = z.infer<typeof NotificationEntitySchema>;

/**
 * Create notification request schema (admin)
 *
 * Note: Matches Prisma NotificationType enum (notice, system, event, announcement)
 */
export const CreateNotificationRequestSchema = z.object({
  user_id: z.uuid({ error: "Invalid user ID format." }).nullable(),
  type: z.enum(["notice", "system", "event", "announcement"]),
  // Default language (Korean)
  title: z
    .string()
    .min(1, "Please enter a title.")
    .max(200, "Title must be 200 characters or less."),
  message: z
    .string()
    .min(1, "Please enter a message.")
    .max(1000, "Message must be 1000 characters or less."),
  // English version (optional)
  title_en: z.string().max(200).nullable().optional(),
  message_en: z.string().max(1000).nullable().optional(),
  // Japanese version (optional)
  title_ja: z.string().max(200).nullable().optional(),
  message_ja: z.string().max(1000).nullable().optional(),
  visible_from: z.iso.datetime().nullable().optional(),
  visible_to: z.iso.datetime().nullable().optional(),
  announcement_id: z.uuid().nullable().optional(),
  event_id: z.uuid().nullable().optional(),
  adminOnly: z.boolean().optional(), // Send to admins only (for testing)
  sendEmail: z.boolean().optional(), // Also send via email
});

export type CreateNotificationRequest = z.infer<
  typeof CreateNotificationRequestSchema
>;

/**
 * Create notification response schema
 */
export const CreateNotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  notificationIds: z.array(z.uuid()).optional(),
});

export type CreateNotificationResponse = z.infer<
  typeof CreateNotificationResponseSchema
>;

/**
 * Mark notification as read request schema
 */
export const UpdateNotificationReadRequestSchema = z.object({
  notificationId: z.uuid({ error: "Invalid notification ID format." }),
  read: z.boolean(),
});

export type UpdateNotificationReadRequest = z.infer<
  typeof UpdateNotificationReadRequestSchema
>;

/**
 * Mark notification as read response schema
 */
export const UpdateNotificationReadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type UpdateNotificationReadResponse = z.infer<
  typeof UpdateNotificationReadResponseSchema
>;

/**
 * Notification list query parameter schema
 */
export const NotificationListQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .regex(/^\d+$/)
    .default("20")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  type: z.enum(["notice", "system", "event", "announcement"]).optional(),
  read: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type NotificationListQuery = z.infer<typeof NotificationListQuerySchema>;

/**
 * Notification list response schema (kept as-is, can be refactored to Entity schema later)
 */

/**
 * Notification list response schema
 */
export const NotificationListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      read: z.boolean(),
      created_at: z.string(),
      visible_from: z.string().nullable(),
      visible_to: z.string().nullable(),
      announcement: z.any().nullable(),
      event: z.any().nullable(),
    }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export type NotificationListResponse = z.infer<
  typeof NotificationListResponseSchema
>;

// ============================================================================
// Announcement schemas
// ============================================================================

/**
 * Create announcement request schema
 */
export const CreateAnnouncementRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Please enter a title.")
    .max(200, "Title must be 200 characters or less."),
  body: z
    .string()
    .min(1, "Please enter the body text.")
    .max(10000, "Body must be 10,000 characters or less."),
  title_en: z.string().max(200).nullable().optional(),
  body_en: z.string().max(10000).nullable().optional(),
  title_ja: z.string().max(200).nullable().optional(),
  body_ja: z.string().max(10000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  published_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
});

export type CreateAnnouncementRequest = z.infer<
  typeof CreateAnnouncementRequestSchema
>;

// ============================================================================
// Blog schemas
// ============================================================================

/**
 * Create blog post request schema
 */
export const CreateBlogPostRequestSchema = z.object({
  slug: z
    .string()
    .min(1, "Please enter a slug.")
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
  title: z
    .string()
    .min(1, "Please enter a title.")
    .max(200, "Title must be 200 characters or less."),
  content: z
    .string()
    .min(1, "Please enter the content.")
    .max(50000, "Content must be 50,000 characters or less."),
  excerpt: z.string().max(500).nullable().optional(),
  title_en: z.string().max(200).nullable().optional(),
  content_en: z.string().max(50000).nullable().optional(),
  excerpt_en: z.string().max(500).nullable().optional(),
  title_ja: z.string().max(200).nullable().optional(),
  content_ja: z.string().max(50000).nullable().optional(),
  excerpt_ja: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  cover_image: z.string().max(500).nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export type CreateBlogPostRequest = z.infer<typeof CreateBlogPostRequestSchema>;

// ============================================================================
// Error log schemas
// ============================================================================

/**
 * Create error log request schema
 */
export const CreateErrorLogRequestSchema = z.object({
  severity: z.enum(["info", "warn", "error", "fatal"]),
  message: z.string().min(1, "Please enter a message.").max(2000),
  stack: z.string().max(10000).nullable().optional(),
  service: z.string().max(100).nullable().optional(),
  ref_table: z.string().max(100).nullable().optional(),
  ref_id: z.string().max(100).nullable().optional(),
  extra: z.any().optional(),
});

export type CreateErrorLogRequest = z.infer<typeof CreateErrorLogRequestSchema>;

// ============================================================================
// Common response schemas
// ============================================================================

/**
 * Success response schema
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string(),
  message: z.string(),
  quota: z
    .object({
      remaining: z.number(),
      resetAt: z.string(),
    })
    .optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
