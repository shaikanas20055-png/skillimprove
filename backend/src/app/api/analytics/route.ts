import { NextResponse } from "next/server";

export async function GET() {
  // Analytical aggregates structured for Recharts visualizations
  const analyticsData = {
    // For Radar Chart
    skillRadar: [
      { subject: "React & UI", studentScore: 88, benchmark: 75, fullMark: 100 },
      { subject: "JavaScript / TS", studentScore: 85, benchmark: 80, fullMark: 100 },
      { subject: "Backend & APIs", studentScore: 78, benchmark: 70, fullMark: 100 },
      { subject: "Database & SQL", studentScore: 74, benchmark: 65, fullMark: 100 },
      { subject: "System Design", studentScore: 68, benchmark: 70, fullMark: 100 },
      { subject: "Testing & CI/CD", studentScore: 58, benchmark: 72, fullMark: 100 },
      { subject: "Communication", studentScore: 92, benchmark: 80, fullMark: 100 },
    ],

    // For Area/Line Chart: Readiness Score growth over months
    readinessHistory: [
      { month: "Nov", score: 62, assessments: 1 },
      { month: "Dec", score: 68, assessments: 3 },
      { month: "Jan", score: 74, assessments: 5 },
      { month: "Feb", score: 79, assessments: 8 },
      { month: "Mar", score: 82, assessments: 11 },
    ],

    // For Bar Chart: Category Mastery vs Industry Readiness
    categoryBreakdown: [
      { category: "Programming", verified: 85, gap: 15 },
      { category: "Aptitude", verified: 78, gap: 22 },
      { category: "Soft Skills", verified: 90, gap: 10 },
      { category: "System Architecture", verified: 65, gap: 35 },
    ],

    // For Pie/Donut Chart: Recruiter Candidate Talent Distribution
    talentDistribution: [
      { name: "Top Match (90%+)", value: 42, color: "#10b981" },
      { name: "Strong Match (80-89%)", value: 36, color: "#3b82f6" },
      { name: "Developing (70-79%)", value: 18, color: "#f59e0b" },
      { name: "Needs Training (<70%)", value: 4, color: "#ef4444" },
    ],

    summaryStats: {
      verifiedSkills: 8,
      readinessPercentile: "Top 12%",
      activeInterviews: 2,
      gapClosureSpeed: "3.2 weeks",
    },
  };

  return NextResponse.json(analyticsData);
}
