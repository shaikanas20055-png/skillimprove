export type Candidate = {
  name: string;
  readiness: number;
  match: number;
  skills: string[];
  softSkills: string[];
  internships: number;
};

export const candidates: Candidate[] = [
  { name: "Priya Sharma", readiness: 91, match: 94, skills: ["React", "Node.js", "SQL", "JavaScript"], softSkills: ["Communication", "Teamwork", "Leadership"], internships: 2 },
  { name: "Alex Johnson", readiness: 82, match: 92, skills: ["React", "JavaScript", "Python"], softSkills: ["Communication", "Problem solving", "Teamwork"], internships: 1 },
  { name: "Maya Patel", readiness: 88, match: 91, skills: ["Python", "AI/ML", "Cloud"], softSkills: ["Critical thinking", "Problem solving", "Time management"], internships: 0 },
  { name: "Rahul Verma", readiness: 79, match: 87, skills: ["Java", "Spring", "SQL"], softSkills: ["Teamwork", "Problem solving", "Time management"], internships: 1 },
  { name: "Sara Khan", readiness: 85, match: 89, skills: ["React", "TypeScript", "AWS", "JavaScript"], softSkills: ["Communication", "Leadership", "Time management"], internships: 2 },
  { name: "Vikram Rao", readiness: 76, match: 84, skills: ["Python", "Django", "Docker"], softSkills: ["Critical thinking", "Teamwork", "Problem solving"], internships: 0 },
];

export type CandidateFilters = {
  skills: string[];
  softSkills: string[];
  experience: string;
  minimumReadiness: number;
};

export function filterCandidates(filters: CandidateFilters): Candidate[] {
  return candidates.filter(candidate =>
    filters.skills.every(skill => candidate.skills.includes(skill)) &&
    filters.softSkills.every(skill => candidate.softSkills.includes(skill)) &&
    candidate.readiness >= filters.minimumReadiness &&
    (filters.experience === "" ||
      (filters.experience === "2+" ? candidate.internships >= 2 : candidate.internships === Number(filters.experience))));
}
