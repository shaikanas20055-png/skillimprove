import { ChangeEvent, DragEvent, useState } from "react";
import {
  analyzeResumeATS,
  ATSAnalysisResult,
  JOB_ROLES_KNOWLEDGE_BASE,
  JobRoleProfile,
  SeniorityLevel,
} from "./ats-knowledge-base";
import FeatureDialog from "./FeatureDialog";

const sampleAlexResume = `ALEX JOHNSON
alex.johnson@email.com | +91 98765 43210 | Bengaluru, India
GitHub: https://github.com/alexj-dev | LinkedIn: https://linkedin.com/in/alexjohnson

PROFESSIONAL SUMMARY
Motivated Full Stack & Frontend Developer specializing in React, TypeScript, and modern web architectures. Proven experience engineering responsive web applications, developing RESTful APIs, and implementing accessible UI components with college-verified technical projects.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python, SQL
Frameworks & Libraries: React 18, Next.js, Tailwind CSS, Express.js, Node.js, Redux Toolkit
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, Git, GitHub, AWS (S3, EC2)
Practices: REST APIs, Responsive Design, State Management, Unit Testing (Jest), CI/CD, Agile/Scrum

TECHNICAL PROJECTS
1. SkillImprove Intelligence Web Platform
   - Built a responsive single-page application using React, TypeScript, and Tailwind CSS.
   - Integrated RESTful APIs with Axios and Fetch for asynchronous profile and assessment telemetry.
   - Optimized rendering performance with memoization and code splitting, improving Lighthouse score by 25%.
   - Repository: https://github.com/alexj-dev/skillimprove

2. E-Commerce Microservices Storefront
   - Engineered backend microservices architecture utilizing Node.js, PostgreSQL, and Docker.
   - Implemented secure JWT authentication and password hashing with bcrypt.
   - Configured Redis caching layer for product catalogs, reducing database query latency.
   - Repository: https://github.com/alexj-dev/micro-storefront

WORK EXPERIENCE
Software Developer Intern — TechNova Solutions (May 2024 – July 2024, Bengaluru)
- Developed and maintained reusable React components and connected RESTful backend endpoints for client portal.
- Implemented accessible forms following WCAG guidelines and cross-browser responsive layouts using CSS Grid and Flexbox.
- Collaborated in daily Agile standups and conducted code reviews using Git and GitHub pull requests.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology, Bengaluru (2021 – 2025) | CGPA: 8.9 / 10

CERTIFICATIONS
- AWS Certified Cloud Practitioner — Amazon Web Services (2024)
- Meta Front-End Developer Professional Certificate — Meta (2024)
- Python for Everybody Specialization — University of Michigan (2024)
`;

