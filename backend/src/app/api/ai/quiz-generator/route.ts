import { NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/ai";
import { z } from "zod";
import { safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse } from "@/lib/errors";

const quizSchema = z.object({
  topic: z.string().trim().min(1).max(100).default("React"),
  count: z.number().int().min(1).max(10).default(3),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    const validation = safeValidate(quizSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const topic = validation.data.topic || "React";
    const count = validation.data.count || 3;
    const quiz = await generateQuizQuestions(topic, count);

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: unknown) {
    return genericErrorResponse("POST /api/ai/quiz-generator", error);
  }
}
