import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIp } from "@/lib/rate-limiter";
import { loginSchema, safeValidate } from "@/lib/validation";
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

    // 1. Server-Side Validation using Zod
    const validation = safeValidate(loginSchema, body);
    if (!validation.success) {
      // Consume an attempt to prevent automated schema probing attacks
      const rateKey = `login:${clientIp}:invalid-input`;
      rateLimiter.consume(rateKey, RATE_LIMIT_CONFIGS.LOGIN);
      return validationErrorResponse(validation.error);
    }

    const { email, password, role } = validation.data;
    const rateLimitKey = `login:${clientIp}:${email}`;

    // 2. Login Rate Limiting (Check window & lockouts)
    const rateStatus = rateLimiter.check(rateLimitKey, RATE_LIMIT_CONFIGS.LOGIN);
    if (!rateStatus.allowed) {
      logServerError("LoginRateLimitTriggered", { email, clientIp, resetSeconds: rateStatus.resetSeconds });
      return rateLimitResponse(rateStatus.resetSeconds, true);
    }

    // 3. User Lookup
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    // 4. Verify Credentials (Generic Error handling - prevent user enumeration)
    let isPasswordValid = false;
    if (user && user.password) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Perform a dummy bcrypt comparison to prevent side-channel timing attacks
      await bcrypt.compare(password, "$2a$10$wN1q8vF4fUvT8V8n5fUVOeX8n0O9aG9D4F2sQ3j4K5l6M7n8P9q0R");
    }

    // Also verify against default demo roles for seamless dev support
    const demoRoles: Record<string, { email: string; pass: string; role: string; name: string }> = {
      student: { email: "student@skillimprove.com", pass: "Student@123", role: "STUDENT", name: "Alex Johnson" },
      industry: { email: "industry@skillimprove.com", pass: "Industry@123", role: "RECRUITER", name: "TechNova Solutions" },
      college: { email: "college@skillimprove.com", pass: "College@123", role: "COLLEGE_ADMIN", name: "ABC Institute of Technology" },
    };

    const isDemoRoleMatch = Object.values(demoRoles).some(
      (d) => d.email === email && d.pass === password
    );

    if (!isPasswordValid && !isDemoRoleMatch) {
      // Record failed attempt in rate limiter
      const failedRate = rateLimiter.consume(rateLimitKey, RATE_LIMIT_CONFIGS.LOGIN);

      if (!failedRate.allowed) {
        return rateLimitResponse(failedRate.resetSeconds, true);
      }

      // Generic error response: NEVER reveal if email or password was wrong
      return NextResponse.json(
        {
          success: false,
          error: GENERIC_ERRORS.INVALID_CREDENTIALS,
          remainingAttempts: failedRate.remaining,
        },
        { status: 401 }
      );
    }

    // 5. Successful Login: Clear Rate Limiter
    rateLimiter.reset(rateLimitKey);

    // Resolve user data
    const matchedDemo = Object.values(demoRoles).find((d) => d.email === email);
    const resolvedRole = user?.role || (matchedDemo ? matchedDemo.role : (role?.toUpperCase() || "STUDENT"));
    const resolvedName = user?.name || (matchedDemo ? matchedDemo.name : "SkillImprove User");
    const resolvedId = user?.id || `user-${Date.now()}`;

    // Return safe user details (no password or sensitive fields)
    return NextResponse.json({
      success: true,
      user: {
        id: resolvedId,
        name: resolvedName,
        email,
        role: resolvedRole.toLowerCase(),
        readinessScore: user?.profile?.readinessScore ?? 82,
      },
      message: "Authentication successful",
    });
  } catch (error: unknown) {
    // 6. Generic 500 error: No stack traces or DB details leaked to client
    return genericErrorResponse("POST /api/auth/login", error);
  }
}
