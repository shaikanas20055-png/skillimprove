import { NextResponse } from "next/server";
import { generateSkillGapAnalysis } from "@/lib/ai";
import { skillGapSchema, safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    // Server-Side Validation
    const validation = safeValidate(skillGapSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const currentSkills = validation.data.currentSkills || ["React", "JavaScript"];
    const targetRole = validation.data.targetRole || "Full Stack Developer";
    const readinessScore = validation.data.readinessScore ?? 82;

    const analysis = await generateSkillGapAnalysis({
      currentSkills,
      targetRole,
      readinessScore,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    return genericErrorResponse(
      "POST /api/ai/skill-gap-analysis",
      error,
      500,
      "Unable to generate skill gap analysis at this time. Please try again later."
    );
  }
}
