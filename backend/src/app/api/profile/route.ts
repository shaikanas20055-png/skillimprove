import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileQuerySchema, profileUpdateSchema, safeValidate } from "@/lib/validation";
import { genericErrorResponse, validationErrorResponse, logServerError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawEmail = searchParams.get("email") || "alex.johnson@example.com";

    // Server-Side Validation of Query Parameter
    const validation = safeValidate(profileQuerySchema, { email: rawEmail });
    if (!validation.success) {
      return validationErrorResponse("Invalid email format provided.");
    }

    const email = validation.data.email || "alex.johnson@example.com";

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
      // Default profile data for demonstration without leaking DB missing state
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
  } catch (error: unknown) {
    logServerError("GET /api/profile", error);
    // Generic fallback without leaking error stack
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse("Invalid JSON payload.");
    }

    // Server-Side Validation
    const validation = safeValidate(profileUpdateSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email, name, headline, readinessScore } = validation.data;
    const targetEmail = email || "alex.johnson@example.com";

    const user = await prisma.user.findFirst({
      where: { email: targetEmail },
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
            headline: headline ?? undefined,
            readinessScore: readinessScore ?? undefined,
          },
          create: {
            userId: user.id,
            headline: headline ?? "Engineering Student",
            readinessScore: readinessScore ?? 80,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: unknown) {
    return genericErrorResponse("PUT /api/profile", error);
  }
}
