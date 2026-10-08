import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CareerRoleData,
  POPULAR_ROLES,
  PRESET_CAREER_ROLES,
  resolveJobRole,
  analyzeCareerRole,
  DEFAULT_STUDENT_SKILLS,
  SavedCareerGoal,
  INITIAL_CAREER_GOALS,
  CAREER_GOALS_KEY,
  ProficiencyLevel,
  SkillComparison
} from "./career-roles";
import { readStored, saveStored, useStudentName } from "./app-data";

type Props = {
  initialRoleQuery?: string;
  navigate: (path: string) => void;
};

export default function CareerRecommendations({ initialRoleQuery = "Data Analyst", navigate }: Props) {
  const studentName = useStudentName();
  const [searchInput, setSearchInput] = useState("");
  const [selectedRoleTitle, setSelectedRoleTitle] = useState(() => {
    // Check URL param if available
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role") || urlParams.get("job");
    return roleParam || initialRoleQuery;
  });

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const skillGapSectionRef = useRef<HTMLDivElement>(null);

  // Saved career goals
  const [savedGoals, setSavedGoals] = useState<SavedCareerGoal[]>(() =>
    readStored<SavedCareerGoal[]>(CAREER_GOALS_KEY, INITIAL_CAREER_GOALS)
  );

  // Modal states
  const [activeCourseModal, setActiveCourseModal] = useState<{
    title: string;
    skill: string;
    why: string;
    duration: string;
    priority: string;
    topics?: string[];
  } | null>(null);

  const [activeProjectModal, setActiveProjectModal] = useState<{
    title: string;
    skills: string[];
    why: string;
    deliverables: string[];
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string>("");

  // Student profile skills - read from profile storage or default
  const [studentSkills, setStudentSkills] = useState<Record<string, ProficiencyLevel>>(() => {
    const custom = readStored<Record<string, ProficiencyLevel>>("skillimprove-custom-skills", {});
    return { ...DEFAULT_STUDENT_SKILLS, ...custom };
  });

  // Resolve role data and run analysis
  const currentRoleData: CareerRoleData = useMemo(() => {
    return resolveJobRole(selectedRoleTitle);
  }, [selectedRoleTitle]);

  const analysis = useMemo(() => {
    return analyzeCareerRole(currentRoleData, studentSkills);
  }, [currentRoleData, studentSkills]);

  // Sync search input when role changes
  useEffect(() => {
    setSearchInput(currentRoleData.title);
  }, [currentRoleData.title]);

  // Autocomplete filter
  useEffect(() => {
    const trimmed = searchInput.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    const matches = POPULAR_ROLES.filter(r => r.toLowerCase().includes(trimmed));
    // Also include other presets if they match
    Object.values(PRESET_CAREER_ROLES).forEach(r => {
      if (!matches.includes(r.title) && r.title.toLowerCase().includes(trimmed)) {
        matches.push(r.title);
      }
    });

    setAutocompleteSuggestions(matches.slice(0, 6));
  }, [searchInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedRoleTitle(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  const selectRole = (role: string) => {
    setSelectedRoleTitle(role);
    setSearchInput(role);
    setShowSuggestions(false);
    // Smooth scroll down to overview
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const scrollToSkillGaps = () => {
    if (skillGapSectionRef.current) {
      skillGapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isRoleSaved = savedGoals.some(g => g.roleTitle.toLowerCase() === currentRoleData.title.toLowerCase());

  const handleSaveCareerGoal = () => {
    if (isRoleSaved) {
      // Remove
      const next = savedGoals.filter(g => g.roleTitle.toLowerCase() !== currentRoleData.title.toLowerCase());
      setSavedGoals(next);
      saveStored(CAREER_GOALS_KEY, next);
      showToast(`Removed "${currentRoleData.title}" from saved career goals.`);
    } else {
      const newGoal: SavedCareerGoal = {
        id: `goal-${Date.now()}`,
        roleTitle: currentRoleData.title,
        matchScore: analysis.overallMatch,
        readinessScore: analysis.currentReadiness,
        savedAt: "Saved today"
      };
      const next = [newGoal, ...savedGoals];
      setSavedGoals(next);
      saveStored(CAREER_GOALS_KEY, next);
      showToast(`Saved "${currentRoleData.title}" to your career goals!`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Simulate skill level improvement
  const handleUpgradeSkill = (skillName: string, targetLevel: ProficiencyLevel) => {
    const updated = { ...studentSkills, [skillName]: targetLevel };
    setStudentSkills(updated);
    saveStored("skillimprove-custom-skills", updated);
    showToast(`Updated ${skillName} level to ${targetLevel}. Re-calculating match & readiness!`);
  };

  return (
    <div className="career-recommendations-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="career-toast-notice" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* ========================================================
          1. STUDENT CAREER SEARCH COMPONENT
          ======================================================== */}
      <section className="career-search-hero">
        <div className="career-search-hero-content">
          <span className="eyebrow-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            EXPLORE ANY CAREER ROLE
          </span>
          <h1 className="career-search-title">What job do you want to become?</h1>
          <p className="career-search-subtitle">
            Search for a career role to discover the skills you need and get a personalized learning path.
          </p>

          <form onSubmit={handleSearchSubmit} className="career-search-bar-wrap" ref={searchContainerRef}>
            <div className="career-search-input-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search for a job role, e.g. Data Analyst, Frontend Developer, AI Engineer..."
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                aria-label="Job role search"
              />
              {searchInput && (
                <button
                  type="button"
                  className="clear-input-btn"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear input"
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary career-search-submit-btn">
              Search
            </button>

            {/* Autocomplete Dropdown */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div className="career-autocomplete-dropdown">
                {autocompleteSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    className="autocomplete-item"
                    onClick={() => selectRole(suggestion)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Search Examples */}
          <div className="career-try-examples">
            <span className="try-label">Examples:</span>
            {["Data Analyst", "Frontend Developer", "AI/ML Engineer"].map(example => (
              <button
                key={example}
                type="button"
                className="try-example-pill"
                onClick={() => selectRole(example)}
              >
                Try: {example}
              </button>
            ))}
          </div>

          {/* Popular Roles Quick Selector */}
          <div className="popular-roles-shelf">
            <span className="popular-roles-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Popular Career Roles:
            </span>
            <div className="popular-roles-list">
              {POPULAR_ROLES.map(role => {
                const isActive = currentRoleData.title.toLowerCase() === role.toLowerCase();
                return (
                  <button
                    key={role}
                    type="button"
                    className={`popular-role-pill ${isActive ? "active" : ""}`}
                    onClick={() => selectRole(role)}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          MY SAVED CAREER GOALS STRIP
          ======================================================== */}
      <section className="career-goals-strip card">
        <div className="career-goals-head">
          <div className="career-goals-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            <strong>My Career Goals</strong>
            <span className="badge badge-gray">{savedGoals.length} Tracked</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSaveCareerGoal}
          >
            {isRoleSaved ? "✓ Goal Saved" : "+ Add Current Role to Goals"}
          </button>
        </div>
        <div className="career-goals-chips">
          {savedGoals.map((goal, idx) => {
            const isCurrent = goal.roleTitle.toLowerCase() === currentRoleData.title.toLowerCase();
            return (
              <div
                key={goal.id}
                className={`career-goal-chip ${isCurrent ? "current" : ""}`}
                onClick={() => selectRole(goal.roleTitle)}
                role="button"
                tabIndex={0}
              >
                <div className="goal-chip-index">{idx + 1}</div>
                <div className="goal-chip-info">
                  <strong>{goal.roleTitle}</strong>
                  <div className="goal-chip-metrics">
                    <span className="chip-readiness">Readiness: <b>{goal.readinessScore}%</b></span>
                    <span className="chip-match">Match: <b>{goal.matchScore}%</b></span>
                  </div>
                </div>
                {isCurrent && <span className="current-badge">Active</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          2. JOB ROLE PAGE HEADER (TARGET CAREER)
          ======================================================== */}
      <section className="target-career-banner card">
        <div className="target-career-left">
          <div className="target-career-meta">
            <span className="target-career-badge">TARGET CAREER</span>
            <span className="badge badge-purple">{currentRoleData.category}</span>
            <span className="badge badge-green">Demand: {currentRoleData.marketDemand}</span>
          </div>
          <h2 className="target-career-name">{currentRoleData.title}</h2>
          <p className="target-career-desc">{currentRoleData.description}</p>
          <div className="target-career-details-row">
            <span><b>Salary Range:</b> {currentRoleData.averageSalary}</span>
            <span>·</span>
            <span><b>Analyzed for:</b> {studentName}</span>
          </div>
        </div>

        <div className="target-career-right">
          <div className="score-summary-box">
            <div className="score-summary-item">
              <span className="summary-label">Your Match</span>
              <div className="summary-metric match-color">
                <strong>{analysis.overallMatch}%</strong>
              </div>
              <small className="summary-sub">Skill compatibility</small>
            </div>
            <div className="score-divider" />
            <div className="score-summary-item">
              <span className="summary-label">Industry Readiness</span>
              <div className="summary-metric readiness-color">
                <strong>{analysis.currentReadiness}</strong>
                <span>/100</span>
              </div>
              <small className="summary-sub">Current benchmark</small>
            </div>
          </div>
          <div className="banner-action-buttons">
            <button type="button" className="btn btn-primary" onClick={scrollToSkillGaps}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
              View Skill Gaps
            </button>
            <button
              type="button"
              className={`btn ${isRoleSaved ? "btn-secondary" : "btn-dark"}`}
              onClick={handleSaveCareerGoal}
            >
              {isRoleSaved ? "Saved in Goals" : "+ Add Career Goal"}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. JOB ROLE REQUIREMENTS SECTION (JOB SPECIFICATION)
          ======================================================== */}
      <section className="role-requirements-section card job-specification-section">
        <div className="section-head-with-badge">
          <div>
            <span className="eyebrow job-spec-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              JOB SPECIFICATION
            </span>
            <h3>Required Skills for {currentRoleData.title}</h3>
            <p>Industry-benchmarked technical and practical requirements compiled from active employers.</p>
          </div>
          <span className="badge badge-blue">{currentRoleData.requiredSkills.length} Core Requirements</span>
        </div>

        <div className="skills-requirement-grid">
          {currentRoleData.requiredSkills.map(req => {
            const importanceTone = req.importance === "Critical" ? "red" : req.importance === "High" ? "purple" : "blue";
            return (
              <div key={req.name} className="skill-req-card job-spec-card">
                <div className="skill-req-head">
                  <div className="skill-req-icon-box">
                    {req.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4>{req.name}</h4>
                    <span className="skill-req-cat">{req.category}</span>
                  </div>
                  <span className={`badge badge-${importanceTone} skill-imp-badge`}>
                    {req.importance}
                  </span>
                </div>
                <div className="skill-req-level-bar">
                  <span className="level-label">Required Level:</span>
                  <strong className="level-val">{req.requiredLevel}</strong>
                </div>
                {req.description && <p className="skill-req-desc">{req.description}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. STUDENT VS ROLE COMPARISON ("Your Skill Match")
          ======================================================== */}
      <section className="skill-match-section card">
        <div className="section-head-with-badge">
          <div>
            <span className="eyebrow">PROFILE COMPARISON</span>
            <h3>Your Skill Match</h3>
            <p>Direct benchmark of your verified skills against the requirements for {currentRoleData.title}.</p>
          </div>
          <div className="match-pill-header">
            <span>Overall Match:</span>
            <strong>{analysis.overallMatch}%</strong>
          </div>
        </div>

        <div className="skill-match-table-container">
          <table className="skill-match-table">
            <thead>
              <tr>
                <th>SKILL</th>
                <th>STUDENT PROFILE</th>
                <th>REQUIRED LEVEL</th>
                <th>IMPORTANCE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {analysis.comparisons.map(comp => {
                const isReady = comp.status === "Ready";
                const isImprove = comp.status === "Improve";
                const isGap = comp.status === "Gap";

                return (
                  <tr key={comp.skill} className={`match-row status-${comp.status.toLowerCase()}`}>
                    <td className="skill-name-cell">
                      <strong>{comp.skill}</strong>
                    </td>
                    <td>
                      <span className={`student-level-tag level-${comp.studentLevel.toLowerCase()}`}>
                        {comp.studentLevel === "None" ? "No experience" : comp.studentLevel}
                      </span>
                    </td>
                    <td>
                      <span className="required-level-tag">
                        {comp.requiredLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${comp.importance === "High" ? "badge-purple" : "badge-gray"}`}>
                        {comp.importance}
                      </span>
                    </td>
                    <td>
                      {isReady && (
                        <span className="status-indicator ready">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          ✓ Ready
                        </span>
                      )}
                      {isImprove && (
                        <span className="status-indicator improve">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          ⚠ Improve
                        </span>
                      )}
                      {isGap && (
                        <span className="status-indicator gap">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          ❌ Gap
                        </span>
                      )}
                    </td>
                    <td>
                      {!isReady ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            const course = currentRoleData.recommendedCourses.find(c =>
                              c.skill.toLowerCase().includes(comp.skill.toLowerCase())
                            );
                            if (course) {
                              setActiveCourseModal({
                                title: course.title,
                                skill: course.skill,
                                why: course.why,
                                duration: course.estimatedDuration,
                                priority: course.priority,
                                topics: course.keyTopics
                              });
                            } else {
                              handleUpgradeSkill(comp.skill, comp.requiredLevel);
                            }
                          }}
                        >
                          Learn Skill →
                        </button>
                      ) : (
                        <span className="verified-text">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="match-legend">
          <span><b className="legend-dot green" /> ✓ Ready: Meets or exceeds role requirement</span>
          <span><b className="legend-dot orange" /> ⚠ Improve: Prior knowledge, needs depth</span>
          <span><b className="legend-dot red" /> ❌ Gap: Required skill currently missing</span>
        </div>
      </section>

      {/* ========================================================
          5. SKILL GAP SECTION & READINESS IMPACT
          ======================================================== */}
      <section className="skill-gap-and-readiness-row" ref={skillGapSectionRef}>
        {/* Left: Skill Gaps */}
        <div className="card skill-gap-highlight-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">TARGETED DEFICIENCIES</span>
              <h3>Your Skill Gap</h3>
            </div>
            <span className="badge badge-orange">
              {analysis.missingSkills.length + analysis.improvingSkills.length} Skills to Bridge
            </span>
          </div>

          <p className="gap-intro">
            You are missing or need to improve the following key competencies for <strong>{currentRoleData.title}</strong>:
          </p>

          <div className="gap-pill-list">
            {analysis.missingSkills.map(gap => (
              <div key={gap.skill} className="gap-callout-pill red-border">
                <span className="dot red-dot" />
                <div className="gap-callout-main">
                  <strong>🔴 {gap.skill}</strong>
                  <div className="gap-level-comparison">
                    <span>Current: <em>No experience</em></span>
                    <span className="arrow">→</span>
                    <span>Required: <b>{gap.requiredLevel}</b></span>
                  </div>
                </div>
                <span className="badge badge-red">{gap.importance} Priority</span>
              </div>
            ))}

            {analysis.improvingSkills.map(gap => (
              <div key={gap.skill} className="gap-callout-pill orange-border">
                <span className="dot orange-dot" />
                <div className="gap-callout-main">
                  <strong>🟠 {gap.skill}</strong>
                  <div className="gap-level-comparison">
                    <span>Current: <em>{gap.studentLevel}</em></span>
                    <span className="arrow">→</span>
                    <span>Required: <b>{gap.requiredLevel}</b></span>
                  </div>
                </div>
                <span className="badge badge-orange">Improve Level</span>
              </div>
            ))}

            {analysis.missingSkills.length === 0 && analysis.improvingSkills.length === 0 && (
              <div className="gap-empty-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <strong>No critical skill gaps detected!</strong>
                <p>Your current profile meets all core requirements. You can focus on portfolio projects and technical assessments.</p>
              </div>
            )}
          </div>

          {/* Core Philosophy Callout */}
          <div className="skillimprove-core-banner">
            <div className="core-banner-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <div>
              <strong>You are {analysis.overallMatch}% ready for this role.</strong>
              <p>
                Complete the recommended learning path to close your remaining skill gaps and build verified evidence. SkillImprove exists to help you <em>become</em> qualified.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Career Readiness Growth */}
        <div className="card readiness-growth-card">
          <span className="eyebrow">ESTIMATED IMPACT</span>
          <h3>Your Industry Readiness</h3>
          <p className="readiness-sub">
            How your readiness score will advance as you finish the curated learning roadmap.
          </p>

          <div className="readiness-visual-comparison">
            <div className="readiness-stat-box current">
              <span className="stat-label">Current Readiness</span>
              <div className="stat-value">
                <strong>{analysis.currentReadiness}</strong>
                <span>/100</span>
              </div>
              <div className="progress">
                <span className="fill orange" style={{ width: `${analysis.currentReadiness}%` }} />
              </div>
              <small>Based on your current portfolio</small>
            </div>

            <div className="readiness-growth-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              <span>+{analysis.potentialReadiness - analysis.currentReadiness} pts</span>
            </div>

            <div className="readiness-stat-box potential">
              <span className="stat-label">Potential Readiness</span>
              <div className="stat-value green-text">
                <strong>{analysis.potentialReadiness}</strong>
                <span>/100</span>
              </div>
              <div className="progress">
                <span className="fill green" style={{ width: `${analysis.potentialReadiness}%` }} />
              </div>
              <small className="estimated-note">
                Estimated readiness after completing the recommended learning path.
              </small>
            </div>
          </div>

          <div className="readiness-disclaimer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p>
              Completing courses guides your learning. To officially unlock score increases, you will submit project evidence and take skill assessments for college and industry verification.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. AI EXPLANATION PANEL
          ======================================================== */}
      <section className="ai-explanation-card card">
        <div className="ai-explanation-header">
          <div className="ai-badge-group">
            <span className="badge badge-purple">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              AI ADVISORY INSIGHT
            </span>
            <h3>Why are these recommendations shown?</h3>
          </div>
        </div>
        <div className="ai-explanation-body">
          <p className="ai-explanation-text">
            {analysis.aiExplanation}
          </p>
        </div>
      </section>

      {/* ========================================================
          7. PERSONALIZED LEARNING PATH (STEP-BY-STEP)
          ======================================================== */}
      <section className="learning-path-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">ORDERED SEQUENCE</span>
            <h2>Recommended Learning Path for {currentRoleData.title}</h2>
            <p>Personalized step-by-step roadmap tailored specifically to your existing proficiencies.</p>
          </div>
          <span className="badge badge-blue">{analysis.recommendedSteps.length} Sequential Steps</span>
        </div>

        <div className="learning-sequence-steps">
          {analysis.recommendedSteps.map((step, idx) => {
            const isLast = idx === analysis.recommendedSteps.length - 1;
            const isCapstone = step.type === "project";

            return (
              <div key={step.stepNumber} className={`step-timeline-item ${isCapstone ? "capstone-step" : ""}`}>
                <div className="step-timeline-indicator">
                  <div className={`step-circle ${isCapstone ? "capstone" : ""}`}>
                    {isCapstone ? "★" : step.stepNumber}
                  </div>
                  {!isLast && <div className="step-connector-line" />}
                </div>

                <div className="step-card card">
                  <div className="step-card-header">
                    <div className="step-meta">
                      <span className="step-counter-tag">
                        {isCapstone ? "CAPSTONE STEP" : `STEP ${step.stepNumber}`}
                      </span>
                      <span className={`badge ${step.priority === "HIGH" ? "badge-red" : step.priority === "CAPSTONE" ? "badge-purple" : "badge-orange"}`}>
                        {step.priority} PRIORITY
                      </span>
                      <span className="step-duration">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {step.estimatedTime}
                      </span>
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                  </div>

                  <div className="step-skills-status">
                    <span className="step-skill-label">Target Skill: <b>{step.skill}</b></span>
                    <span className="step-skill-bracket">
                      Current: <em>{step.currentLevel}</em> → Required: <strong>{step.requiredLevel}</strong>
                    </span>
                  </div>

                  <div className="step-why-box">
                    <strong>Why:</strong>
                    <p>"{step.why}"</p>
                  </div>

                  {step.details && (
                    <div className="step-curriculum-chips">
                      <small>Key Modules & Objectives:</small>
                      <div className="chip-row">
                        {step.details.map((item, i) => (
                          <span key={i} className="curriculum-chip">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="step-footer-action">
                    <button
                      type="button"
                      className={`btn ${isCapstone ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => {
                        if (isCapstone) {
                          setActiveProjectModal({
                            title: step.title,
                            skills: step.skill.split(", "),
                            why: step.why,
                            deliverables: step.details || []
                          });
                        } else {
                          setActiveCourseModal({
                            title: step.title,
                            skill: step.skill,
                            why: step.why,
                            duration: step.estimatedTime,
                            priority: step.priority,
                            topics: step.details
                          });
                        }
                      }}
                    >
                      {isCapstone ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          Start Capstone Project
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          Start Learning
                        </>
                      )}
                    </button>
                    <span className="step-track-note">
                      {isCapstone ? "Builds portfolio evidence for recruiters" : "Interactive guided coursework + self-check"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          8. RECOMMENDED PRACTICAL PROJECTS
          ======================================================== */}
      <section className="practical-projects-section card">
        <div className="section-head-with-badge">
          <div>
            <span className="eyebrow">PORTFOLIO EVIDENCE</span>
            <h3>Recommended Practical Projects for {currentRoleData.title}</h3>
            <p>Industry recruiters require tangible code and dashboard artifacts rather than self-reported claims.</p>
          </div>
          <span className="badge badge-green">Recruiter Verified</span>
        </div>

        <div className="projects-grid">
          {currentRoleData.recommendedProjects.map(proj => (
            <div key={proj.id} className="project-recommendation-card">
              <div className="proj-card-top">
                <span className="badge badge-purple">{proj.difficulty} Project</span>
                <span className="proj-time">{proj.estimatedTime}</span>
              </div>
              <h4 className="proj-card-title">{proj.title}</h4>

              <div className="proj-skills-row">
                <small>Skills Practiced:</small>
                <div className="proj-skill-badges">
                  {proj.skills.map(s => (
                    <span key={s} className="badge badge-blue">{s}</span>
                  ))}
                </div>
              </div>

              <div className="proj-reason-box">
                <strong>Why this project:</strong>
                <p>"{proj.why}"</p>
              </div>

              <div className="proj-deliverables-list">
                <small>Expected Artifacts:</small>
                <ul>
                  {proj.deliverables.map((deliv, i) => (
                    <li key={i}>{deliv}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm full"
                onClick={() => setActiveProjectModal({
                  title: proj.title,
                  skills: proj.skills,
                  why: proj.why,
                  deliverables: proj.deliverables
                })}
              >
                Start Project & Upload Evidence
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          9. CAREER ROADMAP VISUALIZATION
          ======================================================== */}
      <section className="career-roadmap-visual-card card">
        <div className="roadmap-header">
          <span className="eyebrow">THE SKILLIMPROVE SUCCESS LOOP</span>
          <h3>How SkillImprove Helps You Become Qualified</h3>
          <p>
            Unlike traditional platforms that simply reject candidates with "You are not qualified", SkillImprove provides the bridge from where you are today to where hiring companies need you to be.
          </p>
        </div>

        <div className="pipeline-flow-diagram">
          {[
            { step: "START", sub: "Explore Career", color: "blue" },
            { step: "Current Skills", sub: "Benchmark Profile", color: "blue" },
            { step: "Skill Gap", sub: "Identify Differences", color: "orange" },
            { step: "Learning", sub: "Targeted Modules", color: "purple" },
            { step: "Practice", sub: "Interactive Labs", color: "purple" },
            { step: "Assessment", sub: "Verify Competence", color: "blue" },
            { step: "Project Evidence", sub: "Portfolio Artifacts", color: "green" },
            { step: "Re-assessment", sub: "Updated Scoring", color: "green" },
            { step: "Industry Ready", sub: "Score 85+ / 100", color: "green" },
            { step: "Apply for Jobs", sub: "Direct Placement", color: "green" }
          ].map((item, idx, arr) => (
            <React.Fragment key={item.step}>
              <div className={`pipeline-node node-${item.color}`}>
                <div className="node-number">{idx + 1}</div>
                <strong>{item.step}</strong>
                <small>{item.sub}</small>
              </div>
              {idx < arr.length - 1 && (
                <div className="pipeline-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ========================================================
          COURSE PREVIEW / STUDY MODAL
          ======================================================== */}
      {activeCourseModal && (
        <div className="workspace-modal wide-modal open" role="dialog" aria-modal="true">
          <div className="modal-heading">
            <div>
              <span className="eyebrow">{activeCourseModal.priority} PRIORITY LEARNING</span>
              <h2>{activeCourseModal.title}</h2>
            </div>
            <button type="button" onClick={() => setActiveCourseModal(null)} aria-label="Close">×</button>
          </div>

          <div className="modal-course-body">
            <div className="modal-meta-row">
              <span className="badge badge-purple">Skill: {activeCourseModal.skill}</span>
              <span className="badge badge-blue">Duration: {activeCourseModal.duration}</span>
              <span className="badge badge-green">Self-Paced with Labs</span>
            </div>

            <div className="modal-why-quote">
              <strong>Why this is recommended for {currentRoleData.title}:</strong>
              <p>{activeCourseModal.why}</p>
            </div>

            <h4>Core Curriculum Syllabus</h4>
            <div className="modal-syllabus-list">
              {(activeCourseModal.topics || [
                "Module 1: Syntax & Core Foundation",
                "Module 2: Practical Application & Data Manipulation",
                "Module 3: Edge Cases, Performance & Testing",
                "Module 4: End-of-Course Certification Challenge"
              ]).map((topic, i) => (
                <div key={i} className="syllabus-item">
                  <span className="mod-idx">{i + 1}</span>
                  <div>
                    <strong>{topic}</strong>
                    <small>Interactive exercises + knowledge check</small>
                  </div>
                  <span className="syllabus-status">Ready</span>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveCourseModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleUpgradeSkill(activeCourseModal.skill, "Intermediate");
                  setActiveCourseModal(null);
                  showToast(`Enrolled in "${activeCourseModal.title}"! Course added to your active learning queue.`);
                }}
              >
                Enroll & Start First Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PROJECT DETAILS MODAL
          ======================================================== */}
      {activeProjectModal && (
        <div className="workspace-modal wide-modal open" role="dialog" aria-modal="true">
          <div className="modal-heading">
            <div>
              <span className="eyebrow">PRACTICAL PROJECT BRIEF</span>
              <h2>{activeProjectModal.title}</h2>
            </div>
            <button type="button" onClick={() => setActiveProjectModal(null)} aria-label="Close">×</button>
          </div>

          <div className="modal-project-body">
            <div className="tag-row" style={{ marginBottom: "1rem" }}>
              {activeProjectModal.skills.map(s => (
                <span key={s} className="badge badge-blue">{s}</span>
              ))}
            </div>

            <div className="modal-why-quote">
              <strong>Recruiter Demonstration Value:</strong>
              <p>{activeProjectModal.why}</p>
            </div>

            <h4>Required Project Deliverables</h4>
            <ul className="project-brief-checklist">
              {activeProjectModal.deliverables.map((deliv, i) => (
                <li key={i}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>{deliv}</span>
                </li>
              ))}
            </ul>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveProjectModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setActiveProjectModal(null);
                  navigate("/student/profile#projects");
                }}
              >
                Go to Projects to Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
