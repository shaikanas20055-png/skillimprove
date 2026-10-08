import React, { useState } from "react";
import {
  ShortlistedCandidate,
  useShortlistedCandidates,
  exportShortlistedCandidatesToExcel,
  sendEmployeeRecruitmentOffer,
  OfferEmailPayload,
  defaultShortlistedCandidates,
  saveShortlistedCandidates,
} from "./recruiter-shortlist";
import { OfferSentModal } from "./OfferSentModal";
import { downloadStudentResume } from "./app-data";

interface ShortlistedCandidatesViewProps {
  navigate: (path: string) => void;
  openResumeModal?: (candidate: { candidateName: string; resumeFileName?: string; score?: number; college?: string }) => void;
}

export function ShortlistedCandidatesView({ navigate, openResumeModal }: ShortlistedCandidatesViewProps) {
  const { shortlisted, removeShortlist } = useShortlistedCandidates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [offerPayload, setOfferPayload] = useState<OfferEmailPayload | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const filtered = shortlisted.filter((c) => {
    const text = `${c.name} ${c.email} ${c.college} ${c.role} ${(c.skills || []).join(" ")}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const avgMatch =
    shortlisted.length > 0
      ? Math.round(shortlisted.reduce((acc, c) => acc + c.match, 0) / shortlisted.length)
      : 0;

  const avgReadiness =
    shortlisted.length > 0
      ? Math.round(shortlisted.reduce((acc, c) => acc + c.readiness, 0) / shortlisted.length)
      : 0;

  const handleDownloadExcel = () => {
    const ok = exportShortlistedCandidatesToExcel(shortlisted);
    if (ok) {
      triggerToast("📥 Excel sheet downloaded successfully with candidate names and email IDs!");
    }
  };

  const handleContactCandidate = (candidate: ShortlistedCandidate) => {
    const payload = sendEmployeeRecruitmentOffer({
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      college: candidate.college,
      company: candidate.company,
      match: candidate.match,
      readiness: candidate.readiness,
    });
    setOfferPayload(payload);
    triggerToast(`✉️ Redirected to email! Offer generated for ${candidate.name} (To: shaikanas20055@gmail)`);
  };

  const handleRestoreDefaults = () => {
    saveShortlistedCandidates(defaultShortlistedCandidates);
    triggerToast("Reset shortlisted candidates to verified default roster.");
  };

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              RECRUITER WORKSPACE
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Official Talent Roster</span>
          </div>
          <h2>Shortlisted Candidates & Excel Roster</h2>
          <p>
            Review all shortlisted students, export complete candidate details with names and verified email IDs to Microsoft Excel, or issue official employee job offers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleDownloadExcel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
              transition: "transform 0.15s ease",
            }}
            title="Download Excel spreadsheet containing shortlisted candidate names and email IDs"
          >
            <span style={{ fontSize: "16px" }}>📥</span>
            <span>Download Excel Sheet ({shortlisted.length})</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/industry/candidates")}
            style={{ padding: "10px 16px", fontSize: "13px" }}
          >
            Find more candidates
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="profile-notice" style={{ marginBottom: "16px" }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")}>×</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="kpi-grid four" style={{ marginBottom: "20px" }}>
        <div className="card kpi-card">
          <div className="icon-tile green">
            <span style={{ fontSize: "18px" }}>👥</span>
          </div>
          <div>
            <span>Shortlisted candidates</span>
            <strong>{shortlisted.length}</strong>
            <small>Ready for interview & offer</small>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="icon-tile purple">
            <span style={{ fontSize: "18px" }}>📊</span>
          </div>
          <div>
            <span>Average match score</span>
            <strong>{avgMatch}%</strong>
            <small>Across active requirements</small>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="icon-tile blue">
            <span style={{ fontSize: "18px" }}>⚡</span>
          </div>
          <div>
            <span>Average readiness</span>
            <strong>{avgReadiness}%</strong>
            <small>College verified evidence</small>
          </div>
        </div>
        <div className="card kpi-card">
          <div className="icon-tile green">
            <span style={{ fontSize: "18px" }}>📥</span>
          </div>
          <div>
            <span>Excel export format</span>
            <strong style={{ fontSize: "15px", color: "#10b981" }}>Names + Emails</strong>
            <small>UTF-8 BOM (.csv / .xls)</small>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
          background: "#ffffff",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search candidate name, email ID, skill, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              minHeight: "38px",
              padding: "0 12px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              fontSize: "13px",
              background: "#f8fafc",
            }}
          />
          {search && (
            <button
              className="btn btn-ghost"
              style={{ padding: "4px 8px", fontSize: "12px" }}
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>Status:</span>
          {["All", "Shortlisted", "Interview", "Selected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                border: "1px solid " + (statusFilter === st ? "#4f46e5" : "var(--line)"),
                background: statusFilter === st ? "#4f46e5" : "#ffffff",
                color: statusFilter === st ? "#ffffff" : "#475569",
                borderRadius: "7px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Shortlisted Candidates Roster */}
      {filtered.length === 0 ? (
        <div className="card empty-opportunities" style={{ padding: "40px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>📋</span>
          <h3>No shortlisted candidates found</h3>
          <p style={{ maxWidth: "480px", margin: "0 auto 16px", color: "#64748b" }}>
            {shortlisted.length === 0
              ? "You haven't shortlisted any candidates yet. You can shortlist candidates from Candidate Search or Matched Students."
              : "No candidates match your current search query or filter."}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {shortlisted.length === 0 ? (
              <button
                className="btn btn-primary"
                onClick={handleRestoreDefaults}
                style={{ padding: "8px 16px" }}
              >
                Load Sample Shortlisted Roster
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Reset Filters
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => navigate("/industry/candidates")}>
              Browse Candidates
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((candidate) => (
            <div
              key={candidate.id}
              className="card"
              style={{
                padding: "18px 22px",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                border: "1px solid var(--line)",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                {/* Candidate Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    className="table-avatar"
                    style={{
                      width: "48px",
                      height: "48px",
                      fontSize: "16px",
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      color: "#ffffff",
                      borderRadius: "12px",
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {candidate.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", color: "var(--ink)", fontWeight: 700 }}>
                        {candidate.name}
                      </h3>
                      <span
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        ✉️ {candidate.email}
                      </span>
                      <span
                        style={{
                          background: candidate.match >= 90 ? "#dcfce7" : "#e0e7ff",
                          color: candidate.match >= 90 ? "#15803d" : "#3730a3",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {candidate.match}% Match
                      </span>
                    </div>

                    <p style={{ margin: "4px 0 2px", fontSize: "13px", color: "#334155" }}>
                      Applied Role: <strong>{candidate.role}</strong> · {candidate.company}
                    </p>
                    <small style={{ color: "#64748b", fontSize: "12px" }}>
                      {candidate.college} · Readiness: <strong>{candidate.readiness}%</strong> · Shortlisted on:{" "}
                      {candidate.shortlistedDate}
                    </small>
                  </div>
                </div>

                {/* Score Rings & Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>ROLE MATCH</span>
                    <strong
                      style={{
                        fontSize: "20px",
                        color: candidate.match >= 90 ? "#10b981" : "#4f46e5",
                      }}
                    >
                      {candidate.match}%
                    </strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>READINESS</span>
                    <strong style={{ fontSize: "20px", color: "#0284c7" }}>{candidate.readiness}%</strong>
                  </div>
                </div>
              </div>

              {/* Skills Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <small style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, marginRight: "4px" }}>
                  VERIFIED SKILLS:
                </small>
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    📄 {candidate.resumeFileName || `${candidate.name.replace(/\s+/g, "_")}_Resume.pdf`}
                  </span>
                  {openResumeModal && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() =>
                        openResumeModal({
                          candidateName: candidate.name,
                          resumeFileName: candidate.resumeFileName,
                          score: candidate.readiness + 4,
                          college: candidate.college,
                        })
                      }
                    >
                      Preview Resume
                    </button>
                  )}
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => downloadStudentResume(candidate.name, candidate.resumeFileName)}
                  >
                    Download Resume
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Contact Candidate button - triggers email redirect with employee offer */}
                  <button
                    onClick={() => handleContactCandidate(candidate)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
                    }}
                    title="Send employment offer email to candidate (redirects to email: shaikanas20055@gmail)"
                  >
                    <span>✉️</span>
                    <span>Contact Candidate (Send Offer)</span>
                  </button>

                  <button
                    onClick={() => {
                      removeShortlist(candidate.id);
                      triggerToast(`Removed ${candidate.name} from shortlist.`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border: "1px solid #fca5a5",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="Remove candidate from shortlist roster"
                  >
                    <span>✕</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Sent Modal */}
      {offerPayload && <OfferSentModal payload={offerPayload} close={() => setOfferPayload(null)} />}
    </>
  );
}
