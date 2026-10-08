// Real-time Resume Analysis & Authenticity Evaluator
export type ResumeAnalysisResult = {
  isRealResume: boolean;
  score: number;
  authenticityRating: "Verified Authentic Resume" | "Partial / Missing Sections" | "Unverified / Non-Technical Document";
  detectedSkills: string[];
  detectedProjects: string[];
  detectedLinks: string[];
  detectedCerts: string[];
  detectedExperience: string[];
  contactInfoFound: { email?: string; phone?: string; linkedin?: string; github?: string };
  strengths: string[];
  improvements: string[];
  verdict: string;
};

// Skills Dictionary: All programming, frameworks, tools, database, cloud,
// and core engineering/professional skills are treated as the same "Skills / Technical Skills" category.
const SKILLS_DICTIONARY = [
  "React", "JavaScript", "TypeScript", "Python", "Node.js", "Express", "SQL",
  "PostgreSQL", "MongoDB", "MySQL", "HTML", "CSS", "Tailwind", "Git", "GitHub",
  "Docker", "AWS", "Java", "C++", "C#", "C", "Next.js", "Redux", "Linux", "CI/CD",
  "REST", "REST APIs", "GraphQL", "Kubernetes", "Django", "FastAPI", "Flask", "Vue", "Angular",
  "Jest", "Cypress", "Machine Learning", "AI", "Cloud", "Pandas", "NumPy", "TensorFlow",
  "Data Structures", "Algorithms", "System Design", "Object-Oriented Programming", "OOP",
  "Agile", "Scrum", "Testing", "Unit Testing", "DevOps", "Problem Solving", "Communication",
  "Microservices", "Redis", "Firebase", "Spring Boot", "PHP", "Kotlin", "Swift"
];

const CERTIFICATIONS_DICTIONARY = [
  "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Meta", "Coursera",
  "Udemy", "HackerRank", "LeetCode", "Oracle", "CompTIA", "Cisco", "Certified",
  "Kubernetes Administrator", "Scrum Master", "Developer Associate", "Cloud Practitioner"
];

export async function evaluateResumeFile(file: File): Promise<ResumeAnalysisResult> {
  const text = await extractTextFromFile(file);
  return evaluateResumeText(text, file.name);
}

function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If it's a text/markdown file, read directly
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        // Binary buffer (PDF, DOC) - extract ASCII strings
        const bytes = new Uint8Array(result as ArrayBuffer);
        let extracted = "";
        for (let i = 0; i < bytes.length; i++) {
          const charCode = bytes[i];
          if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
            extracted += String.fromCharCode(charCode);
          }
        }
        resolve(extracted);
      }
    };
    reader.onerror = () => resolve("");

    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      // Read array buffer to scan for readable strings in PDF/DOCX
      reader.readAsArrayBuffer(file);
    }
  });
}

