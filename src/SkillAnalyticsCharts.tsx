import { useState, useEffect } from "react";
import { fetchAnalytics } from "./api-client";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const defaultRadarData = [
  { subject: "React & UI", score: 88, benchmark: 75 },
  { subject: "JavaScript/TS", score: 85, benchmark: 80 },
  { subject: "Backend & APIs", score: 78, benchmark: 70 },
  { subject: "Database & SQL", score: 74, benchmark: 65 },
  { subject: "System Design", score: 68, benchmark: 70 },
  { subject: "Testing & CI/CD", score: 58, benchmark: 72 },
  { subject: "Communication", score: 92, benchmark: 80 },
];

const defaultHistoryData = [
  { month: "Nov", score: 62 },
  { month: "Dec", score: 68 },
  { month: "Jan", score: 74 },
  { month: "Feb", score: 79 },
  { month: "Mar", score: 82 },
];

const defaultBarData = [
  { category: "Frontend", verified: 88, gap: 12 },
  { category: "Backend", verified: 78, gap: 22 },
  { category: "Database", verified: 74, gap: 26 },
  { category: "Testing", verified: 58, gap: 42 },
  { category: "Soft Skills", verified: 92, gap: 8 },
];

const defaultDonutData = [
  { name: "Verified Ready (>85%)", value: 45, color: "#10b981" },
  { name: "High Match (75-84%)", value: 35, color: "#3b82f6" },
  { name: "Gap In Progress", value: 20, color: "#f59e0b" },
];

export default function SkillAnalyticsCharts() {
  const [activeTab, setActiveTab] = useState<"radar" | "growth" | "breakdown">("radar");
  const [data, setData] = useState({
    radar: defaultRadarData,
    history: defaultHistoryData,
    bar: defaultBarData,
    donut: defaultDonutData,
  });

  useEffect(() => {
    // Attempt fetching from backend API if active (supports VITE_API_URL and /api on Vercel)
    fetchAnalytics().then((apiData) => {
      if (apiData?.skillRadar) {
        setData({
          radar: apiData.skillRadar.map((r: any) => ({
            subject: r.subject,
            score: r.studentScore,
            benchmark: r.benchmark,
          })),
          history: apiData.readinessHistory || defaultHistoryData,
          bar: apiData.categoryBreakdown || defaultBarData,
          donut: apiData.talentDistribution || defaultDonutData,
        });
      }
    });
  }, []);

  return (
    <div className="card" style={{ marginTop: "1.5rem", padding: "1.5rem", borderRadius: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Skill Analytics & Readiness Visualizer</h2>
            <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>Recharts Powered</span>
          </div>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
            Real-time radar profiling, gap diagnosis, and industry benchmark comparison
          </p>
        </div>

        <div style={{ display: "flex", background: "#f1f5f9", padding: "0.25rem", borderRadius: "0.5rem", gap: "0.25rem" }}>
          <button
            type="button"
            className="btn"
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: activeTab === "radar" ? "#0284c7" : "transparent",
              color: activeTab === "radar" ? "#ffffff" : "#475569",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("radar")}
          >
            Skill Radar
          </button>
          <button
            type="button"
            className="btn"
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: activeTab === "growth" ? "#0284c7" : "transparent",
              color: activeTab === "growth" ? "#ffffff" : "#475569",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("growth")}
          >
            Growth Trajectory
          </button>
          <button
            type="button"
            className="btn"
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: activeTab === "breakdown" ? "#0284c7" : "transparent",
              color: activeTab === "breakdown" ? "#ffffff" : "#475569",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("breakdown")}
          >
            Category Gaps
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        {activeTab === "radar" && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
              <Radar name="Student Verified Score" dataKey="score" stroke="#0284c7" fill="#0284c7" fillOpacity={0.4} />
              <Radar name="Industry Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#f8fafc", border: "none" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "growth" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#f8fafc", border: "none" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                name="Readiness Score"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "breakdown" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.bar} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#f8fafc", border: "none" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="verified" name="Verified Competency" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gap" name="Target Gap Closure" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
          <small style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>TOP STRENGTH</small>
          <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>React & UI Architecture (88%)</strong>
        </div>
        <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
          <small style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>PRIMARY GAP</small>
          <strong style={{ color: "#ef4444", fontSize: "0.95rem" }}>Testing & CI/CD (-14% below target)</strong>
        </div>
        <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
          <small style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>READINESS TIER</small>
          <strong style={{ color: "#10b981", fontSize: "0.95rem" }}>Top 15% Among Senior Students</strong>
        </div>
      </div>
    </div>
  );
}
