/**
 * API response creation utility
 *
 * Ensures a consistent API response format with type safety.
 */

import { NextResponse } from "next/server";
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  type ErrorResponse,
  type SuccessResponse,
} from "./schemas";
import { getServerEnv } from "../env/env";

/**
 * Create error response
 *
 * @param error - Error code
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param quota - Quota info (optional)
 * @returns NextResponse
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 400,
  quota?: { remaining: number; resetAt: string },
): NextResponse {
  const errorData: ErrorResponse = {
    success: false,
    error,
    message,
    ...(quota && { quota }),
  };

  // Schema validation (development only)
  try {
    const serverEnv = getServerEnv();
    if (serverEnv.NODE_ENV === "development") {
      const validationResult = ErrorResponseSchema.safeParse(errorData);
      if (!validationResult.success) {
        console.error(
          "Error response schema validation failed:",
          validationResult.error,
        );
      }
    }
  } catch {
    // Skip at build time
  }

  return NextResponse.json(errorData, { status });
}

/**
 * Create success response
 *
 * @param data - Response data
 * @param message - Success message (optional)
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse
 */
export function createSuccessResponse<T = unknown>(
  data?: T,
  message?: string,
  status: number = 200,
): NextResponse {
  const successData: SuccessResponse = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };

  // Schema validation (development only)
  try {
    const serverEnv = getServerEnv();
    if (serverEnv.NODE_ENV === "development") {
      const validationResult = SuccessResponseSchema.safeParse(successData);
      if (!validationResult.success) {
        console.error(
          "Success response schema validation failed:",
          validationResult.error,
        );
      }
    }
  } catch {
    // Skip at build time
  }

  return NextResponse.json(successData, { status });
}

/**
 * Create validation error response
 *
 * Helper for Zod validation failures
 *
 * @param zodError - Zod error object or first error message
 * @returns NextResponse
 */
export function createValidationErrorResponse(
  zodError?: { message?: string } | { issues: Array<{ message?: string }> },
): NextResponse {
  let errorMessage = "Invalid input.";

  if (zodError) {
    // ZodError object
    if ("issues" in zodError && zodError.issues && zodError.issues.length > 0) {
      errorMessage = zodError.issues[0]?.message || errorMessage;
    }
    // Single error object
    else if ("message" in zodError && zodError.message) {
      errorMessage = zodError.message;
    }
  }

  return createErrorResponse("VALIDATION_ERROR", errorMessage, 400);
}
