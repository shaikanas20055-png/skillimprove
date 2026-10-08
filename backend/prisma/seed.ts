import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SkillImprove SQLite database...");

  // Clean existing data
  await prisma.application.deleteMany();
  await prisma.assessmentSubmission.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Sample Users
  const alex = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      password: passwordHash,
      role: "STUDENT",
      profile: {
        create: {
          headline: "Aspiring Full Stack Engineer & Computer Science Senior",
          bio: "Focused on React, TypeScript, and distributed systems. Passionate about building verifiable skills.",
          college: "Global Institute of Technology",
          graduationYear: 2026,
          readinessScore: 82,
          matchAverage: 92,
          internshipsDone: 1,
        },
      },
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: passwordHash,
      role: "STUDENT",
      profile: {
        create: {
          headline: "Cloud & Full Stack Specialist",
          college: "Apex Engineering College",
          graduationYear: 2025,
          readinessScore: 91,
          matchAverage: 94,
          internshipsDone: 2,
        },
      },
    },
  });

  const recruiter = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "recruiter@veloce.io",
      password: passwordHash,
      role: "RECRUITER",
    },
  });

  // 2. Create Skills
  const reactSkill = await prisma.skill.create({
    data: { name: "React", category: "TECHNICAL", description: "Component architecture, hooks, and virtual DOM" },
  });
  const jsSkill = await prisma.skill.create({
    data: { name: "JavaScript", category: "TECHNICAL", description: "ES6+, event loop, asynchronous promises" },
  });
  const pySkill = await prisma.skill.create({
    data: { name: "Python", category: "TECHNICAL", description: "Backend development, scripting, data manipulation" },
  });
  const sqlSkill = await prisma.skill.create({
    data: { name: "SQL", category: "TECHNICAL", description: "Relational queries, indexes, normalization" },
  });
  const commSkill = await prisma.skill.create({
    data: { name: "Communication", category: "SOFT", description: "Cross-functional teamwork and technical clarity" },
  });

  // Link Skills to Alex
  await prisma.userSkill.createMany({
    data: [
      { userId: alex.id, skillId: reactSkill.id, score: 88, isVerified: true, level: "ADVANCED" },
      { userId: alex.id, skillId: jsSkill.id, score: 85, isVerified: true, level: "ADVANCED" },
      { userId: alex.id, skillId: pySkill.id, score: 76, isVerified: false, level: "INTERMEDIATE" },
      { userId: alex.id, skillId: commSkill.id, score: 92, isVerified: true, level: "EXPERT" },
    ],
  });

  // 3. Create Assessments
  const assessment1 = await prisma.assessment.create({
    data: {
      title: "React & Modern Web Architecture",
      category: "Programming",
      durationMinutes: 25,
      passingScore: 70,
      questions: {
        create: [
          {
            prompt: "What is the primary benefit of the React `useCallback` hook?",
            options: JSON.stringify(["Caches the return value of a pure calculation", "Memoizes a callback function definition between renders", "Executes an effect on every browser frame", "Directly mutates DOM elements"]),
            correctIndex: 1,
            explanation: "useCallback caches function definitions to prevent unnecessary child re-renders.",
          },
          {
            prompt: "How does React 19 handle server-rendered actions?",
            options: JSON.stringify(["Requires third-party Redux bindings", "Natively through Server Actions with useActionState & form handling", "Only through raw XMLHttpRequest calls", "Server Actions are deprecated in React 19"]),
            correctIndex: 1,
            explanation: "React 19 introduces native Server Actions and useActionState for asynchronous transitions.",
          },
        ],
      },
    },
  });

  // 4. Create Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      title: "Frontend Engineering Intern",
      company: "Veloce Technologies",
      location: "Bengaluru, Hybrid",
      type: "Internship",
      salary: "₹30,000 / mo",
      skills: JSON.stringify(["React", "JavaScript", "TypeScript"]),
      description: "Build clean user experiences, test core flows, and collaborate directly with product engineers.",
      matchWeight: 92,
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      title: "Junior Full Stack Developer",
      company: "Apex Cloud Labs",
      location: "Remote",
      type: "Full-time",
      salary: "₹7.5 LPA",
      skills: JSON.stringify(["React", "Node.js", "PostgreSQL", "Prisma"]),
      description: "Design relational database schemas, RESTful route handlers, and performant user interfaces.",
      matchWeight: 88,
    },
  });

  // 5. Create an Application for Alex
  await prisma.application.create({
    data: {
      userId: alex.id,
      opportunityId: opp1.id,
      matchScore: 92,
      status: "APPLIED",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
