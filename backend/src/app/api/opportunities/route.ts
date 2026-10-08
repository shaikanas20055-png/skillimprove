import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.opportunity.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (jobs.length > 0) {
      const formatted = jobs.map((job) => {
        let skillsArray: string[] = [];
        try {
          if (typeof job.skills === "string") {
            if (job.skills.startsWith("[")) {
              skillsArray = JSON.parse(job.skills);
            } else {
              skillsArray = job.skills.split(",").map((s) => s.trim()).filter(Boolean);
            }
          } else if (Array.isArray(job.skills)) {
            skillsArray = job.skills;
          }
        } catch {
          skillsArray = [job.skills];
        }

        return {
          ...job,
          skills: skillsArray,
        };
      });

      return NextResponse.json(formatted);
    }

    // Default opportunities seed
    return NextResponse.json([
      {
        id: "opp-1",
        title: "Frontend Engineering Intern",
        company: "Veloce Technologies",
        location: "Bengaluru, Hybrid",
        type: "Internship",
        salary: "₹25,000 - ₹35,000 / mo",
        skills: ["React", "TypeScript", "Tailwind CSS"],
        matchWeight: 92,
        description: "Develop responsive interfaces, integrate RESTful APIs, and improve client performance.",
      },
      {
        id: "opp-2",
        title: "Junior Full Stack Developer",
        company: "Apex Cloud Labs",
        location: "Remote",
        type: "Full-time",
        salary: "₹6.5 - ₹8.5 LPA",
        skills: ["Node.js", "React", "PostgreSQL", "Prisma"],
        matchWeight: 88,
        description: "Build robust route handlers, database models, and modern frontend application dashboards.",
      },
      {
        id: "opp-3",
        title: "AI & Data Solutions Intern",
        company: "Cognitive Nexus",
        location: "Hyderabad, On-site",
        type: "Internship",
        salary: "₹30,000 / mo",
        skills: ["Python", "Machine Learning", "FastAPI"],
        matchWeight: 84,
        description: "Fine-tune models, design vector retrieval workflows, and evaluate automated pipelines.",
      },
    ]);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, company, location, type, salary, skills, description } = body;

    const skillsString = Array.isArray(skills)
      ? JSON.stringify(skills)
      : typeof skills === "string"
      ? skills
      : "[]";

    const newJob = await prisma.opportunity.create({
      data: {
        title: title || "Software Engineer",
        company: company || "Hiring Partner",
        location: location || "Remote",
        type: type || "Full-time",
        salary: salary || "Competitive",
        skills: skillsString,
        description: description || "Join our engineering team.",
        matchWeight: 90,
      },
    });

    return NextResponse.json({
      success: true,
      opportunity: {
        ...newJob,
        skills: Array.isArray(skills) ? skills : [skillsString],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
