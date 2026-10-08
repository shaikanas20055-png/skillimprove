import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        questions: {
          select: {
            id: true,
            prompt: true,
            options: true,
            explanation: true,
          },
        },
      },
    });

    if (assessments.length > 0) {
      const formatted = assessments.map((a) => ({
        ...a,
        questions: a.questions.map((q) => {
          let opts: any = q.options;
          if (typeof opts === "string") {
            try {
              opts = JSON.parse(opts);
            } catch {
              opts = [opts];
            }
          }
          return { ...q, options: opts };
        }),
      }));
      return NextResponse.json(formatted);
    }

    // Default seeded list if DB table is unpopulated
    return NextResponse.json([
      {
        id: "prog-react-101",
        title: "Frontend & React Core Assessment",
        category: "Programming",
        durationMinutes: 25,
        passingScore: 75,
        totalQuestions: 5,
        skillsTested: ["React", "State Management", "Hooks", "JavaScript"],
      },
      {
        id: "apt-logic-201",
        title: "Quantitative & Analytical Reasoning",
        category: "Aptitude",
        durationMinutes: 30,
        passingScore: 70,
        totalQuestions: 10,
        skillsTested: ["Logic", "Data Interpretation", "Problem Solving"],
      },
      {
        id: "soft-comm-301",
        title: "Workplace Communication & Team Collaboration",
        category: "Soft Skills",
        durationMinutes: 20,
        passingScore: 80,
        totalQuestions: 6,
        skillsTested: ["Communication", "Empathy", "Conflict Resolution"],
      },
    ]);
  } catch (error: any) {
    return NextResponse.json(
      [
        {
          id: "prog-react-101",
          title: "Frontend & React Core Assessment",
          category: "Programming",
          durationMinutes: 25,
          passingScore: 75,
        },
      ],
      { status: 200 }
    );
  }
}
