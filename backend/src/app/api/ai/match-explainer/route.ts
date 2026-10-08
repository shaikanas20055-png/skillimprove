import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateName = "Alex Johnson", roleTitle = "Frontend Engineer", candidateSkills = ["React", "JavaScript"], jobSkills = ["React", "TypeScript", "Tailwind CSS"] } = body;

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
        summary: `${candidateName} has verified foundation in ${matched.join(", ")}. Upskilling in ${missing.join(", ")} will bring candidate to a 95%+ match.`,
        recommendation: score >= 80 ? "High Priority for Technical Interview" : "Recommend Preliminary Skill Assessment",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
