export default function BackendStatusPage() {
  const endpoints = [
    { method: "GET", path: "/api/profile", desc: "Fetch student readiness, verified skills & profile details" },
    { method: "PUT", path: "/api/profile", desc: "Update student headline & readiness score" },
    { method: "GET", path: "/api/assessments", desc: "List core aptitude, programming & soft skill assessments" },
    { method: "POST", path: "/api/assessments/submit", desc: "Grade assessment, update readiness, issue verified badge" },
    { method: "GET", path: "/api/opportunities", desc: "List verified internships & tech jobs with skill matches" },
    { method: "POST", path: "/api/opportunities/apply", desc: "Submit job application with match tracking" },
    { method: "GET", path: "/api/candidates", desc: "Talent search for recruiters with readiness & skill filters" },
    { method: "GET", path: "/api/analytics", desc: "Recharts analytics data (Radar, Area, Bar, Donut)" },
    { method: "POST", path: "/api/ai/skill-gap-analysis", desc: "Google Gemini AI personalized roadmap & gap closure" },
    { method: "POST", path: "/api/ai/quiz-generator", desc: "Google Gemini AI dynamic MCQs generator" },
    { method: "POST", path: "/api/ai/match-explainer", desc: "Explainable candidate-job match breakdown" },
    { method: "GET/POST", path: "/api/auth/[...nextauth]", desc: "Auth.js (NextAuth) session & credential handlers" },
  ];

  return (
    <main style={{ padding: "3rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid #1e293b", paddingBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-block", background: "#0ea5e9", color: "#000", fontWeight: 700, fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "9999px", marginBottom: "0.5rem" }}>
            SkillImprove API Service
          </div>
          <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: 800 }}>Next.js Backend & Route Handlers</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "1rem" }}>
            PostgreSQL • Prisma ORM • Auth.js • Google Gemini AI • Recharts Analytics
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#1e293b", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #334155" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0" }}>API Ready</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#38bdf8" }}>Database & ORM</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
            PostgreSQL configured via Prisma schema in <code>prisma/schema.prisma</code> with support for Users, Profiles, Skills, Assessments, and Applications.
          </p>
        </div>
        <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#a855f7" }}>Authentication</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
            Auth.js (NextAuth) with Prisma Adapter, JWT session strategy, and role-based permissions (Student, Recruiter, College Admin).
          </p>
        </div>
        <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #334155" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#34d399" }}>AI Engine</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
            Google Gemini 2.5 Flash via <code>@google/genai</code> generating skill gap roadmaps, dynamic quiz questions, and hiring match reasoning.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem", color: "#f1f5f9" }}>Route Handlers & Endpoints</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {endpoints.map((ep, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e293b", padding: "0.875rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                background: ep.method.includes("POST") ? "#10b98122" : "#38bdf822",
                color: ep.method.includes("POST") ? "#34d399" : "#38bdf8",
                border: `1px solid ${ep.method.includes("POST") ? "#10b98144" : "#38bdf844"}`
              }}>
                {ep.method}
              </span>
              <code style={{ fontSize: "0.9rem", color: "#f8fafc" }}>{ep.path}</code>
            </div>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{ep.desc}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