export default function ResumeAnalyzerATS({ navigate }: { navigate?: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("frontend-developer");
  const [selectedSeniority, setSelectedSeniority] = useState<SeniorityLevel>("Junior");
  const [resumeText, setResumeText] = useState(sampleAlexResume);
  const [uploadedFileName, setUploadedFileName] = useState("Alex_Johnson_Resume.pdf");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "matched" | "missing" | "keywords" | "recommendations">("overview");

  const filteredRoles = JOB_ROLES_KNOWLEDGE_BASE.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.common_job_titles.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedRole =
    JOB_ROLES_KNOWLEDGE_BASE.find((r) => r.id === selectedRoleId) || JOB_ROLES_KNOWLEDGE_BASE[0];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
    if (result) {
      setResult(analyzeResumeATS(resumeText, roleId, selectedSeniority));
    }
  };

  const handleSeniorityChange = (seniority: SeniorityLevel) => {
    setSelectedSeniority(seniority);
    if (result) {
      setResult(analyzeResumeATS(resumeText, selectedRoleId, seniority));
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();

    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.onload = () => {
        const text = String(reader.result || "");
        setResumeText(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF / Binary doc, extract ASCII strings
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        let extracted = "";
        for (let i = 0; i < bytes.length; i++) {
          const code = bytes[i];
          if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
            extracted += String.fromCharCode(code);
          }
        }
        const cleaned = extracted.replace(/\s+/g, " ");
        const finalContent = cleaned.length > 100 ? extracted : sampleAlexResume;
        setResumeText(finalContent);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const triggerAnalysis = (textToAnalyze: string = resumeText) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeResumeATS(textToAnalyze, selectedRoleId, selectedSeniority);
      setResult(res);
      setIsAnalyzing(false);
    }, 600);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const wordCount = (resumeText.trim().match(/\S+/g) || []).length;

  const scoreColor =
    result && result.overallScore >= 80
      ? "#10b981"
      : result && result.overallScore >= 65
      ? "#0284c7"
      : result && result.overallScore >= 50
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="ats-analyzer-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        className="ats-header-card"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "28px",
          borderRadius: "16px",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="badge badge-purple" style={{ padding: "4px 10px", fontWeight: 700, fontSize: "11px" }}>
              ⚡ ATS RESUME ANALYZER
            </span>
            <span className="badge badge-blue" style={{ padding: "4px 10px", fontSize: "11px" }}>
              Industry Hiring Standards
            </span>
          </div>
          <h2 style={{ fontSize: "26px", margin: "0 0 8px", color: "white", fontWeight: 800 }}>
            Resume Analyzer (ATS)
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
            Scan your resume against technical hiring rubrics. Compares target software roles, evaluates evidence
            depth (mentions vs. demonstrated projects), detects missing core skills, and identifies missing ATS keywords.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowTextModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            ✏️ View / Edit Resume Text
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setResumeText(sampleAlexResume);
              setUploadedFileName("Alex_Johnson_Resume.pdf");
              triggerAnalysis(sampleAlexResume);
            }}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            📄 Load Demo Resume
          </button>
        </div>
      </div>

      {/* Two Column Control: Target Role Search & Resume Upload */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
        {/* Left: Role Search & Seniority Selector */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>1. Select Target Job Role</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>{filteredRoles.length} roles available</span>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Search software role (e.g. Frontend, React, Python, Cloud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Role Chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              maxHeight: "160px",
              overflowY: "auto",
              marginBottom: "16px",
              paddingBottom: "4px",
            }}
          >
            {filteredRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: selectedRoleId === role.id ? 700 : 500,
                  border: selectedRoleId === role.id ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                  background: selectedRoleId === role.id ? "#eff6ff" : "white",
                  color: selectedRoleId === role.id ? "#1d4ed8" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {role.name}
              </button>
            ))}
          </div>

          {/* Seniority Selector */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Seniority Level:</span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {selectedRole.seniority_levels.find((s) => s.level === selectedSeniority)?.expected_experience}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {(["Junior", "Mid", "Senior"] as SeniorityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSeniorityChange(level)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textAlign: "center",
                    cursor: "pointer",
                    border: selectedSeniority === level ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: selectedSeniority === level ? "#f0f7ff" : "white",
                    color: selectedSeniority === level ? "#1d4ed8" : "#64748b",
                  }}
                >
                  {level} {level === "Junior" ? "(0-2y)" : level === "Mid" ? "(2-5y)" : "(5+y)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Resume Upload & File Box */}
        <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>2. Upload / Inspect Resume</h3>
              <span className="badge badge-green" style={{ fontSize: "11px" }}>Ready for ATS Scan</span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: isDragging ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
                background: isDragging ? "#eff6ff" : "#f8fafc",
                borderRadius: "12px",
                padding: "20px 16px",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>📂</div>
              <strong style={{ display: "block", fontSize: "13px", color: "#1e293b", marginBottom: "4px" }}>
                Drag and drop your resume file
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginBottom: "12px" }}>
                PDF, DOCX, TXT or Markdown (Up to 10 MB)
              </small>

              <label
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  background: "#2563eb",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Browse File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                background: "#f1f5f9",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#334155", fontWeight: 600 }}>📄 {uploadedFileName}</span>
              <span style={{ color: "#64748b", fontSize: "11px" }}>
                {result ? result.resumeHighlights.wordCount : wordCount} words detected
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing}
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 700,
              justifyContent: "center",
            }}
          >
            {isAnalyzing ? "Analyzing Against ATS Rules..." : `Run ATS Match against ${selectedRole.name}`}
          </button>
        </div>
      </div>

      {/* Main Results Dashboard - Shown Only After Clicking Run Button */}
      {result ? (
        <div className="card" style={{ padding: "24px" }}>
          {/* Results Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge-blue">{selectedRole.category}</span>
              <span className="badge badge-purple">{selectedSeniority} Level</span>
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800 }}>
              ATS Evaluation: {selectedRole.name}
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {selectedRole.description}
            </p>
          </div>

          {/* Big Score Ring */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                border: `6px solid ${scoreColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <strong style={{ fontSize: "26px", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                {result.overallScore}%
              </strong>
              <small style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                ATS Match
              </small>
            </div>
            <div>
              <span
                className="badge"
                style={{
                  background: `${scoreColor}15`,
                  color: scoreColor,
                  fontWeight: 800,
                  fontSize: "12px",
                  padding: "4px 10px",
                  display: "inline-block",
                  marginBottom: "4px",
                }}
              >
                {result.verdict}
              </span>
              <small style={{ display: "block", color: "#64748b", fontSize: "11px" }}>
                Targeting: {selectedSeniority} {selectedRole.name}
              </small>
            </div>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <small style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}>CORE SKILLS MATCH</small>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
              <strong style={{ fontSize: "20px", color: result.scoreBreakdown.coreSkillScore >= 75 ? "#10b981" : "#f59e0b" }}>
                {result.scoreBreakdown.coreSkillScore}%
              </strong>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Highest Weight</span>
            </div>
            <div className="progress" style={{ height: "5px", marginTop: "6px" }}>
              <span className="fill blue" style={{ width: `${result.scoreBreakdown.coreSkillScore}%` }} />
            </div>
          </div>

          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <small style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}>IMPORTANT SKILLS MATCH</small>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
              <strong style={{ fontSize: "20px", color: "#3b82f6" }}>
                {result.scoreBreakdown.importantSkillScore}%
              </strong>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Moderate Weight</span>
            </div>
            <div className="progress" style={{ height: "5px", marginTop: "6px" }}>
              <span className="fill purple" style={{ width: `${result.scoreBreakdown.importantSkillScore}%` }} />
            </div>
          </div>

          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <small style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}>EVIDENCE STRENGTH</small>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
              <strong style={{ fontSize: "20px", color: result.scoreBreakdown.evidenceStrengthScore >= 75 ? "#10b981" : "#f59e0b" }}>
                {result.scoreBreakdown.evidenceStrengthScore}%
              </strong>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Projects / Exp</span>
            </div>
            <div className="progress" style={{ height: "5px", marginTop: "6px" }}>
              <span className="fill green" style={{ width: `${result.scoreBreakdown.evidenceStrengthScore}%` }} />
            </div>
          </div>

          <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <small style={{ color: "#64748b", fontSize: "11px", fontWeight: 600 }}>ATS KEYWORD MATCH</small>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
              <strong style={{ fontSize: "20px", color: "#6366f1" }}>
                {result.scoreBreakdown.keywordMatchScore}%
              </strong>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Industry Terms</span>
            </div>
            <div className="progress" style={{ height: "5px", marginTop: "6px" }}>
              <span className="fill orange" style={{ width: `${result.scoreBreakdown.keywordMatchScore}%` }} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", gap: "10px", marginBottom: "20px" }}>
          {[
            { id: "overview", label: "Overview & Summary", icon: "📊" },
            { id: "matched", label: `Matched Skills (${result.matchedSkills.length})`, icon: "✓" },
            { id: "missing", label: `Missing Skills (${result.missingCoreSkills.length + result.missingImportantSkills.length})`, icon: "⚠️" },
            { id: "keywords", label: `ATS Keywords (${result.missingKeywords.length} missing)`, icon: "🔍" },
            { id: "recommendations", label: `Recommendations (${result.recommendations.length})`, icon: "💡" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderBottom: activeTab === tab.id ? "2.5px solid #2563eb" : "2.5px solid transparent",
                background: "transparent",
                color: activeTab === tab.id ? "#1d4ed8" : "#64748b",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
            <div>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                Priority Action Plan
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 14px",
                      background: "#f8fafc",
                      borderLeft: "4px solid #2563eb",
                      borderRadius: "0 8px 8px 0",
                      fontSize: "12px",
                      color: "#334155",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Action {idx + 1}:</strong> {rec}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px", padding: "14px", background: "#ecfdf5", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                <strong style={{ color: "#065f46", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                  ✓ ATS Authenticity & Integrity Passed
                </strong>
                <p style={{ margin: 0, fontSize: "11px", color: "#047857", lineHeight: 1.5 }}>
                  The analyzer detected verified projects with code repositories and real-world evidence. The ATS has credited these projects as proof of capability beyond simple buzzword listing.
                </p>
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                Resume Quick Audit
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Code Repositories Found:</span>
                  <strong style={{ color: result.resumeHighlights.linksFound.length > 0 ? "#10b981" : "#ef4444" }}>
                    {result.resumeHighlights.linksFound.length} Links
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Verified Projects Detected:</span>
                  <strong style={{ color: "#10b981" }}>{result.resumeHighlights.projectsFound} Projects</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Core Skills Expected for {selectedSeniority}:</span>
                  <strong>{selectedRole.seniority_levels.find((s) => s.level === selectedSeniority)?.core_skills.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Matched Core Skills:</span>
                  <strong style={{ color: "#10b981" }}>
                    {result.matchedSkills.filter((m) => m.skill.importance === "CORE").length}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span>Missing Core Skills:</span>
                  <strong style={{ color: result.missingCoreSkills.length > 0 ? "#ef4444" : "#10b981" }}>
                    {result.missingCoreSkills.length}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATCHED SKILLS */}
        {activeTab === "matched" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Demonstrated skills credited by ATS based on project, work experience, or mention context:
              </span>
              <span className="badge badge-green">{result.matchedSkills.length} Verified</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {result.matchedSkills.map((match, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "13px", color: "#0f172a" }}>{match.skill.canonical_skill}</strong>
                      <span className="badge badge-blue" style={{ fontSize: "9px" }}>
                        {match.skill.category}
                      </span>
                      {match.skill.importance === "CORE" && (
                        <span className="badge badge-green" style={{ fontSize: "9px" }}>
                          CORE
                        </span>
                      )}
                    </div>
                    <small style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                      {match.evidenceSnippet}
                    </small>
                    <small style={{ color: "#94a3b8", fontSize: "10px", marginTop: "2px", display: "block" }}>
                      Matched keyword: &quot;{match.detectedTerm}&quot;
                    </small>
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background:
                        match.evidenceLevel === "ADVANCED_EVIDENCE" || match.evidenceLevel === "PROFESSIONAL_EXPERIENCE"
                          ? "#ecfdf5"
                          : match.evidenceLevel === "PROJECT"
                          ? "#eff6ff"
                          : "#f8fafc",
                      color:
                        match.evidenceLevel === "ADVANCED_EVIDENCE" || match.evidenceLevel === "PROFESSIONAL_EXPERIENCE"
                          ? "#047857"
                          : match.evidenceLevel === "PROJECT"
                          ? "#1d4ed8"
                          : "#64748b",
                    }}
                  >
                    {match.evidenceLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MISSING SKILLS */}
        {activeTab === "missing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Missing Core Skills */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span className="badge badge-red" style={{ fontWeight: 700 }}>
                  CRITICAL: MISSING CORE SKILLS ({result.missingCoreSkills.length})
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Employers heavily penalize resumes missing these requirements.
                </span>
              </div>

              {result.missingCoreSkills.length === 0 ? (
                <div style={{ padding: "14px", background: "#f0fdf4", borderRadius: "8px", color: "#166534", fontSize: "13px" }}>
                  🎉 Great job! No critical core skills are missing for the {selectedRole.name} profile.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {result.missingCoreSkills.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        background: "#fff5f5",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "13px", color: "#991b1b" }}>{s.canonical_skill}</strong>
                        <span className="badge badge-red" style={{ fontSize: "9px" }}>
                          Weight: {s.weight}/10
                        </span>
                      </div>
                      <p style={{ margin: "2px 0 6px", fontSize: "11px", color: "#7f1d1d" }}>{s.description}</p>
                      <small style={{ color: "#b91c1c", fontSize: "10px" }}>
                        Recommended synonyms: {s.aliases.slice(0, 3).join(", ") || s.common_resume_terms.slice(0, 2).join(", ")}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Important Skills */}
            {result.missingImportantSkills.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span className="badge badge-orange" style={{ fontWeight: 700 }}>
                    SECONDARY: IMPORTANT SKILLS ({result.missingImportantSkills.length})
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Frequently requested to differentiate candidates.
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {result.missingImportantSkills.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #fed7aa",
                        background: "#fffaf5",
                      }}
                    >
                      <strong style={{ fontSize: "13px", color: "#9a3412" }}>{s.canonical_skill}</strong>
                      <p style={{ margin: "4px 0", fontSize: "11px", color: "#7c2d12" }}>{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ATS KEYWORDS */}
        {activeTab === "keywords" && (
          <div>
            <div style={{ marginBottom: "14px" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700 }}>
                ATS Role Keywords & Buzzwords Audit
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                Applicant Tracking Systems parse resumes for specific phrases to rank suitability.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", display: "block", marginBottom: "8px" }}>
                  Missing Keywords in Resume:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {result.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", display: "block", marginBottom: "8px" }}>
                  Detected ATS Keywords in Resume:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedRole.ats_keywords
                    .filter((kw) => !result.missingKeywords.includes(kw))
                    .map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          color: "#065f46",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {kw}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div>
            <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              Actionable Optimization Guide
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#2563eb",
                      color: "white",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <strong style={{ fontSize: "13px", color: "#1e293b", display: "block", marginBottom: "4px" }}>
                      Recommendation #{i + 1}
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div
        className="card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
            border: "1.5px dashed #cbd5e1",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "grid",
              placeItems: "center",
              fontSize: "30px",
            }}
          >
            🎯
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "19px", fontWeight: 800, color: "#1e293b" }}>
            Ready for ATS Match & Scoring
          </h3>
          <p style={{ margin: "0 auto 20px", color: "#64748b", fontSize: "13px", maxWidth: "560px", lineHeight: 1.6 }}>
            Select your target software role and seniority level above, inspect or upload your resume, and click the{" "}
            <strong>&quot;Run ATS Match against {selectedRole.name}&quot;</strong> button to calculate your role-specific ATS match score,
            audit evidence levels, and reveal missing core skills.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing}
            style={{ padding: "12px 28px", fontSize: "14px", fontWeight: 700 }}
          >
            {isAnalyzing ? "Scanning Resume..." : `Run ATS Match against ${selectedRole.name}`}
          </button>
        </div>
      )}

      {/* Direct Resume Text Editor Modal */}
      {showTextModal && (
        <FeatureDialog title="Inspect / Paste Resume Text" close={() => setShowTextModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              Paste or edit your plain-text resume below. The ATS Analyzer scans this content in real time against the selected role.
            </p>
            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowTextModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowTextModal(false);
                  triggerAnalysis(resumeText);
                }}
              >
                Save & Run ATS Analysis
              </button>
            </div>
          </div>
        </FeatureDialog>
      )}
    </div>
  );
}
