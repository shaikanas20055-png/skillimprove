import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "alex.johnson@example.com";

    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        profile: true,
        userSkills: {
          include: { skill: true },
        },
        applications: {
          include: { opportunity: true },
        },
      },
    });

    if (!user) {
      // Return default profile data if DB user not found
      return NextResponse.json({
        id: "default-student",
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        role: "STUDENT",
        profile: {
          headline: "Aspiring Full Stack Engineer & Computer Science Graduate",
          college: "Tech University",
          readinessScore: 82,
          matchAverage: 92,
          internshipsDone: 1,
        },
        skills: [
          { name: "React", score: 85, verified: true },
          { name: "JavaScript", score: 88, verified: true },
          { name: "Python", score: 78, verified: false },
          { name: "SQL", score: 74, verified: false },
          { name: "Automated Testing", score: 55, verified: false },
        ],
      });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      skills: user.userSkills.map((us) => ({
        name: us.skill.name,
        score: us.score,
        verified: us.isVerified,
        level: us.level,
      })),
      applicationsCount: user.applications.length,
    });
  } catch (error: any) {
    console.error("GET /api/profile error:", error?.message);
    return NextResponse.json(
      {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        profile: { readinessScore: 82, matchAverage: 92, internshipsDone: 1 },
        skills: [{ name: "React", score: 85 }, { name: "JavaScript", score: 88 }],
        fallback: true,
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, name, headline, readinessScore } = body;

    const user = await prisma.user.findFirst({
      where: { email: email || "alex.johnson@example.com" },
    });

    if (user) {
      if (name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }
      if (headline || readinessScore !== undefined) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            headline,
            readinessScore: readinessScore ?? undefined,
          },
          create: {
            userId: user.id,
            headline,
            readinessScore: readinessScore ?? 80,
          },
        });
      }
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
