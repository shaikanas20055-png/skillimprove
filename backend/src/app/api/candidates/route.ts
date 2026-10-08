import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minReadiness = parseInt(searchParams.get("minReadiness") || "0");
    const skillFilter = searchParams.get("skill");

    // Try finding students in Prisma
    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(minReadiness > 0
          ? {
              profile: {
                readinessScore: { gte: minReadiness },
              },
            }
          : {}),
      },
      include: {
        profile: true,
        userSkills: {
          include: { skill: true },
        },
      },
    });

    if (users.length > 0) {
      const formatted = users.map((u) => ({
        id: u.id,
        name: u.name || "Student Candidate",
        readiness: u.profile?.readinessScore || 75,
        match: u.profile?.matchAverage || 88,
        skills: u.userSkills.map((s) => s.skill.name),
        softSkills: ["Communication", "Problem solving", "Teamwork"],
        internships: u.profile?.internshipsDone || 0,
      }));
      return NextResponse.json(formatted);
    }

    // Default candidates dataset matching SkillImprove's current frontend
    const defaultCandidates = [
      { name: "Priya Sharma", readiness: 91, match: 94, skills: ["React", "Node.js", "SQL", "JavaScript"], softSkills: ["Communication", "Teamwork", "Leadership"], internships: 2 },
      { name: "Alex Johnson", readiness: 82, match: 92, skills: ["React", "JavaScript", "Python"], softSkills: ["Communication", "Problem solving", "Teamwork"], internships: 1 },
      { name: "Maya Patel", readiness: 88, match: 91, skills: ["Python", "AI/ML", "Cloud"], softSkills: ["Critical thinking", "Problem solving", "Time management"], internships: 0 },
      { name: "Rahul Verma", readiness: 79, match: 87, skills: ["Java", "Spring", "SQL"], softSkills: ["Teamwork", "Problem solving", "Time management"], internships: 1 },
      { name: "Sara Khan", readiness: 85, match: 89, skills: ["React", "TypeScript", "AWS", "JavaScript"], softSkills: ["Communication", "Leadership", "Time management"], internships: 2 },
      { name: "Vikram Rao", readiness: 76, match: 84, skills: ["Python", "Django", "Docker"], softSkills: ["Critical thinking", "Teamwork", "Problem solving"], internships: 0 },
    ];

    return NextResponse.json(defaultCandidates);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}
