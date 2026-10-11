import { NextResponse } from "next/server";
import { matchExplainerSchema, safeValidate } from "@/lib/validation";
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
    const validation = safeValidate(matchExplainerSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { candidateName = "Candidate", roleTitle = "Software Engineer" } = validation.data;
    const candidateSkills = validation.data.candidateSkills || [];
    const jobSkills = validation.data.jobSkills || [];

    const matched = candidateSkills.filter((s: string) => jobSkills.includes(s));
    const missing = jobSkills.filter((s: string) => !candidateSkills.includes(s));
    const score = Math.round((matched.length / Math.max(1, jobSkills.length)) * 100);

    return NextResponse.json({
      success: true,
      explanation: {
        candidateName,
        roleTitle,
        overallMatch: score,
        matchedSkills: matched,
        unmatchedSkills: missing,
        summary: `${candidateName} has verified foundation in ${matched.join(", ") || "core fundamentals"}. Upskilling in ${missing.join(", ") || "specialized frameworks"} will bring candidate to a 95%+ match.`,
        recommendation: score >= 80 ? "High Priority for Technical Interview" : "Recommend Preliminary Skill Assessment",
      },
    });
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/ai/match-explainer", error);
  }
}
