/**
 * API error response helper
 *
 * All error responses are created through this function.
 * Consistent JSON structure: { code, error, details? }
 *
 * @example
 *   return apiError('AUTH_REQUIRED');
 *   return apiError('VALIDATION_FAILED', { field: 'email' });
 *   return unauthorized();          // shortcut
 *   return notFound('USER');         // → USER_NOT_FOUND
 *
 * @see docs/areas/architecture/error-code-system.md
 */

import { NextResponse } from "next/server";
import { Errors, type ErrorCode } from "./error-codes";

interface ApiErrorResponse {
  code: ErrorCode;
  error: string;
  details?: unknown;
}

/**
 * Create NextResponse from error code
 */
export function apiError(
  code: ErrorCode,
  details?: unknown,
): NextResponse<ApiErrorResponse> {
  const def = Errors[code];
  const body: ApiErrorResponse = { code, error: def.message };
  if (details !== undefined) {
    body.details = details;
  }
  return NextResponse.json(body, { status: def.status });
}

// ── Shortcut helpers ──

export function unauthorized(code: ErrorCode = "AUTH_REQUIRED") {
  return apiError(code);
}

export function forbidden(code: ErrorCode = "AUTH_FORBIDDEN") {
  return apiError(code);
}

export function notFound(domain: string) {
  const code = `${domain}_NOT_FOUND` as ErrorCode;
  if (!(code in Errors)) {
    return apiError("INTERNAL_ERROR");
  }
  return apiError(code);
}

export function validationError(
  code: ErrorCode = "VALIDATION_FAILED",
  details?: unknown,
) {
  return apiError(code, details);
}

export function internalError(code: ErrorCode = "INTERNAL_ERROR") {
  return apiError(code);
}
