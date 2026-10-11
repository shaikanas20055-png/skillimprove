import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { opportunityApplySchema, safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse, logServerError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    // Server-Side Validation
    const validation = safeValidate(opportunityApplySchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { userId, opportunityId, company, title } = validation.data;

    try {
      if (userId && opportunityId) {
        await prisma.application.upsert({
          where: {
            userId_opportunityId: {
              userId,
              opportunityId,
            },
          },
          update: {
            status: "APPLIED",
          },
          create: {
            userId,
            opportunityId,
            status: "APPLIED",
            matchScore: 92,
          },
        });
      }
    } catch (dbErr) {
      logServerError("OpportunityApplicationDb", dbErr);
    }

    return NextResponse.json({
      success: true,
      application: {
        id: `app-${Date.now()}`,
        company: company || "Partner Company",
        title: title || "Software Engineer",
        date: "Just now",
        match: 92,
        status: "Applied",
      },
    });
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/opportunities/apply", error);
  }
}
