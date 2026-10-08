export type Candidate = {
  name: string;
  email: string;
  role?: string;
  college?: string;
  readiness: number;
  match: number;
  skills: string[];
  softSkills: string[];
  internships: number;
};

export const candidates: Candidate[] = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Software Engineering Intern",
    college: "National Engineering Institute",
    readiness: 91,
    match: 94,
    skills: ["React", "Node.js", "SQL", "JavaScript"],
    softSkills: ["Communication", "Teamwork", "Leadership"],
    internships: 2,
  },
  {
    name: "Alex Johnson",
    email: "alex.johnson@student.apex.edu",
    role: "Frontend Developer Intern",
    college: "Apex Institute of Technology",
    readiness: 82,
    match: 92,
    skills: ["React", "JavaScript", "Python"],
    softSkills: ["Communication", "Problem solving", "Teamwork"],
    internships: 1,
  },
  {
    name: "Maya Patel",
    email: "maya.patel@state.edu",
    role: "Junior React Developer",
    college: "State College of Engineering",
    readiness: 88,
    match: 91,
    skills: ["Python", "AI/ML", "Cloud"],
    softSkills: ["Critical thinking", "Problem solving", "Time management"],
    internships: 0,
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@cut.edu",
    role: "Full Stack Intern",
    college: "City University of Technology",
    readiness: 79,
    match: 87,
    skills: ["Java", "Spring", "SQL"],
    softSkills: ["Teamwork", "Problem solving", "Time management"],
    internships: 1,
  },
  {
    name: "Sara Khan",
    email: "sara.khan@tech.edu",
    role: "Frontend Specialist",
    college: "State College of Engineering",
    readiness: 85,
    match: 89,
    skills: ["React", "TypeScript", "AWS", "JavaScript"],
    softSkills: ["Communication", "Leadership", "Time management"],
    internships: 2,
  },
  {
    name: "Vikram Rao",
    email: "vikram.rao@apex.edu",
    role: "Backend Python Engineer",
    college: "Apex Institute of Technology",
    readiness: 76,
    match: 84,
    skills: ["Python", "Django", "Docker"],
    softSkills: ["Critical thinking", "Teamwork", "Problem solving"],
    internships: 0,
  },
];

export type CandidateFilters = {
  skills: string[];
  softSkills: string[];
  experience: string;
  minimumReadiness: number;
};

export function filterCandidates(filters: CandidateFilters): Candidate[] {
  return candidates.filter(
    (candidate) =>
      filters.skills.every((skill) => candidate.skills.includes(skill)) &&
      filters.softSkills.every((skill) => candidate.softSkills.includes(skill)) &&
      candidate.readiness >= filters.minimumReadiness &&
      (filters.experience === "" ||
        (filters.experience === "2+"
          ? candidate.internships >= 2
          : candidate.internships === Number(filters.experience)))
  );
}
