import { NextResponse } from "next/server";
import { generateSkillGapAnalysis } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentSkills = ["React", "JavaScript", "Python"], targetRole = "Full Stack Developer", readinessScore = 82 } = body;

    const analysis = await generateSkillGapAnalysis({
      currentSkills,
      targetRole,
      readinessScore,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate AI skill gap analysis",
      },
      { status: 500 }
    );
  }
}
