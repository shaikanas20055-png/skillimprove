import { useEffect, useState } from "react";

export const SHORTLIST_EVENT = "skillimprove-shortlist-updated";
export const SHORTLIST_STORAGE_KEY = "skillimprove-shortlisted-candidates";

export type ShortlistedCandidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  college: string;
  match: number;
  readiness: number;
  skills: string[];
  status: "Shortlisted" | "Interview" | "Selected" | "Recruited";
  shortlistedDate: string;
  internships?: number;
  resumeFileName?: string;
  phone?: string;
};

// Seed initial shortlisted candidates so recruiter has immediate data to export or contact
export const defaultShortlistedCandidates: ShortlistedCandidate[] = [
  {
    id: "shortlist-alex",
    name: "Alex Johnson",
    email: "alex.johnson@student.apex.edu",
    role: "Frontend Developer Intern",
    company: "TechNova Solutions",
    college: "Apex Institute of Technology",
    match: 92,
    readiness: 84,
    skills: ["React", "JavaScript", "TypeScript", "Python"],
    status: "Shortlisted",
    shortlistedDate: "2026-10-08",
    internships: 1,
    resumeFileName: "Alex_Johnson_Resume.pdf",
    phone: "+91 98765 43210",
  },
  {
    id: "shortlist-priya",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Software Engineering Intern",
    company: "TechNova Solutions",
    college: "National Engineering Institute",
    match: 94,
    readiness: 91,
    skills: ["Java", "Spring Boot", "SQL", "React"],
    status: "Shortlisted",
    shortlistedDate: "2026-10-07",
    internships: 2,
    resumeFileName: "Priya_Sharma_Resume.pdf",
    phone: "+91 98451 22334",
  },
  {
    id: "shortlist-maya",
    name: "Maya Patel",
    email: "maya.patel@state.edu",
    role: "Junior React Developer",
    company: "TechNova Solutions",
    college: "State College of Engineering",
    match: 91,
    readiness: 88,
    skills: ["React", "Python", "AI/ML", "Cloud"],
    status: "Shortlisted",
    shortlistedDate: "2026-10-06",
    internships: 2,
    resumeFileName: "Maya_Patel_Resume.pdf",
    phone: "+91 97321 88410",
  },
  {
    id: "shortlist-rahul",
    name: "Rahul Verma",
    email: "rahul.verma@cut.edu",
    role: "Full Stack Intern",
    company: "TechNova Solutions",
    college: "City University of Technology",
    match: 87,
    readiness: 79,
    skills: ["React", "Node.js", "MongoDB", "Express"],
    status: "Shortlisted",
    shortlistedDate: "2026-10-05",
    internships: 1,
    resumeFileName: "Rahul_Verma_Resume.pdf",
    phone: "+91 99120 55432",
  },
];

// Helper to look up candidate default email by name
export const candidateEmailDirectory: Record<string, string> = {
  "Alex Johnson": "alex.johnson@student.apex.edu",
  "Priya Sharma": "priya.sharma@example.com",
  "Maya Patel": "maya.patel@state.edu",
  "Rahul Verma": "rahul.verma@cut.edu",
  "Sara Khan": "sara.khan@tech.edu",
  "Vikram Rao": "vikram.rao@apex.edu",
  "Ananya Sen": "ananya.sen@apex.edu",
  "Rohan Gupta": "rohan.gupta@apex.edu",
};

export function getShortlistedCandidates(): ShortlistedCandidate[] {
  try {
    const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!raw) return defaultShortlistedCandidates;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultShortlistedCandidates;
  } catch {
    return defaultShortlistedCandidates;
  }
}

export function saveShortlistedCandidates(list: ShortlistedCandidate[]) {
  try {
    localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(SHORTLIST_EVENT));
  } catch (err) {
    console.error("Failed to persist shortlisted candidates", err);
  }
}

export function isCandidateShortlisted(name: string): boolean {
  const list = getShortlistedCandidates();
  return list.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
}

