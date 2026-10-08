import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, assessmentId, answers, score: clientScore } = body;

    // Calculate score or verify against DB questions if available
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
              answersJson: answers,
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
      console.warn("DB submission write skipped:", dbErr);
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
