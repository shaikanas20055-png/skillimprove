import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  retryAfterSeconds?: number;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  [key: string]: any;
}

// GENERIC ERROR CONSTANTS (Never leak internal details or user enumeration)
export const GENERIC_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password. Please verify your credentials and try again.",
  RATE_LIMIT_EXCEEDED: "Too many login attempts. For security reasons, please try again in a few minutes.",
  GENERIC_RATE_LIMIT: "Too many requests. Please slow down and try again shortly.",
  UNAUTHORIZED: "Authentication required to access this resource.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INVALID_INPUT: "Invalid request payload. Please verify your input and try again.",
  INTERNAL_ERROR: "An unexpected error occurred while processing your request. Please try again later.",
  NOT_FOUND: "The requested resource could not be found.",
};

/**
 * Log error securely on server without exposing stack traces to clients.
 */
export function logServerError(context: string, error: unknown) {
  const timestamp = new Date().toISOString();
  if (error instanceof Error) {
    console.error(`[SECURITY/SERVER_ERROR][${timestamp}][${context}]`, {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } else {
    console.error(`[SECURITY/SERVER_ERROR][${timestamp}][${context}]`, error);
  }
}

/**
 * Standard generic error responder.
 * Hides all internal DB, Prisma, Firebase, and stack trace details from client.
 */
export function genericErrorResponse(
  context: string,
  error: unknown,
  status: number = 500,
  userFriendlyMessage: string = GENERIC_ERRORS.INTERNAL_ERROR
): NextResponse<ApiErrorResponse> {
  logServerError(context, error);

  return NextResponse.json(
    {
      success: false,
      error: userFriendlyMessage,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

/**
 * Generic validation error responder.
 */
export function validationErrorResponse(
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: details || GENERIC_ERRORS.INVALID_INPUT,
      code: "VALIDATION_ERROR",
    },
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

/**
 * Generic rate limit error responder.
 */
export function rateLimitResponse(
  retryAfterSeconds: number,
  isLogin: boolean = true
): NextResponse<ApiErrorResponse> {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  const message = isLogin
    ? `Too many failed login attempts. For security reasons, please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
    : GENERIC_ERRORS.GENERIC_RATE_LIMIT;

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfterSeconds.toString(),
        "X-RateLimit-Reset": retryAfterSeconds.toString(),
      },
    }
  );
}
