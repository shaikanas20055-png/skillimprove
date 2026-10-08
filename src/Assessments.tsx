import { useEffect, useRef, useState } from "react";
import {
  DifficultyLevel,
  JobRoleAssessmentConfig,
  QuestionType,
  RoleCategory,
  SUPPORTED_JOB_ROLES,
  getAdaptiveDifficulty,
} from "./assessment-roles";
import {
  AssessmentQuestion,
  evaluateAnswer,
  generateQuestionsForRole,
} from "./assessment-question-bank";
import {
  AssessmentAttempt,
  saveAssessmentAttempt,
  useAssessmentRoleMeta,
  getLatestAttemptForRole,
} from "./assessment-storage";
import { addStudentNotice, useStudentName } from "./app-data";

export default function Assessments({ navigate }: { navigate: (path: string) => void }) {
  const studentName = useStudentName();
  const roleMeta = useAssessmentRoleMeta();

  // Navigation & filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Assessment flow states
  const [activeRole, setActiveRole] = useState<JobRoleAssessmentConfig | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [questionCountConfig, setQuestionCountConfig] = useState<number>(30);

  // Active test-taking states
  const [isTestActive, setIsTestActive] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10:00 (600 seconds)
  const [earlySubmitModalOpen, setEarlySubmitModalOpen] = useState(false);

  // Results state
  const [completedAttempt, setCompletedAttempt] = useState<AssessmentAttempt | null>(null);
  const [reviewModalAttempt, setReviewModalAttempt] = useState<AssessmentAttempt | null>(null);

  // Timer interval ref
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filtered roles
  const filteredRoles = SUPPORTED_JOB_ROLES.filter((role) => {
    const meta = roleMeta[role.id];
    const isDone = !!meta?.isDone;
    const currentDiff = meta?.currentDifficulty || "Medium";

    const matchesCategory =
      selectedCategory === "All" || role.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Done" && isDone) ||
      (selectedStatus === "Not Started" && !isDone);
    const matchesDifficulty =
      selectedDifficulty === "All" || currentDiff === selectedDifficulty;
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesDifficulty && matchesSearch;
  });

  // 10-minute timer countdown
  useEffect(() => {
    if (isTestActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto submit when countdown reaches 0
            clearInterval(timerRef.current!);
            handleFinalSubmission(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, answers, questions, activeRole]);

  // Focus input on question change
  useEffect(() => {
    if (isTestActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, isTestActive]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Launch confirmation modal
  const handleInitiateAssessment = (role: JobRoleAssessmentConfig) => {
    setActiveRole(role);
    setQuestionCountConfig(30);
    setConfirmModalOpen(true);
  };

  // Start the 10-minute assessment session
  const handleStartTimedAssessment = () => {
    if (!activeRole) return;
    const meta = roleMeta[activeRole.id];
    const diff = meta?.currentDifficulty || "Medium";
    const generated = generateQuestionsForRole(activeRole.id, diff, questionCountConfig);

    setQuestions(generated);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(600); // exactly 10 minutes (600s)
    setConfirmModalOpen(false);
    setIsTestActive(true);
  };

  // Evaluate & finalize assessment submission
  const handleFinalSubmission = (isAutoExpired = false) => {
    if (!activeRole || questions.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setEarlySubmitModalOpen(false);

    const timeSpent = 600 - timeLeft;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const skillMap: Record<string, { correct: number; total: number }> = {};
    const weakSkillsSet = new Set<string>();

    questions.forEach((q, idx) => {
      const studentAns = answers[idx];
      const isCorrect = evaluateAnswer(q, studentAns);

      if (!skillMap[q.topic]) {
        skillMap[q.topic] = { correct: 0, total: 0 };
      }
      skillMap[q.topic].total += 1;

      if (!studentAns || !studentAns.trim()) {
        unansweredCount += 1;
        weakSkillsSet.add(q.topic);
      } else if (isCorrect) {
        correctCount += 1;
        skillMap[q.topic].correct += 1;
      } else {
        incorrectCount += 1;
        weakSkillsSet.add(q.topic);
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;
    const meta = roleMeta[activeRole.id];
    const currentDiff = meta?.currentDifficulty || "Medium";

    const skillPerformance = Object.keys(skillMap).map((skill) => ({
      skill,
      correct: skillMap[skill].correct,
      total: skillMap[skill].total,
      percentage: Math.round((skillMap[skill].correct / skillMap[skill].total) * 100),
    }));

    const recommendedTopics = Array.from(weakSkillsSet).slice(0, 4);
    if (recommendedTopics.length === 0) {
      recommendedTopics.push("Advanced Architecture Optimization", "Real-world System Scaling");
    }

    const attempt: AssessmentAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roleId: activeRole.id,
      roleTitle: activeRole.title,
      difficulty: currentDiff,
      totalQuestions: questions.length,
      score,
      passed,
      correctCount,
      incorrectCount,
      unansweredCount,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      questions,
      answers,
      skillPerformance,
      weakSkills: Array.from(weakSkillsSet),
      recommendedTopics,
    };

    // Save to storage & dispatch update
    saveAssessmentAttempt(attempt);
    setCompletedAttempt(attempt);

    // Add student notice
    addStudentNotice({
      id: `notice-assessment-${attempt.id}`,
      title: `${activeRole.title} Assessment Completed · ${score}%`,
      detail: `${passed ? "Passed" : "Needs Review"} (${score}%). Retake anytime with the "Do Again" option.`,
      path: "assessment",
    });
  };

  // Answered count in current active session
  const answeredCount = Object.values(answers).filter((v) => v && v.trim()).length;

  // -------------------------------------------------------------
  // VIEW 1: ACTIVE TIMED TEST-TAKING VIEW
  // -------------------------------------------------------------
  if (isTestActive && activeRole && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <div className="assessment-layout" style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px" }}>
        {/* Main Test Area */}
        <div className="assessment-main">
          {/* Header Bar */}
          <div
            className="card"
            style={{
              padding: "16px 20px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              borderLeft: "4px solid #6366f1",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px" }}>{activeRole.icon}</span>
                <strong style={{ fontSize: "16px", color: "var(--ink)" }}>{activeRole.title}</strong>
                <span
                  style={{
                    background: "#e0e7ff",
                    color: "#4338ca",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {currentQ.difficulty} Track
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{questions.length}</strong> ·{" "}
                <span style={{ color: "#10b981", fontWeight: 600 }}>{answeredCount} Answered</span> ·{" "}
                <span style={{ color: "#f59e0b" }}>{questions.length - answeredCount} Remaining</span>
              </p>
            </div>

            {/* Prominent Countdown Timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background:
                  timeLeft <= 60
                    ? "rgba(239, 68, 68, 0.15)"
                    : timeLeft <= 180
                    ? "rgba(245, 158, 11, 0.15)"
                    : "#f1f5f9",
                border:
                  timeLeft <= 60
                    ? "2px solid #ef4444"
                    : timeLeft <= 180
                    ? "2px solid #f59e0b"
                    : "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "10px",
                animation: timeLeft <= 60 ? "pulse 1s infinite" : undefined,
              }}
            >
              <span style={{ fontSize: "18px" }}>⏱️</span>
              <div>
                <small
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: timeLeft <= 60 ? "#ef4444" : timeLeft <= 180 ? "#b45309" : "#64748b",
                  }}
                >
                  Time Remaining
                </small>
                <strong
                  style={{
                    fontSize: "20px",
                    fontFamily: "ui-monospace, monospace",
                    color: timeLeft <= 60 ? "#dc2626" : timeLeft <= 180 ? "#d97706" : "#0f172a",
                    letterSpacing: "0.05em",
                  }}
                >
                  {formatTime(timeLeft)}
                </strong>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress" style={{ height: "6px", marginBottom: "16px" }}>
            <span
              className="fill"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                background: "linear-gradient(90deg, #6366f1, #10b981)",
              }}
            />
          </div>

          {/* Question Card */}
          <section
            className="card question-card"
            style={{
              padding: "24px 28px",
              minHeight: "380px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* Question Header & Meta */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#6366f1",
                    textTransform: "uppercase",
                    background: "#ede9fe",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  TOPIC: {currentQ.topic}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#475569",
                    background: "#f1f5f9",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {currentQ.type === "fill-in-the-blank"
                    ? "✏️ Fill in the Blank"
                    : currentQ.type === "multiple-choice"
                    ? "🔘 Multiple Choice"
                    : currentQ.type === "code-output"
                    ? "💻 Code Output"
                    : currentQ.type === "debugging"
                    ? "🐞 Code Completion / Debug"
                    : "🏢 Scenario Problem"}
                </span>
              </div>

              {/* Prompt Text */}
              <h2
                style={{
                  fontSize: "18px",
                  color: "var(--ink)",
                  lineHeight: "1.45",
                  marginBottom: "16px",
                  fontWeight: 600,
                }}
              >
                {currentQ.prompt}
              </h2>

              {/* Code Snippet Box (if present) */}
              {currentQ.codeSnippet && (
                <div
                  style={{
                    background: "#0f172a",
                    color: "#e2e8f0",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    overflowX: "auto",
                    marginBottom: "18px",
                    border: "1px solid #334155",
                  }}
                >
                  <pre style={{ margin: 0 }}>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Input Types */}
              {currentQ.type === "multiple-choice" && currentQ.options ? (
                <div className="answers" style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                  {currentQ.options.map((option, i) => {
                    const isSelected = answers[currentQuestionIndex] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQuestionIndex]: option })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid #6366f1" : "1px solid var(--line)",
                          background: isSelected ? "#eef2ff" : "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                          fontWeight: isSelected ? 600 : 400,
                          color: "var(--ink)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: isSelected ? "#6366f1" : "#f1f5f9",
                            color: isSelected ? "#ffffff" : "#475569",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ fontSize: "14px" }}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Fill in the blank / code output / debugging input */
                <div style={{ marginTop: "14px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                    Your Answer (Fill in the blank):
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={answers[currentQuestionIndex] || ""}
                    placeholder="Type the exact keyword, method, or answer here..."
                    onChange={(e) => setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLast) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }
                    }}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: "0 14px",
                      borderRadius: "9px",
                      border: "2px solid #cbd5e1",
                      fontSize: "14px",
                      fontFamily: "ui-monospace, monospace",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  />
                  <small style={{ display: "block", marginTop: "6px", color: "#64748b", fontSize: "11px" }}>
                    💡 Tip: Answers are case-insensitive. Semicolons and extra whitespace are automatically tolerated.
                  </small>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "28px",
                paddingTop: "18px",
                borderTop: "1px solid var(--line)",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <button
                className="btn btn-secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                ← Previous
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                {!isLast ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }}
                    onClick={() => setEarlySubmitModalOpen(true)}
                  >
                    Submit Assessment ✓
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Question Navigator Sidebar */}
        <section
          className="card question-nav"
          style={{
            padding: "20px",
            height: "fit-content",
            position: "sticky",
            top: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "15px" }}>Question Palette</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              {answeredCount}/{questions.length}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {questions.map((_, i) => {
              const isAnswered = !!answers[i]?.trim();
              const isCurrent = i === currentQuestionIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(i)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: isCurrent ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: isCurrent ? "#e0e7ff" : isAnswered ? "#10b981" : "#ffffff",
                    color: isCurrent ? "#3730a3" : isAnswered ? "#ffffff" : "#475569",
                    fontWeight: isCurrent || isAnswered ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    transition: "all 0.15s ease",
                  }}
                  title={`Question ${i + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", lineHeight: "1.6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} /> Answered
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffffff", border: "1px solid #cbd5e1" }} /> Unanswered
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e0e7ff", border: "1px solid #4f46e5" }} /> Current
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff" }}
            onClick={() => setEarlySubmitModalOpen(true)}
          >
            Submit Assessment
          </button>
        </section>

        {/* Early Submission Confirmation Modal */}
        {earlySubmitModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.7)",
              display: "grid",
              placeItems: "center",
              zIndex: 9999,
              padding: "16px",
            }}
          >
            <div className="card" style={{ maxWidth: "460px", width: "100%", padding: "24px", borderRadius: "14px" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "var(--ink)" }}>Confirm Submission</h3>
              <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
                {questions.length - answeredCount > 0 && (
                  <span style={{ display: "block", marginTop: "6px", color: "#dc2626", fontWeight: 600 }}>
                    ⚠️ {questions.length - answeredCount} unanswered questions will be marked as 0 marks.
                  </span>
                )}
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button className="btn btn-secondary" onClick={() => setEarlySubmitModalOpen(false)}>
                  Continue Test
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: "#10b981", color: "#fff" }}
                  onClick={() => handleFinalSubmission(false)}
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: RESULTS REVIEW VIEW (After Submission or viewing past)
  // -------------------------------------------------------------
  const attemptToView = completedAttempt || reviewModalAttempt;
  if (attemptToView) {
    const isPassed = attemptToView.score >= 70;
    return (
      <div className="result-wrap" style={{ maxWidth: "980px", margin: "0 auto", padding: "20px 16px" }}>
        <section className="card result-card" style={{ padding: "32px", borderRadius: "16px" }}>
          {/* Status Header */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#dcfce7",
                color: "#15803d",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              ✓ DONE · ASSESSMENT COMPLETED
            </span>
          </div>

          <h2 style={{ fontSize: "24px", color: "var(--ink)", margin: "4px 0" }}>
            {attemptToView.roleTitle} Interview Assessment
          </h2>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>
            Difficulty Level: <strong>{attemptToView.difficulty} Track</strong> · Completed on{" "}
            {new Date(attemptToView.completedAt).toLocaleDateString()}
          </p>

          {/* Big Score Display */}
          <div style={{ margin: "20px 0" }}>
            <strong
              className="actual-score"
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: isPassed ? "#10b981" : "#f59e0b",
                display: "block",
                lineHeight: "1",
              }}
            >
              {attemptToView.score}%
            </strong>
            <span
              className={`badge ${isPassed ? "badge-green" : "badge-orange"}`}
              style={{ marginTop: "8px", fontSize: "12px", padding: "4px 12px" }}
            >
              {attemptToView.score >= 79
                ? "🏆 High Performing (Advanced Track)"
                : attemptToView.score >= 75
                ? "✨ Proficient (Mixed Track)"
                : "📈 Developing (Needs Improvement Track)"}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="result-stats" style={{ margin: "24px 0" }}>
            <div>
              <strong style={{ color: "#10b981" }}>{attemptToView.correctCount}</strong>
              <small>Correct</small>
            </div>
            <div>
              <strong style={{ color: "#ef4444" }}>{attemptToView.incorrectCount}</strong>
              <small>Incorrect</small>
            </div>
            <div>
              <strong style={{ color: "#64748b" }}>{attemptToView.unansweredCount}</strong>
              <small>Unanswered</small>
            </div>
            <div>
              <strong style={{ color: "#4f46e5" }}>
                {Math.floor(attemptToView.timeSpentSeconds / 60)}m {attemptToView.timeSpentSeconds % 60}s
              </strong>
              <small>Time Taken (10m max)</small>
            </div>
          </div>

          {/* AI Feedback & Weak Skills Summary */}
          <div
            style={{
              textAlign: "left",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "18px 22px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <strong style={{ fontSize: "14px", color: "var(--ink)" }}>Gemini AI Assessment Evaluation & Recommendations</strong>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
              {attemptToView.score >= 79
                ? `Exceptional mastery in ${attemptToView.roleTitle}! You successfully cleared advanced concepts and qualify for top employer interview matching.`
                : `Good effort! You demonstrated practical competence, with opportunities to sharpen syntax and edge-case execution.`}
            </p>

            <strong style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
              Recommended Topics for Revision:
            </strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {attemptToView.recommendedTopics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    background: "#ede9fe",
                    color: "#5b21b6",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "6px",
                  }}
                >
                  📌 {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Performance Breakdown */}
          {attemptToView.skillPerformance.length > 0 && (
            <div style={{ textAlign: "left", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "15px", color: "var(--ink)", marginBottom: "12px" }}>Topic Performance Breakdown</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {attemptToView.skillPerformance.map((sp) => (
                  <div key={sp.skill} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "200px", fontSize: "13px", color: "#475569", fontWeight: 500 }}>{sp.skill}</span>
                    <div className="progress" style={{ flex: 1, height: "8px" }}>
                      <span
                        className={`fill ${sp.percentage >= 75 ? "green" : sp.percentage >= 50 ? "orange" : "red"}`}
                        style={{ width: `${sp.percentage}%` }}
                      />
                    </div>
                    <span style={{ width: "50px", textAlign: "right", fontSize: "12px", fontWeight: 700 }}>
                      {sp.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review */}
          <div style={{ textAlign: "left", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", color: "var(--ink)", marginBottom: "16px" }}>Detailed Question Review</h3>
            <div className="assessment-review" style={{ display: "grid", gap: "14px" }}>
              {attemptToView.questions.map((q, idx) => {
                const userAns = attemptToView.answers[idx];
                const isCorrect = evaluateAnswer(q, userAns);

                return (
                  <div
                    key={q.id}
                    className={isCorrect ? "review-correct" : "review-incorrect"}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "10px",
                      border: isCorrect ? "1px solid #86efac" : "1px solid #fca5a5",
                      background: isCorrect ? "#f0fdf4" : "#fef2f2",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: isCorrect ? "#15803d" : "#b91c1c" }}>
                        Question {idx + 1} · {isCorrect ? "✓ Correct" : "✗ Review Needed"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{q.topic}</span>
                    </div>

                    <p style={{ margin: "4px 0 8px", fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>
                      {q.prompt}
                    </p>

                    {q.codeSnippet && (
                      <pre
                        style={{
                          background: "#0f172a",
                          color: "#f8fafc",
                          padding: "10px 14px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          overflowX: "auto",
                          margin: "6px 0 10px",
                        }}
                      >
                        {q.codeSnippet}
                      </pre>
                    )}

                    <div style={{ fontSize: "13px", margin: "6px 0" }}>
                      <span>Your Answer: </span>
                      <strong style={{ color: isCorrect ? "#15803d" : "#b91c1c" }}>
                        {userAns ? userAns : "— (Unanswered)"}
                      </strong>
                    </div>

                    {!isCorrect && (
                      <div style={{ fontSize: "13px", margin: "4px 0", color: "#166534" }}>
                        <span>Accepted Answer: </span>
                        <strong>{q.acceptedAnswers[0]}</strong>
                      </div>
                    )}

                    <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                      💡 {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions" style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setCompletedAttempt(null);
                setReviewModalAttempt(null);
              }}
            >
              Back to Skill Assessment
            </button>

            {/* Do Again Button */}
            <button
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", color: "#fff" }}
              onClick={() => {
                const targetRole = SUPPORTED_JOB_ROLES.find((r) => r.id === attemptToView.roleId);
                setCompletedAttempt(null);
                setReviewModalAttempt(null);
                if (targetRole) {
                  handleInitiateAssessment(targetRole);
                }
              }}
            >
              🔄 Do Again (New Attempt)
            </button>

            <button className="btn btn-secondary" onClick={() => navigate("/student/recommendations")}>
              View Recommended Next Steps →
            </button>
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: SKILL ASSESSMENT LANDING CATALOG (29 ROLES)
  // -------------------------------------------------------------
  const categories: RoleCategory[] = [
    "Software Development",
    "Data and AI",
    "Cloud, Security and Testing",
    "Other Technical Roles",
  ];

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome">
        <div>
          <span className="badge badge-purple">
            AI-POWERED TECHNICAL ASSESSMENTS · 29 ROLES
          </span>
          <h2>Skill Assessment</h2>
          <p>
            Test your technical skills, prepare for job interviews, and track your progress with AI-powered timed assessments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                border: "1px solid " + (selectedCategory === cat ? "#4f46e5" : "var(--line)"),
                background: selectedCategory === cat ? "#4f46e5" : "#ffffff",
                color: selectedCategory === cat ? "#ffffff" : "#475569",
                borderRadius: "7px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter dropdowns & Search */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "7px",
              border: "1px solid var(--line)",
              fontSize: "12px",
              background: "#fff",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Done">Done (Completed)</option>
            <option value="Not Started">Not Started</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "7px",
              border: "1px solid var(--line)",
              fontSize: "12px",
              background: "#fff",
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="Medium">Medium Track</option>
            <option value="Advanced">Advanced Track</option>
            <option value="Mixed">Mixed Track</option>
          </select>

          <input
            type="text"
            placeholder="Search role or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "7px",
              border: "1px solid var(--line)",
              fontSize: "12px",
              minWidth: "180px",
            }}
          />
        </div>
      </div>

      {/* Assessment Role Catalog Grid */}
      <div
        className="assessment-catalog"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {filteredRoles.map((role) => {
          const meta = roleMeta[role.id];
          const isDone = !!meta?.isDone;
          const currentDifficulty = meta?.currentDifficulty || "Medium";
          const latestScore = meta?.latestScore;

          return (
            <section
              className="card assessment-track"
              key={role.id}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                borderTop: isDone ? "3px solid #10b981" : "3px solid #6366f1",
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{role.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "var(--ink)", fontWeight: 700 }}>{role.title}</h3>
                      <small style={{ color: "#64748b", fontSize: "11px" }}>{role.category}</small>
                    </div>
                  </div>

                  {/* Completion Status Badge */}
                  {isDone ? (
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ✓ Done
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#64748b",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      Not Started
                    </span>
                  )}
                </div>

                {/* Role Description */}
                <p style={{ margin: "6px 0 12px", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                  {role.description}
                </p>

                {/* Tech Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
                  {role.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        color: "#334155",
                        fontWeight: 500,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {role.technologies.length > 4 && (
                    <span style={{ fontSize: "10px", color: "#64748b", alignSelf: "center" }}>
                      +{role.technologies.length - 4} more
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "#64748b",
                    paddingTop: "10px",
                    borderTop: "1px solid #f1f5f9",
                    marginBottom: "14px",
                  }}
                >
                  <span>⏱️ 10 Minutes</span>
                  <span>📝 30 Questions</span>
                  <span style={{ fontWeight: 600, color: currentDifficulty === "Advanced" ? "#7c3aed" : "#0284c7" }}>
                    🎯 {currentDifficulty}
                  </span>
                </div>

                {/* Previous Score Display (if done) */}
                {isDone && latestScore !== undefined && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      padding: "6px 10px",
                      borderRadius: "7px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#166534" }}>Latest Score:</span>
                    <strong style={{ color: "#15803d", fontSize: "14px" }}>{latestScore}%</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                {isDone ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: "12px", padding: "7px 10px" }}
                      onClick={() => {
                        const past = getLatestAttemptForRole(role.id);
                        if (past) setReviewModalAttempt(past);
                      }}
                    >
                      Review
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1.3, fontSize: "12px", padding: "7px 10px", background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", color: "#fff" }}
                      onClick={() => handleInitiateAssessment(role)}
                    >
                      🔄 Do Again
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary full"
                    style={{ fontSize: "12px", padding: "8px 12px" }}
                    onClick={() => handleInitiateAssessment(role)}
                  >
                    Start Assessment →
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Confirmation Modal Before Starting Timed Test */}
      {confirmModalOpen && activeRole && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div className="card" style={{ maxWidth: "520px", width: "100%", padding: "28px", borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <span style={{ fontSize: "32px" }}>{activeRole.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "var(--ink)" }}>{activeRole.title} Assessment</h3>
                <small style={{ color: "#64748b" }}>{activeRole.category}</small>
              </div>
            </div>

            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                padding: "12px 14px",
                borderRadius: "9px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#92400e",
              }}
            >
              ⚠️ <strong>Strict 10-Minute Timer Notice:</strong>
              <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: "1.4" }}>
                This is a timed assessment. The countdown starts immediately at <strong>10:00</strong>. When the timer reaches zero, your answers are automatically submitted.
              </p>
            </div>

            <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "18px" }}>
              <div>• <strong>Format:</strong> Primarily fill-in-the-blank code/keyword completion + MCQs + scenarios.</div>
              <div>• <strong>Current Track:</strong> {roleMeta[activeRole.id]?.currentDifficulty || "Medium"} Adaptive Difficulty.</div>
              <div>• <strong>Scoring:</strong> Evaluated out of 100 marks with answer feedback.</div>
              <div>• <strong>Retakes:</strong> You can retake this assessment anytime via the <strong>Do Again</strong> button.</div>
            </div>

            {/* Question count toggle */}
            <div style={{ marginBottom: "22px", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
                Select Assessment Question Count:
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setQuestionCountConfig(30)}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: questionCountConfig === 30 ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: questionCountConfig === 30 ? "#e0e7ff" : "#fff",
                    color: questionCountConfig === 30 ? "#3730a3" : "#475569",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  30 Questions (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionCountConfig(40)}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: questionCountConfig === 40 ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                    background: questionCountConfig === 40 ? "#e0e7ff" : "#fff",
                    color: questionCountConfig === 40 ? "#3730a3" : "#475569",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  40 Questions (Extended)
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", color: "#fff" }}
                onClick={handleStartTimedAssessment}
              >
                Start Assessment (10:00) →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
