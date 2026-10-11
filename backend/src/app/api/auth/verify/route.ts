import { NextResponse } from "next/server";
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/rate-limiter";
import { firebaseVerifySchema, safeValidate } from "@/lib/validation";
import { verifyFirebaseIdToken, syncFirebaseUserWithDatabase } from "@/lib/firebase-admin";
import {
  GENERIC_ERRORS,
  genericErrorResponse,
  validationErrorResponse,
  rateLimitResponse,
  logServerError,
} from "@/lib/errors";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    // 1. Server-Side Validation
    const validation = safeValidate(firebaseVerifySchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { idToken, role } = validation.data;
    const rateLimitKey = `firebase-verify:${clientIp}`;

    // 2. Rate Limiting Check
    const rateStatus = rateLimiter.check(rateLimitKey, RATE_LIMIT_CONFIGS.AUTH_VERIFY);
    if (!rateStatus.allowed) {
      return rateLimitResponse(rateStatus.resetSeconds, false);
    }

    // 3. Verify Firebase ID Token
    const firebaseUser = await verifyFirebaseIdToken(idToken);
    if (!firebaseUser) {
      // Consume attempt on invalid token
      rateLimiter.consume(rateLimitKey, RATE_LIMIT_CONFIGS.AUTH_VERIFY);
      logServerError("FirebaseTokenVerificationFailed", { clientIp });

      // Generic authentication error
      return NextResponse.json(
        {
          success: false,
          error: GENERIC_ERRORS.INVALID_CREDENTIALS,
        },
        { status: 401 }
      );
    }

    // 4. Synchronize user with database
    const dbUser = await syncFirebaseUserWithDatabase(firebaseUser, role || "STUDENT");

    // 5. Return sanitized user data
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id || firebaseUser.uid,
        name: dbUser?.name || firebaseUser.name,
        email: firebaseUser.email,
        role: (dbUser?.role?.toLowerCase() || role?.toLowerCase() || "student"),
        readinessScore: dbUser?.profile?.readinessScore ?? 82,
      },
      message: "Firebase session authenticated successfully",
    });
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/auth/verify", error);
  }
}
