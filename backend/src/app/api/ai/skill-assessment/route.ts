import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse, logServerError } from "@/lib/errors";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const skillAssessmentSchema = z.object({
  roleTitle: z.string().trim().min(1).max(100).default("Software Engineer"),
  difficulty: z.string().trim().max(50).default("Medium"),
  score: z.number().int().min(0).max(100).default(80),
  totalQuestions: z.number().int().min(1).max(100).default(10),
  correctCount: z.number().int().min(0).max(100).default(8),
  incorrectCount: z.number().int().min(0).max(100).default(2),
  unansweredCount: z.number().int().min(0).max(100).default(0),
  weakSkills: z.array(z.string().trim().max(60)).max(50).default([]),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    const validation = safeValidate(skillAssessmentSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const roleTitle = validation.data.roleTitle || "Software Engineer";
    const difficulty = validation.data.difficulty || "Medium";
    const score = validation.data.score ?? 80;
    const totalQuestions = validation.data.totalQuestions ?? 10;
    const correctCount = validation.data.correctCount ?? 8;
    const incorrectCount = validation.data.incorrectCount ?? 2;
    const unansweredCount = validation.data.unansweredCount ?? 0;
    const weakSkills = validation.data.weakSkills || [];

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
      } catch (geminiErr: unknown) {
        logServerError("GeminiEvaluation", geminiErr);
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
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/ai/skill-assessment", error);
  }
}