export function toggleShortlistCandidate(candidate: {
  name: string;
  email?: string;
  role?: string;
  college?: string;
  company?: string;
  match?: number;
  readiness?: number;
  skills?: string[];
  resumeFileName?: string;
}): boolean {
  const list = getShortlistedCandidates();
  const existingIdx = list.findIndex(
    (c) => c.name.toLowerCase() === candidate.name.trim().toLowerCase()
  );

  if (existingIdx >= 0) {
    // Remove from shortlist
    const next = list.filter((_, idx) => idx !== existingIdx);
    saveShortlistedCandidates(next);
    return false; // Not shortlisted anymore
  }

  // Add to shortlist
  const newCandidate: ShortlistedCandidate = {
    id: `shortlist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: candidate.name,
    email:
      candidate.email ||
      candidateEmailDirectory[candidate.name] ||
      `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@student.apex.edu`,
    role: candidate.role || "Frontend Developer Intern",
    company: candidate.company || "TechNova Solutions",
    college: candidate.college || "Apex Institute of Technology",
    match: candidate.match || 90,
    readiness: candidate.readiness || 84,
    skills: candidate.skills || ["React", "JavaScript", "Python"],
    status: "Shortlisted",
    shortlistedDate: new Date().toISOString().split("T")[0],
    resumeFileName: candidate.resumeFileName || `${candidate.name.replace(/\s+/g, "_")}_Resume.pdf`,
  };

  saveShortlistedCandidates([newCandidate, ...list]);
  return true; // Now shortlisted
}

export function removeShortlistCandidate(nameOrId: string) {
  const list = getShortlistedCandidates();
  const next = list.filter(
    (c) => c.id !== nameOrId && c.name.toLowerCase() !== nameOrId.trim().toLowerCase()
  );
  saveShortlistedCandidates(next);
}

export function useShortlistedCandidates() {
  const [shortlisted, setShortlisted] = useState<ShortlistedCandidate[]>(getShortlistedCandidates);

  useEffect(() => {
    const handleUpdate = () => {
      setShortlisted(getShortlistedCandidates());
    };
    window.addEventListener(SHORTLIST_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    shortlisted,
    count: shortlisted.length,
    toggleShortlist: (cand: Parameters<typeof toggleShortlistCandidate>[0]) =>
      toggleShortlistCandidate(cand),
    removeShortlist: (id: string) => removeShortlistCandidate(id),
    isShortlisted: (name: string) => isCandidateShortlisted(name),
  };
}

/**
 * Downloads shortlisted candidate roster as an Excel-compatible spreadsheet.
 * Formatted with UTF-8 BOM so Microsoft Excel, Numbers, and Google Sheets
 * open candidate names, email IDs, and details directly in table columns.
 */
export function exportShortlistedCandidatesToExcel(candidatesToExport?: ShortlistedCandidate[]) {
  const list =
    candidatesToExport && candidatesToExport.length > 0
      ? candidatesToExport
      : getShortlistedCandidates();

  if (list.length === 0) {
    alert("No candidates in the shortlist yet. Please shortlist candidates first.");
    return false;
  }

  const headers = [
    "Candidate Name",
    "Email ID",
    "Applied / Matched Role",
    "College / University",
    "Match Score (%)",
    "Readiness Score (%)",
    "Key Skills",
    "Recruitment Status",
    "Shortlisted Date",
  ];

  const escapeCSV = (val: unknown) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = list.map((c) =>
    [
      escapeCSV(c.name),
      escapeCSV(c.email || candidateEmailDirectory[c.name] || "student@skillimprove.com"),
      escapeCSV(c.role || "Software Engineering"),
      escapeCSV(c.college || "Apex Institute of Technology"),
      escapeCSV(`${c.match}%`),
      escapeCSV(`${c.readiness}%`),
      escapeCSV((c.skills || []).join(", ")),
      escapeCSV(c.status || "Shortlisted"),
      escapeCSV(c.shortlistedDate || "2026-10-09"),
    ].join(",")
  );

  // UTF-8 BOM (\uFEFF) ensures Excel opens multilingual characters & text columns cleanly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const today = new Date().toISOString().split("T")[0];
  anchor.download = `SkillImprove_Shortlisted_Candidates_${today}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}

export type OfferEmailPayload = {
  targetEmail: string;
  candidateName: string;
  candidateEmail: string;
  subject: string;
  body: string;
  mailtoUrl: string;
  gmailUrl: string;
};

/**
 * Prepares and triggers direct email redirect to shaikanas20055@gmail
 * with official employment message stating that candidate has been recruited as employee.
 */
export function sendEmployeeRecruitmentOffer(candidate: {
  name: string;
  email?: string;
  role?: string;
  college?: string;
  company?: string;
  match?: number;
  readiness?: number;
}): OfferEmailPayload {
  // Required target recruiter email as specified by user
  const targetEmail = "shaikanas20055@gmail";
  const candidateName = candidate.name.trim();
  const candidateEmail =
    candidate.email ||
    candidateEmailDirectory[candidateName] ||
    `${candidateName.toLowerCase().replace(/\s+/g, ".")}@student.apex.edu`;
  const company = candidate.company || "TechNova Solutions";
  const role = candidate.role || "Frontend Developer Intern";
  const college = candidate.college || "Apex Institute of Technology";
  const match = candidate.match || 92;
  const readiness = candidate.readiness || 84;

  const subject = `Official Job Offer: Congratulations ${candidateName}, You Have Been Recruited by ${company}!`;

  const body = `Dear ${candidateName},

CONGRATULATIONS!

We are thrilled to officially inform you that you have been SELECTED and RECRUITED as an employee at ${company} through the SkillImprove Talent Network.

RECRUITMENT & CANDIDATE DETAILS:
=====================================================
• Candidate Name: ${candidateName}
• Candidate Email: ${candidateEmail}
• Designated Position: ${role}
• Hiring Organization: ${company}
• Academic Institution: ${college}
• AI Role Match Score: ${match}%
• Industry Readiness Score: ${readiness}%
• Verification Status: Verified Industry Ready via SkillImprove
=====================================================

OFFICIAL APPOINTMENT NOTICE:
Following a comprehensive review of your verified technical skill credentials, practical projects, assessment performance, and shortlist profile, our Hiring Committee has approved your selection as an employee.

NEXT STEPS FOR ONBOARDING:
1. Please reply to this email to acknowledge receipt and confirm your formal acceptance.
2. Our People Operations / HR Team will follow up with your formal offer agreement, appointment letter, compensation package, joining date, and documentation formalities.

We look forward to welcoming you to the ${company} engineering and product team!

Warm regards,

Hiring & Talent Acquisition Team
${company}
Recruiter Email: ${targetEmail}
SkillImprove Enterprise Platform — https://skillimprove.edu
`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const mailtoUrl = `mailto:${targetEmail}?subject=${encodedSubject}&body=${encodedBody}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodedSubject}&body=${encodedBody}`;

  // Execute direct redirection to the user's email client
  try {
    window.location.href = mailtoUrl;
  } catch (err) {
    console.warn("Direct mailto redirect triggered", err);
  }

  return {
    targetEmail,
    candidateName,
    candidateEmail,
    subject,
    body,
    mailtoUrl,
    gmailUrl,
  };
}
