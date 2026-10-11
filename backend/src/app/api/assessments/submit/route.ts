import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assessmentSubmitSchema, safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse, logServerError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    // 1. Server-Side Validation
    const validation = safeValidate(assessmentSubmitSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { userId, assessmentId, answers, score: clientScore } = validation.data;

    let score = clientScore ?? 85;
    let passed = score >= 70;

    try {
      if (assessmentId) {
        const assessment = await prisma.assessment.findUnique({
          where: { id: assessmentId },
          include: { questions: true },
        });

        if (assessment && assessment.questions.length > 0 && Array.isArray(answers)) {
          let correctCount = 0;
          assessment.questions.forEach((q, idx) => {
            if (answers[idx] !== undefined && answers[idx] === q.correctIndex) {
              correctCount++;
            }
          });
          score = Math.round((correctCount / assessment.questions.length) * 100);
          passed = score >= assessment.passingScore;
        }

        if (userId) {
          await prisma.assessmentSubmission.create({
            data: {
              userId,
              assessmentId,
              score,
              passed,
              answersJson: JSON.stringify(answers),
            },
          });

          // Increase readiness score upon passing
          if (passed) {
            await prisma.profile.updateMany({
              where: { userId },
              data: {
                readinessScore: { increment: 4 },
              },
            });
          }
        }
      }
    } catch (dbErr) {
      logServerError("AssessmentSubmissionDb", dbErr);
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      badge: passed ? "VERIFIED_SKILL_BADGE" : null,
      message: passed
        ? `Congratulations! You scored ${score}% and verified this skill badge.`
        : `You scored ${score}%. Passing grade is 70%. Try again after reviewing the learning modules.`,
    });
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/assessments/submit", error);
  }
}
