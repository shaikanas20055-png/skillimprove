// SkillImprove Backend API Client
// In development, default to local backend on port 3001.
// In production (e.g., Vercel), use VITE_API_URL or fallback to relative /api.
export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  ((import.meta as any).env?.PROD ? "/api" : "http://localhost:3001/api");

export async function fetchProfile(email: string = "alex.johnson@example.com") {
  try {
    const res = await fetch(`${API_BASE}/profile?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (err) {
    console.warn("Using offline profile data:", err);
    return null;
  }
}

export async function fetchAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (err) {
    console.warn("Using offline analytics data:", err);
    return null;
  }
}

export async function fetchOpportunities() {
  try {
    const res = await fetch(`${API_BASE}/opportunities`);
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (err) {
    console.warn("Using offline opportunities data:", err);
    return null;
  }
}

export async function submitAssessmentAnswers(payload: {
  userId?: string;
  assessmentId: string;
  answers: number[];
  score: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/assessments/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to submit assessment");
    return await res.json();
  } catch (err) {
    console.warn("Offline assessment score fallback:", err);
    return { success: true, score: payload.score, passed: payload.score >= 70 };
  }
}

export async function requestSkillGapAnalysis(currentSkills: string[], targetRole: string) {
  try {
    const res = await fetch(`${API_BASE}/ai/skill-gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSkills, targetRole }),
    });
    if (!res.ok) throw new Error("Failed to request AI gap analysis");
    return await res.json();
  } catch (err) {
    console.warn("Offline AI gap fallback:", err);
    return null;
  }
}
