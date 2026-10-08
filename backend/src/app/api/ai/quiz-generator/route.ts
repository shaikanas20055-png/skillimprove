import { NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic = "React", count = 3 } = body;

    const quiz = await generateQuizQuestions(topic, count);

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate dynamic assessment quiz",
      },
      { status: 500 }
    );
  }
}
