import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roleTitle,
      difficulty,
      score,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      weakSkills = [],
    } = body;

    // If Gemini is available, generate rich structured evaluation feedback
    if (ai && apiKey) {
      try {
        const prompt = `You are the Lead Technical Interview Evaluator at SkillImprove.
Analyze this student's completed 10-minute technical skill assessment:
- Job Role: ${roleTitle}
- Difficulty Level: ${difficulty}
- Score: ${score}/100 (${correctCount} correct, ${incorrectCount} incorrect, ${unansweredCount} unanswered out of ${totalQuestions} questions)
- Identified Weak Skills / Misunderstood Topics: ${weakSkills.join(", ") || "None"}

Provide structured JSON with:
1. "performanceSummary": A concise, encouraging, and actionable assessment summary (2-3 sentences).
2. "identifiedWeaknesses": An array of strings highlighting specific concepts needing improvement.
3. "recommendedRevisionTopics": An array of 3-4 specific topics the student should revise before retaking the assessment.
4. "nextAssessmentTrack": String recommending either "Maintain Advanced Track" or "Focus on Intermediate Code Debugging".

Return ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "{}";
        const aiData = JSON.parse(text);

        return NextResponse.json({
          success: true,
          aiFeedback: aiData,
          source: "gemini-2.5-flash",
        });
      } catch (geminiErr: any) {
        console.warn("Gemini evaluation error, using fallback:", geminiErr?.message);
      }
    }

    // High quality deterministic fallback
    const performanceSummary =
      score >= 79
        ? `Outstanding work on the ${roleTitle} assessment! You demonstrated advanced technical mastery and will remain in the Advanced interview track.`
        : score >= 75
        ? `Solid technical performance on the ${roleTitle} assessment. You possess strong foundational skills with a few intermediate gaps to bridge.`
        : `Good effort on the ${roleTitle} assessment. Review core syntax and common interview patterns to improve your score on your next attempt.`;

    const recommendedRevisionTopics =
      score >= 79
        ? ["System Design & Concurrency", "Performance Profiling", "Advanced Framework Internals"]
        : ["Core Syntax & Built-in Methods", "Common Edge Cases & Error Handling", "Practical Code Completion"];

    return NextResponse.json({
      success: true,
      aiFeedback: {
        performanceSummary,
        identifiedWeaknesses: weakSkills.length > 0 ? weakSkills : ["Specific edge case patterns"],
        recommendedRevisionTopics,
        nextAssessmentTrack: score >= 79 ? "Advanced Technical Track" : "Medium-to-High Track",
      },
      source: "deterministic-engine",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