export function evaluateResumeText(rawText: string, fileName: string = ""): ResumeAnalysisResult {
  const text = rawText.toLowerCase();
  const rawClean = rawText.replace(/\s+/g, " ");

  // 1. Detect Email & Phone
  const emailMatch = rawClean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawClean.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  // 2. Detect GitHub, LinkedIn, Portfolio links
  const detectedLinks: string[] = [];
  const githubMatches = rawClean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/gi);
  if (githubMatches) detectedLinks.push(...Array.from(new Set(githubMatches)));

  const linkedinMatches = rawClean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+/gi);
  if (linkedinMatches) detectedLinks.push(...Array.from(new Set(linkedinMatches)));

  const portfolioMatches = rawClean.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]+\.(?:dev|me|io|app|tech)/gi);
  if (portfolioMatches) detectedLinks.push(...Array.from(new Set(portfolioMatches)));

  // Fallback check if text has "github" or "linkedin" keyword
  if (detectedLinks.length === 0) {
    if (text.includes("github")) detectedLinks.push("GitHub Profile mentioned");
    if (text.includes("linkedin")) detectedLinks.push("LinkedIn Profile mentioned");
  }

  // 3. Detect Skills / Technical Skills (Considered Exactly the Same)
  // Whether listed under "Skills", "Technical Skills", "Key Skills", or inline:
  const detectedSkillsSet = new Set<string>();

  // A. Scan dictionary
  SKILLS_DICTIONARY.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(rawText)) {
      detectedSkillsSet.add(skill);
    }
  });

  // B. Section Parser: Treat "SKILLS" and "TECHNICAL SKILLS" identically
  const skillsSectionRegex = /(?:technical\s+skills?|skills?|key\s+skills?|core\s+skills?|programming\s+skills?|competencies|proficiencies)[\s:]*([^\n\r]+)/gi;
  let sectionMatch: RegExpExecArray | null;
  while ((sectionMatch = skillsSectionRegex.exec(rawText)) !== null) {
    const sectionContent = sectionMatch[1];
    const items = sectionContent.split(/[,|•·;\t/]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
    items.forEach(item => {
      // Clean up punctuation
      const cleanItem = item.replace(/^[-*•\s]+/, "").trim();
      if (cleanItem && !/^(and|or|etc|with|in)$/i.test(cleanItem)) {
        // Find existing match or add capitalized
        const match = SKILLS_DICTIONARY.find(d => d.toLowerCase() === cleanItem.toLowerCase());
        detectedSkillsSet.add(match || (cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)));
      }
    });
  }

  const detectedSkills = Array.from(detectedSkillsSet);

  // 4. Detect Projects
  const detectedProjects: string[] = [];
  const projectKeywords = ["project", "built", "developed", "created", "designed", "implemented", "application", "full-stack"];
  let projectMentions = 0;
  projectKeywords.forEach((kw) => {
    const matches = text.match(new RegExp(`\\b${kw}\\b`, "g"));
    if (matches) projectMentions += matches.length;
  });

  // Look for project section lines
  const lines = rawText.split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      (trimmed.toLowerCase().includes("project") || trimmed.toLowerCase().includes("system") || trimmed.toLowerCase().includes("platform") || trimmed.toLowerCase().includes("app")) &&
      trimmed.length > 5 &&
      trimmed.length < 80 &&
      !trimmed.includes("http")
    ) {
      if (detectedProjects.length < 4 && !detectedProjects.includes(trimmed)) {
        detectedProjects.push(trimmed);
      }
    }
  });

  // 5. Detect Certifications
  const detectedCerts: string[] = [];
  CERTIFICATIONS_DICTIONARY.forEach((cert) => {
    const regex = new RegExp(`\\b${cert}\\b`, "i");
    if (regex.test(rawText)) {
      if (!detectedCerts.includes(cert)) detectedCerts.push(cert);
    }
  });

  // 6. Detect Experience (Optional)
  const detectedExperience: string[] = [];
  const expKeywords = ["intern", "internship", "software engineer", "developer", "experience", "work history", "freelance"];
  expKeywords.forEach((exp) => {
    if (text.includes(exp)) {
      detectedExperience.push(exp.charAt(0).toUpperCase() + exp.slice(1));
    }
  });

  // 7. Calculate Realness & Scoring
  const wordCount = rawClean.split(" ").filter(Boolean).length;
  const hasContact = Boolean(emailMatch || phoneMatch);
  const hasSkills = detectedSkills.length > 0;
  const hasProjects = detectedProjects.length > 0 || projectMentions >= 2;
  const hasLinks = detectedLinks.length > 0;

  // Realness criteria: Needs reasonable text length, technical skills, and either contact info or projects/links
  const isRealResume = (wordCount >= 25 && hasSkills && (hasContact || hasProjects || hasLinks)) ||
    (fileName.toLowerCase().includes("resume") && (hasSkills || hasProjects) && wordCount > 20);

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (!isRealResume) {
    score = Math.min(35, Math.max(15, detectedSkills.length * 5 + (hasContact ? 10 : 0)));
    return {
      isRealResume: false,
      score,
      authenticityRating: "Unverified / Non-Technical Document",
      detectedSkills,
      detectedProjects,
      detectedLinks,
      detectedCerts,
      detectedExperience,
      contactInfoFound: {
        email: emailMatch?.[0],
        phone: phoneMatch?.[0],
      },
      strengths: detectedSkills.length > 0 ? [`Identified ${detectedSkills.length} skill(s) (Skills & Technical Skills treated equally)`] : [],
      improvements: [
        "Document is missing standard resume sections",
        "Add contact details (Email, Phone)",
        "Include project descriptions with GitHub links",
        "List verified skills or technical skills (React, Python, SQL, etc.)",
      ],
      verdict: "Document does not appear to be an authentic technical resume. No verified projects, technical experience, or repository links found.",
    };
  }

  // --- Real Resume Weighted Scoring Calculation ---
  // A. Skills / Technical Skills (Considered Exactly the Same - up to 35 points)
  const skillsScore = Math.min(35, Math.round(detectedSkills.length * 5.5));
  score += skillsScore;
  if (detectedSkills.length >= 4) {
    strengths.push(`Rich skills / technical skills verified (${detectedSkills.slice(0, 6).join(", ")})`);
  } else {
    improvements.push("Expand skills / technical skills section with relevant frameworks, tools, or libraries");
  }

  // B. Projects Evidence (up to 25 points)
  const projectsScore = Math.min(25, Math.round(projectMentions * 4 + (detectedProjects.length * 6)));
  score += projectsScore;
  if (projectsScore >= 18) {
    strengths.push("Detailed project work and technical execution found");
  } else {
    improvements.push("Detail at least 2 full-stack projects with problem, tech stack, and outcomes");
  }

  // C. GitHub & Portfolio Links (up to 15 points)
  if (detectedLinks.length > 0) {
    score += 15;
    strengths.push(`Verified code repository / professional link (${detectedLinks[0]})`);
  } else {
    improvements.push("Add a live GitHub profile or portfolio link to verify code evidence");
  }

  // D. Relevant Certifications (up to 15 points)
  if (detectedCerts.length > 0) {
    const certScore = Math.min(15, detectedCerts.length * 7);
    score += certScore;
    strengths.push(`Industry certifications recognized (${detectedCerts.join(", ")})`);
  } else {
    improvements.push("Add recognized certifications (e.g. AWS, Meta, HackerRank) to boost credibility");
  }

  // E. Experience / Internships (Optional Bonus - up to 10 points)
  if (detectedExperience.length > 0) {
    score += 10;
    strengths.push("Includes internship or developer role experience");
  }

  // Final score clamping between 40 and 98
  score = Math.min(98, Math.max(42, score));

  const rating =
    score >= 80
      ? "Verified Authentic Resume"
      : score >= 60
      ? "Partial / Missing Sections"
      : "Unverified / Non-Technical Document";

  const verdict =
    score >= 80
      ? "Resume is verified, technical, and well-structured with strong skill and project evidence."
      : "Resume contains technical elements, but adding GitHub links and specific project outcomes will improve your score.";

  return {
    isRealResume: true,
    score,
    authenticityRating: rating,
    detectedSkills,
    detectedProjects,
    detectedLinks,
    detectedCerts,
    detectedExperience,
    contactInfoFound: {
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
      github: githubMatches?.[0],
      linkedin: linkedinMatches?.[0],
    },
    strengths,
    improvements,
    verdict,
  };
}
