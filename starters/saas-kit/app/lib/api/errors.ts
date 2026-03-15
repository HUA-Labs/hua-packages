export interface ApiErrorOptions {
  status?: number;
  details?: string;
  cause?: unknown;
  isNetworkError?: boolean;
}

export class ApiError extends Error {
  status?: number;
  details?: string;
  isNetworkError: boolean;
  cause?: unknown;

  constructor(message: string, options?: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.details = options?.details;
    this.isNetworkError = options?.isNetworkError ?? false;

    this.cause = options?.cause;
  }
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
  details?: string;
}

/**
 * Converts a failed server Response into a user-friendly ApiError.
 */
export async function responseToApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  let payload: ApiErrorPayload = {};

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    // Response body may not be JSON — ignore
  }

  const message = payload.error || payload.message || fallbackMessage;

  return new ApiError(message, {
    status: response.status,
    details: payload.details,
  });
}

/**
 * Normalizes an unknown error into an ApiError.
 */
export function unknownToApiError(
  error: unknown,
  fallbackMessage: string,
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    const isNetworkError = error.name === "TypeError";
    return new ApiError(error.message || fallbackMessage, {
      cause: error,
      isNetworkError,
    });
  }

  return new ApiError(fallbackMessage);
}

export function logApiError(scope: string, error: ApiError) {
  console.error(`[${scope}]`, {
    message: error.message,
    status: error.status,
    details: error.details,
    isNetworkError: error.isNetworkError,
  });
}

/**
 * Authentication required error
 */
export class AuthRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthRequiredError";
  }
}
