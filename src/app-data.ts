import { useEffect, useState } from "react";

export const DATA_EVENT = "skillimprove-data-updated";

export function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveStored(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(DATA_EVENT));
}

export function useStudentName() {
  const readName = () => {
    const profile = readStored<{ name?: string }>("skillimprove-profile", {});
    return typeof profile.name === "string" && profile.name.trim() ? profile.name : "Alex Johnson";
  };
  const [name, setName] = useState(readName);
  useEffect(() => {
    const update = () => setName(readName());
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return name;
}

export type Application = {
  id: string;
  company: string;
  title: string;
  date: string;
  match: number;
  status: string;
  studentName?: string;
  studentEmail?: string;
  studentCollege?: string;
  readiness?: number;
  experience?: string;
  resumeFileName?: string;
  resumeScore?: number;
  skills?: string[];
  collegeVerified?: boolean;
};

export const APPLICATIONS_KEY = "skillimprove-applications";

export type Notice = {
  id: string;
  title: string;
  detail: string;
  path: string;
  read: boolean;
};

export const noticeKey = (role: string) => `skillimprove-notifications-${role}`;

export function getNotices(role: string): Notice[] {
  const seed: Record<string, Notice[]> = {
    student: [
      { id: "assessment", title: "Ready to prove a new skill?", detail: "Explore aptitude and programming assessments.", path: "assessment", read: false },
      { id: "jobs", title: "New opportunities match your skills", detail: "Explore internships and roles with explainable matches.", path: "jobs", read: false },
      { id: "learning", title: "Your learning roadmap is ready", detail: "Close your testing and React skill gaps.", path: "learning", read: true },
    ],
    industry: [{ id: "candidates", title: "New candidates to review", detail: "Discover students with verified skill evidence.", path: "candidates", read: false }],
    college: [{ id: "training", title: "New training recommendation", detail: "Explore programs to close institutional skill gaps.", path: "training", read: false }],
  };
  return readStored(noticeKey(role), seed[role] || []);
}

export function addStudentNotice(notice: Omit<Notice, "read">) {
  const items = getNotices("student");
  saveStored(noticeKey("student"), [{ ...notice, read: false }, ...items.filter(item => item.id !== notice.id)]);
}

export function addIndustryNotice(notice: Omit<Notice, "read">) {
  const items = getNotices("industry");
  saveStored(noticeKey("industry"), [{ ...notice, read: false }, ...items.filter(item => item.id !== notice.id)]);
}

export function downloadStudentResume(studentName = "Alex Johnson", fileName?: string) {
  const actualFileName = fileName || `${studentName.replace(/\s+/g, "_")}_Resume.pdf`;
  const resumeText = `=====================================================
${studentName.toUpperCase()} — TECHNICAL RESUME
=====================================================
Email: ${studentName.toLowerCase().replace(/\s+/g, ".")}@student.apex.edu
Phone: +91 98765 43210
Location: Bengaluru, India
GitHub: https://github.com/${studentName.toLowerCase().replace(/\s+/g, "")}-dev
LinkedIn: https://linkedin.com/in/${studentName.toLowerCase().replace(/\s+/g, "")}

EDUCATION:
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology, Bengaluru | 2021 – 2025 | CGPA: 8.9 / 10

TECHNICAL SKILLS & COMPETENCIES:
• Programming Languages: JavaScript (ES6+), TypeScript, Python, SQL, C++
• Frontend: React, Next.js, Redux, HTML5, CSS3, Tailwind CSS
• Backend & Databases: Node.js, Express, PostgreSQL, MongoDB, REST APIs
• Tools & DevOps: Git, GitHub, Docker, AWS (S3, EC2), CI/CD, Linux
• Core Engineering: Data Structures & Algorithms, OOP, System Design, Unit Testing (Jest)

COLLEGE VERIFIED PROJECTS:
1. SkillImprove Web Platform (React, TypeScript, CSS)
   • Verified by: Apex Institute of Technology Placement Cell
   • Real-time technical skill gap analysis, portfolio evidence verification, and AI-driven match scoring.
   • Repository: https://github.com/alexjohnson-dev/skillimprove

2. CampusConnect Student Portal (Node.js, PostgreSQL, Express)
   • Verified by: Department of Computer Science & Engineering
   • Multi-role university platform with role-based authentication, project submission workflows, and announcements.
   • Repository: https://github.com/alexjohnson-dev/campusconnect

CERTIFICATIONS:
• Meta Certified Frontend Developer Professional Certificate (Coursera)
• HackerRank Certified Problem Solving (Advanced)
• Python for Everybody Specialization (Coursera)

WORK EXPERIENCE / INTERNSHIP:
• Software Engineering Intern | TechStart Labs, Bengaluru (May 2024 – Jul 2024)
  - Developed and tested reusable React UI components with responsive layouts.
  - Reduced page load times by 28% through code splitting and memoization.
=====================================================`;

  const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = actualFileName.endsWith(".pdf") ? actualFileName.replace(/\.pdf$/, ".txt") : actualFileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// Shared Student Projects (Across Student, College & Industry)
// -------------------------------------------------------------
export type StudentProject = {
  id: string;
  studentName: string;
  studentEmail?: string;
  college?: string;
  title: string;
  detail: string;
  tags: string[];
  githubUrl?: string;
  fileName?: string;
  fileSize?: string;
  status: "verified" | "pending";
  verifiedBy?: string;
  verifiedAt?: string;
  submittedAt: string;
};

export const PROJECTS_KEY = "skillimprove-projects";

export const initialProjects: StudentProject[] = [
  {
    id: "proj-1",
    studentName: "Alex Johnson",
    studentEmail: "student@skillimprove.com",
    college: "ABC Institute of Technology",
    title: "AI-Based Student Career Recommendation System",
    detail: "Full-stack career analytics platform that models student competencies, predicts skill match percentages, and automates learning roadmaps.",
    tags: ["React", "Node.js", "Python", "Machine Learning"],
    githubUrl: "https://github.com/alexj/ai-career-advisor",
    fileName: "architecture_diagram.pdf",
    fileSize: "2.4 MB",
    status: "verified",
    verifiedBy: "ABC Institute of Technology",
    verifiedAt: "2 days ago",
    submittedAt: "1 week ago",
  },
  {
    id: "proj-2",
    studentName: "Alex Johnson",
    studentEmail: "student@skillimprove.com",
    college: "ABC Institute of Technology",
    title: "E-Commerce Microservices Platform",
    detail: "Event-driven checkout and inventory microservice suite with JWT auth, Redis caching, and automated Docker compose pipeline.",
    tags: ["Node.js", "PostgreSQL", "Docker", "Redis"],
    githubUrl: "https://github.com/alexj/micro-storefront",
    fileName: "benchmark_report.pdf",
    fileSize: "1.8 MB",
    status: "verified",
    verifiedBy: "ABC Institute of Technology",
    verifiedAt: "3 days ago",
    submittedAt: "2 weeks ago",
  },
  {
    id: "proj-3",
    studentName: "Priya Sharma",
    studentEmail: "priya.sharma@example.com",
    college: "ABC Institute of Technology",
    title: "Cloud Native Distributed File Synchronizer",
    detail: "High-throughput cloud storage engine utilizing Go and AWS S3 with concurrent multi-part uploads.",
    tags: ["Go", "AWS", "Docker", "Cloud"],
    githubUrl: "https://github.com/priyasharma/cloud-sync",
    status: "verified",
    verifiedBy: "ABC Institute of Technology",
    verifiedAt: "Yesterday",
    submittedAt: "3 days ago",
  },
  {
    id: "proj-4",
    studentName: "Alex Johnson",
    studentEmail: "student@skillimprove.com",
    college: "ABC Institute of Technology",
    title: "Distributed Task Scheduler & Queue",
    detail: "High-concurrency task processing daemon using TypeScript and WebSockets with visual latency telemetry.",
    tags: ["TypeScript", "WebSockets", "SQL"],
    githubUrl: "https://github.com/alexj/task-scheduler-engine",
    fileName: "test_suite_coverage.zip",
    fileSize: "4.1 MB",
    status: "pending",
    submittedAt: "Just now",
  },
];

export function getProjects(): StudentProject[] {
  return readStored<StudentProject[]>(PROJECTS_KEY, initialProjects);
}

export function addStudentProject(project: Omit<StudentProject, "id" | "submittedAt" | "status">) {
  const current = getProjects();
  const newProj: StudentProject = {
    ...project,
    id: `proj-${Date.now()}`,
    status: "pending",
    submittedAt: "Just now",
  };
  saveStored(PROJECTS_KEY, [newProj, ...current]);
  return newProj;
}

export function verifyStudentProject(projectId: string, verifiedBy: string = "ABC Institute of Technology") {
  const current = getProjects();
  const updated = current.map((p) => {
    if (p.id === projectId) {
      return {
        ...p,
        status: "verified" as const,
        verifiedBy,
        verifiedAt: "Just now",
      };
    }
    return p;
  });
  saveStored(PROJECTS_KEY, updated);

  // Boost student readiness in profile
  const profile = readStored<{ readinessScore?: number }>("skillimprove-profile", {});
  const newScore = Math.min(100, (profile.readinessScore || 82) + 4);
  saveStored("skillimprove-profile", { ...profile, readinessScore: newScore });

  // Add notification to student
  addStudentNotice({
    id: `verify-${projectId}`,
    title: "Project verified by College!",
    detail: `Your project has been verified by ${verifiedBy}. Industry readiness increased to ${newScore}%.`,
    path: "profile",
  });
}

export function updateStudentProject(projectId: string, updates: Partial<StudentProject>) {
  const current = getProjects();
  const updated = current.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
  saveStored(PROJECTS_KEY, updated);
}

export function deleteStudentProject(projectId: string) {
  const current = getProjects();
  const updated = current.filter((p) => p.id !== projectId);
  saveStored(PROJECTS_KEY, updated);
}

export function useProjects() {
  const [projects, setProjects] = useState<StudentProject[]>(getProjects);
  useEffect(() => {
    const update = () => setProjects(getProjects());
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return projects;
}

// -------------------------------------------------------------
// Student Certificates
// -------------------------------------------------------------
export type StudentCertificate = {
  id: string;
  studentName?: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description: string;
  imageUrl?: string;
  fileName?: string;
  status: "verified" | "pending";
};

export const CERTIFICATES_KEY = "skillimprove-certificates";

export const initialCertificates: StudentCertificate[] = [
  {
    id: "cert-1",
    studentName: "Alex Johnson",
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    issueDate: "Aug 2024",
    credentialId: "AWS-CLF-0092834",
    credentialUrl: "https://aws.amazon.com/verification",
    description: "Demonstrated fundamental understanding of AWS Cloud concepts, security, architecture, pricing, and support models.",
    status: "verified",
  },
  {
    id: "cert-2",
    studentName: "Alex Johnson",
    title: "Meta Front-End Developer",
    issuer: "Meta",
    issueDate: "May 2024",
    credentialId: "META-FE-7729104",
    credentialUrl: "https://coursera.org/verify/meta-fe",
    description: "In-depth specialization covering modern React components, JavaScript ES6+, responsive styling, and web accessibility.",
    status: "verified",
  },
  {
    id: "cert-3",
    studentName: "Alex Johnson",
    title: "Python Programming Specialization",
    issuer: "University of Michigan",
    issueDate: "Jan 2024",
    credentialId: "UMICH-PY-448201",
    credentialUrl: "https://coursera.org/verify/python-spec",
    description: "Comprehensive mastery in core Python data structures, web data processing, SQLite integration, and RESTful APIs.",
    status: "verified",
  },
];

export function getCertificates(): StudentCertificate[] {
  return readStored<StudentCertificate[]>(CERTIFICATES_KEY, initialCertificates);
}

export function addStudentCertificate(cert: Omit<StudentCertificate, "id" | "status">) {
  const current = getCertificates();
  const newCert: StudentCertificate = {
    ...cert,
    id: `cert-${Date.now()}`,
    status: "verified",
  };
  saveStored(CERTIFICATES_KEY, [newCert, ...current]);
  return newCert;
}

export function updateStudentCertificate(certId: string, updates: Partial<StudentCertificate>) {
  const current = getCertificates();
  const updated = current.map((c) => (c.id === certId ? { ...c, ...updates } : c));
  saveStored(CERTIFICATES_KEY, updated);
}

export function deleteStudentCertificate(certId: string) {
  const current = getCertificates();
  const updated = current.filter((c) => c.id !== certId);
  saveStored(CERTIFICATES_KEY, updated);
}

export function useCertificates() {
  const [certs, setCerts] = useState<StudentCertificate[]>(getCertificates);
  useEffect(() => {
    const update = () => setCerts(getCertificates());
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return certs;
}


// -------------------------------------------------------------
// College Training Programs & Industry Connections
// -------------------------------------------------------------
export type CustomProgram = {
  id: string;
  title: string;
  skill: string;
  department: string;
  duration: string;
  targetStudents: number;
  expectedPoints: number;
  industryPartner?: string;
  createdAt: string;
};

export const PROGRAMS_KEY = "skillimprove-college-programs";

export const initialPrograms: CustomProgram[] = [
  {
    id: "prog-1",
    title: "Advanced React & Next.js Architecture",
    skill: "React",
    department: "Computer Science",
    duration: "4 weeks",
    targetStudents: 126,
    expectedPoints: 15,
    industryPartner: "TechNova Solutions",
    createdAt: "2 days ago",
  },
  {
    id: "prog-2",
    title: "Cloud Infrastructure & Containerization",
    skill: "Cloud",
    department: "Information Technology",
    duration: "6 weeks",
    targetStudents: 184,
    expectedPoints: 12,
    industryPartner: "CloudSphere",
    createdAt: "1 week ago",
  },
];

export function getPrograms(): CustomProgram[] {
  return readStored<CustomProgram[]>(PROGRAMS_KEY, initialPrograms);
}

export function addCustomProgram(program: Omit<CustomProgram, "id" | "createdAt">) {
  const current = getPrograms();
  const newProg: CustomProgram = {
    ...program,
    id: `prog-${Date.now()}`,
    createdAt: "Just now",
  };
  saveStored(PROGRAMS_KEY, [newProg, ...current]);
  return newProg;
}

export type IndustryConnection = {
  id: string;
  company: string;
  partnershipType: string;
  department: string;
  studentsInvolved: string;
  outcomes: string;
  status: "Active" | "Pending" | "Connected";
  contactEmail?: string;
};

export const CONNECTIONS_KEY = "skillimprove-college-connections";

export const initialConnections: IndustryConnection[] = [
  { id: "conn-1", company: "TechNova Solutions", partnershipType: "Internships + Training", department: "Computer Science", studentsInvolved: "128 students", outcomes: "32 internships", status: "Active" },
  { id: "conn-2", company: "GlobalSoft Technologies", partnershipType: "Hiring Partnership", department: "Information Technology", studentsInvolved: "84 students", outcomes: "18 placements", status: "Active" },
  { id: "conn-3", company: "CloudSphere Labs", partnershipType: "Cloud Academy", department: "All Departments", studentsInvolved: "96 students", outcomes: "4 programs", status: "Active" },
  { id: "conn-4", company: "BrightStack Systems", partnershipType: "Campus Hiring", department: "Electronics", studentsInvolved: "62 students", outcomes: "12 placements", status: "Pending" },
];

export function getConnections(): IndustryConnection[] {
  return readStored<IndustryConnection[]>(CONNECTIONS_KEY, initialConnections);
}

export function addConnection(conn: Omit<IndustryConnection, "id">) {
  const current = getConnections();
  const newConn: IndustryConnection = {
    ...conn,
    id: `conn-${Date.now()}`,
  };
  saveStored(CONNECTIONS_KEY, [newConn, ...current]);
  return newConn;
}

// -------------------------------------------------------------
// Shared Opportunities (Industry creates, Student views & applies)
// -------------------------------------------------------------
export type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  type: string;
  match: number;
  skills: string[];
  missing?: string;
  pay: string;
  duration: string;
  description: string;
  openings?: number;
  deadline?: string;
  createdAt?: string;
};

export const OPPORTUNITIES_KEY = "skillimprove-opportunities";

export const initialOpportunities: Opportunity[] = [
  { id: "pixel-frontend", title: "Frontend Developer Intern", company: "PixelCraft Labs", location: "Bengaluru", mode: "Hybrid", type: "Internship", match: 92, skills: ["React", "JavaScript", "Git"], missing: "Testing", pay: "₹20K – ₹30K / month", duration: "3 months", description: "Build accessible React interfaces with our product design team. Work on reusable components, improve performance and contribute to automated tests.", openings: 3, deadline: "2025-07-31", createdAt: "3 days ago" },
  { id: "technova-software", title: "Software Engineering Intern", company: "TechNova Solutions", location: "Pune", mode: "On-site", type: "Internship", match: 88, skills: ["Python", "SQL", "APIs"], missing: "Docker", pay: "₹25K / month", duration: "3 months", description: "Develop Python services, design SQL queries and help ship reliable APIs. Receive mentoring, code reviews and experience collaborating on a production product.", openings: 4, deadline: "2025-08-15", createdAt: "5 days ago" },
  { id: "cloud-fullstack", title: "Full Stack Developer Intern", company: "CloudSphere", location: "Remote", mode: "Remote", type: "Internship", match: 84, skills: ["React", "Node.js", "SQL"], missing: "TypeScript", pay: "₹30K / month", duration: "6 months", description: "Help build our cloud dashboard using React and Node.js. Connect user interfaces to REST APIs and learn deployment practices in a remote team.", openings: 2, deadline: "2025-07-20", createdAt: "1 week ago" },
  { id: "bright-react", title: "Junior React Developer", company: "BrightStack", location: "Hyderabad", mode: "Hybrid", type: "Full-time", match: 81, skills: ["React", "CSS", "Git"], missing: "Next.js", pay: "₹6L – ₹8L / year", duration: "Permanent", description: "Join an engineering team building modern commerce experiences. Own UI features, collaborate with designers and contribute to product quality.", openings: 2, deadline: "2025-08-30", createdAt: "2 weeks ago" },
];

export function getOpportunities(): Opportunity[] {
  return readStored<Opportunity[]>(OPPORTUNITIES_KEY, initialOpportunities);
}

export function addOpportunity(opp: Omit<Opportunity, "id">): Opportunity {
  const current = getOpportunities();
  const newOpp: Opportunity = {
    ...opp,
    id: `opp-${Date.now()}`,
    createdAt: "Just now",
  };
  saveStored(OPPORTUNITIES_KEY, [newOpp, ...current]);
  return newOpp;
}

export function useOpportunities(): Opportunity[] {
  const [list, setList] = useState<Opportunity[]>(getOpportunities);
  useEffect(() => {
    const update = () => setList(getOpportunities());
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return list;
}

