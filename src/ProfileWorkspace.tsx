import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import {
  saveStored,
  addStudentProject,
  updateStudentProject,
  deleteStudentProject,
  useProjects,
  StudentProject,
  useCertificates,
  addStudentCertificate,
  updateStudentCertificate,
  deleteStudentCertificate,
  StudentCertificate,
} from "./app-data";
import SkillAnalyticsCharts from "./SkillAnalyticsCharts";

type Profile = {
  name: string;
  degree: string;
  college: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  about: string;
};

const defaultProfile: Profile = {
  name: "Alex Johnson",
  degree: "B.Tech Computer Science · 4th Year",
  college: "ABC Institute of Technology",
  location: "Bengaluru, India",
  email: "alex.johnson@email.com",
  linkedin: "linkedin.com/in/alexjohnson",
  github: "github.com/alexj",
  about:
    "Computer Science student passionate about building useful, scalable web products. I enjoy turning complex problems into intuitive experiences and have hands-on experience across React, Node.js and Python.",
};

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="workspace-modal"
      aria-label={title}
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button type="button" aria-label="Close dialog" onClick={close}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function ProfileWorkspace({
  focus,
  navigate,
  resume,
}: {
  focus: string;
  navigate?: (path: string) => void;
  resume?: (onFile: (file: File) => void) => ReactNode;
}) {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("skillimprove-profile") || "null");
      return Object.fromEntries(
        Object.entries(defaultProfile).map(([key, value]) => [
          key,
          typeof saved?.[key] === "string" ? saved[key] : value,
        ])
      ) as Profile;
    } catch {
      return defaultProfile;
    }
  });

  const [draft, setDraft] = useState(profile);
  const [modal, setModal] = useState<"edit" | "project" | "certificate" | null>(null);
  const [editingProject, setEditingProject] = useState<StudentProject | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<StudentCertificate | null>(null);

  const allProjects = useProjects();
  const studentProjects = allProjects.filter(
    (p) => p.studentName === profile.name || !p.studentName || p.studentName === "Alex Johnson"
  );
  const certificates = useCertificates();

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const attachments = useRef<string[]>([]);

  useEffect(() => () => attachments.current.forEach((url) => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    if (focus === "profile") return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(`profile-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
    return () => cancelAnimationFrame(frame);
  }, [focus]);

  const open = (next: "edit" | "project" | "certificate") => {
    setDraft(profile);
    setError("");
    setModal(next);
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const updated = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()])
    ) as Profile;
    if (!updated.name || !updated.degree || !updated.college || !updated.location || !updated.about) {
      setError("Please complete all required profile fields.");
      return;
    }
    try {
      saveStored("skillimprove-profile", updated);
    } catch {
      setError("Your browser could not save changes. Please try again.");
      return;
    }
    setProfile(updated);
    setModal(null);
    setNotice("Profile updated. Changes are saved in this browser.");
  };

  // Add Project / Certificate Handler
  const uploadEvidence = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const detail = String(data.get("detail") || "").trim();
    const issuer = String(data.get("issuer") || "").trim();
    const issueDate = String(data.get("issueDate") || "").trim();
    const credentialId = String(data.get("credentialId") || "").trim();

    if (!title || !detail) {
      setError("Please provide a name and description.");
      return;
    }

    const file = data.get("attachment");

    if (modal === "project") {
      let fileName = "project_source.zip";
      let fileSize = "1.5 MB";
      if (file instanceof File && file.size > 0) {
        fileName = file.name;
        fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      }

      const possibleTags = [
        "React",
        "Node.js",
        "Python",
        "TypeScript",
        "SQL",
        "Docker",
        "AWS",
        "Git",
        "Machine Learning",
        "JavaScript",
        "Next.js",
        "Tailwind CSS",
      ];
      const detectedTags = possibleTags.filter((t) => (title + " " + detail).toLowerCase().includes(t.toLowerCase()));
      const finalTags = detectedTags.length > 0 ? detectedTags : ["Engineering", "Web Application"];

      addStudentProject({
        studentName: profile.name,
        studentEmail: profile.email,
        college: profile.college,
        title,
        detail,
        tags: finalTags,
        fileName,
        fileSize,
      });
      setNotice("Project added! Submitted for verification.");
      setModal(null);
    } else {
      // Certificate Upload: Process Image as picture preview
      if (file instanceof File && file.size > 0) {
        const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|svg)$/i.test(file.name);
        if (isImage) {
          const reader = new FileReader();
          reader.onload = () => {
            const imageUrl = String(reader.result || "");
            addStudentCertificate({
              studentName: profile.name,
              title,
              issuer: issuer || "Verified Organization",
              issueDate: issueDate || "Recently",
              credentialId: credentialId || undefined,
              description: detail,
              imageUrl,
              fileName: file.name,
            });
            setNotice("Certificate uploaded with picture preview!");
            setModal(null);
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      addStudentCertificate({
        studentName: profile.name,
        title,
        issuer: issuer || "Verified Organization",
        issueDate: issueDate || "Recently",
        credentialId: credentialId || undefined,
        description: detail,
        fileName: file instanceof File ? file.name : undefined,
      });
      setNotice("Certificate added successfully!");
      setModal(null);
    }
  };

  // Edit Project Handler
  const handleSaveEditProject = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const detail = String(form.get("detail") || "").trim();
    const githubUrl = String(form.get("githubUrl") || "").trim();
    const rawTags = String(form.get("tags") || "").trim();

    const tags = rawTags
      ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
      : editingProject.tags;

    updateStudentProject(editingProject.id, {
      title: title || editingProject.title,
      detail: detail || editingProject.detail,
      githubUrl: githubUrl || undefined,
      tags,
    });

    setNotice(`Project "${title || editingProject.title}" updated successfully.`);
    setEditingProject(null);
  };

  // Delete Project Handler
  const handleDeleteProject = (projId: string, projTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${projTitle}"?`)) {
      deleteStudentProject(projId);
      setNotice(`Project "${projTitle}" has been deleted.`);
    }
  };

  // Edit Certificate Handler
  const handleSaveEditCertificate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCertificate) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const issuer = String(form.get("issuer") || "").trim();
    const issueDate = String(form.get("issueDate") || "").trim();
    const credentialId = String(form.get("credentialId") || "").trim();
    const description = String(form.get("description") || "").trim();
    const file = form.get("picture");

    if (file instanceof File && file.size > 0 && (file.type.startsWith("image/") || /\.(png|jpe?g|webp|svg)$/i.test(file.name))) {
      const reader = new FileReader();
      reader.onload = () => {
        updateStudentCertificate(editingCertificate.id, {
          title: title || editingCertificate.title,
          issuer: issuer || editingCertificate.issuer,
          issueDate: issueDate || editingCertificate.issueDate,
          credentialId: credentialId || undefined,
          description: description || editingCertificate.description,
          imageUrl: String(reader.result || ""),
        });
        setNotice(`Certificate "${title}" updated with new picture!`);
        setEditingCertificate(null);
      };
      reader.readAsDataURL(file);
      return;
    }

    updateStudentCertificate(editingCertificate.id, {
      title: title || editingCertificate.title,
      issuer: issuer || editingCertificate.issuer,
      issueDate: issueDate || editingCertificate.issueDate,
      credentialId: credentialId || undefined,
      description: description || editingCertificate.description,
    });

    setNotice(`Certificate "${title}" updated successfully.`);
    setEditingCertificate(null);
  };

  // Delete Certificate Handler
  const handleDeleteCertificate = (certId: string, certTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the certificate "${certTitle}"?`)) {
      deleteStudentCertificate(certId);
      setNotice(`Certificate "${certTitle}" has been deleted.`);
    }
  };

  const downloadResume = () => {
    const text = `${profile.name}\n${profile.degree}\n${profile.college} · ${profile.location}\n${profile.email}\n${profile.linkedin}\n${profile.github}\n\nABOUT\n${profile.about}\n\nSKILLS\nReact, JavaScript, TypeScript, Python, SQL, Git\n\nPROJECTS\n${studentProjects.map((project) => `${project.title} — ${project.detail}`).join("\n")}\n\nCERTIFICATIONS\n${certificates.map((cert) => `${cert.title} (${cert.issuer}) — ${cert.description}`).join("\n")}`;
    download(new Blob([text], { type: "text/plain;charset=utf-8" }), `${profile.name.replace(/\s+/g, "_")}_Resume.txt`);
    setNotice("Resume text downloaded successfully.");
  };

  return (
    <>
      <div className="profile-hero">
        <div className="profile-avatar">
          {profile.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="profile-info">
          <div>
            <h2>{profile.name}</h2>
            <span className="badge badge-green">Verified student</span>
          </div>
          <p>{profile.degree}</p>
          <span>
            {profile.college} · {profile.location}
          </span>
          <div className="profile-links">
            <span>{profile.email}</span>
            <span>{profile.linkedin}</span>
            <span>{profile.github}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn btn-secondary" onClick={downloadResume}>
            Download resume
          </button>
          <button className="btn btn-primary" onClick={() => open("edit")}>
            Edit profile
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
          <span className="badge badge-green">✓ Verified Student</span>
          <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>2025 Cohort</small>
        </div>
      </div>

      {notice && (
        <div className="profile-notice" role="status" style={{ marginTop: "14px" }}>
          {notice}
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}

      <div className="profile-layout">
        <div>
          {/* About Me */}
          <section className="card">
            <div className="section-title">
              <h2>About me</h2>
            </div>
            <p className="body-copy">{profile.about}</p>
          </section>

          {/* Verified Skills */}
          <div id="profile-skills">
            <div className="section-title">
              <div>
                <h2>Verified skill evidence</h2>
                <p>Skills backed by assessments, projects and credentials</p>
              </div>
            </div>
            <div className="evidence-list">
              {[
                ["React", "Advanced", "91", "3"],
                ["JavaScript", "Advanced", "88", "4"],
                ["Python", "Intermediate", "82", "2"],
              ].map(([name, level, score, count]) => (
                <section className="card evidence-card" key={name}>
                  <div className="evidence-top">
                    <div className="skill-logo">{name.slice(0, 2)}</div>
                    <div>
                      <h3>{name}</h3>
                      <span>{level}</span>
                    </div>
                    <span className="badge badge-green">Verified</span>
                  </div>
                  <div className="evidence-grid">
                    <div>
                      <small>Assessment</small>
                      <strong>{score}%</strong>
                    </div>
                    <div>
                      <small>Projects</small>
                      <strong>{count}</strong>
                    </div>
                    <div>
                      <small>Certification</small>
                      <strong>1</strong>
                    </div>
                  </div>
                  <div className="confidence">
                    <span>
                      <i /> High confidence
                    </span>
                    <small>Active recently</small>
                  </div>
                </section>
              ))}
            </div>
            <SkillAnalyticsCharts />
          </div>

          {/* PROJECTS SECTION WITH EDIT & DELETE */}
          <div id="profile-projects" style={{ marginTop: "24px" }}>
            <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Projects ({studentProjects.length})</h2>
                <p>Show what you’ve built with verified evidence. You can add, edit, or delete projects anytime.</p>
              </div>
              <button className="btn btn-secondary" onClick={() => open("project")}>
                + Add project
              </button>
            </div>

            {studentProjects.map((proj) => (
              <section className="card project-card" key={proj.id} style={{ marginBottom: "1.25rem", position: "relative" }}>
                <div className="project-cover">
                  <span className={`badge ${proj.status === "verified" ? "badge-green" : "badge-orange"}`}>
                    {proj.status === "verified" ? "✓ Verified" : "Pending"}
                  </span>
                  <strong style={{ fontSize: "14px", letterSpacing: "0.5px" }}>{proj.tags[0] || "PROJECT"}</strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div>
                        <span className="eyebrow">
                          {proj.status === "verified"
                            ? `VERIFIED BY ${proj.verifiedBy || "COLLEGE"}`
                            : "STUDENT EVIDENCE"}
                        </span>
                        <h3 style={{ margin: "4px 0 8px" }}>{proj.title}</h3>
                      </div>
                      <span className={`badge ${proj.status === "verified" ? "badge-green" : "badge-orange"}`}>
                        {proj.status === "verified" ? "College Verified" : "Pending Verification"}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 10px", color: "#475569", fontSize: "13px", lineHeight: 1.6 }}>{proj.detail}</p>

                    <div className="tag-row" style={{ marginBottom: "12px" }}>
                      {proj.tags.map((tag) => (
                        <span className="badge badge-gray" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="project-meta">
                      {proj.githubUrl && (
                        <span>
                          <small>CODE</small>
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}
                          >
                            🔗 GitHub Repository
                          </a>
                        </span>
                      )}
                      {proj.fileName && (
                        <span>
                          <small>ATTACHMENT</small>
                          {proj.fileName}
                        </span>
                      )}
                      <span>
                        <small>SUBMITTED</small>
                        {proj.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* EDIT & DELETE ACTION BUTTONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                      paddingTop: "12px",
                      borderTop: "1px solid #f1f5f9",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingProject(proj)}
                      style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      ✏️ Edit Project
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* RESUME ANALYZER (ATS) PROMOTION CARD */}
          <section
            className="card"
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              color: "white",
              padding: "20px",
              borderRadius: "14px",
              marginBottom: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="badge badge-purple" style={{ padding: "3px 8px", fontSize: "10px", fontWeight: 700 }}>
                ⚡ ATS ENGINE
              </span>
              <span className="badge badge-green" style={{ padding: "3px 8px", fontSize: "10px" }}>
                Standalone Tool
              </span>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "white", fontWeight: 800 }}>
              Resume Analyzer (ATS)
            </h3>
            <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: "12px", lineHeight: 1.5 }}>
              Test your resume against real software engineering roles. Computes role-specific ATS match scores, detects missing core skills, and suggests target keywords.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
              onClick={() => {
                if (navigate) navigate("/student/resume-analyzer");
                else window.location.hash = "/student/resume-analyzer";
              }}
            >
              Open Resume Analyzer (ATS) →
            </button>
          </section>

          {/* CERTIFICATES SECTION WITH PICTURE & DESCRIPTION, EDIT & DELETE */}
          <div id="profile-certifications">
            <section className="card profile-section-card" style={{ padding: "20px" }}>
              <div
                className="section-title"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}
              >
                <div>
                  <h2 style={{ fontSize: "16px", margin: 0 }}>Certificates ({certificates.length})</h2>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>
                    Verified credentials with visual picture & description
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={() => open("certificate")} style={{ padding: "6px 12px", fontSize: "12px" }}>
                  + Upload certificate
                </button>
              </div>

              {/* Certificates Cards Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      overflow: "hidden",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Picture Banner */}
                    <div
                      style={{
                        position: "relative",
                        height: "120px",
                        background: cert.imageUrl
                          ? `url(${cert.imageUrl}) center/cover no-repeat`
                          : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {cert.imageUrl ? (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%)",
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "white", padding: "10px" }}>
                          <span style={{ fontSize: "32px", display: "block" }}>📜</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                            {cert.issuer}
                          </span>
                        </div>
                      )}

                      <span
                        className="badge badge-green"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          fontSize: "10px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        }}
                      >
                        ✓ {cert.status === "verified" ? "Verified" : "Pending"}
                      </span>

                      {cert.issueDate && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "10px",
                            fontSize: "10px",
                            color: "white",
                            fontWeight: 600,
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                          }}
                        >
                          Issued: {cert.issueDate}
                        </span>
                      )}
                    </div>

                    {/* Certificate Body (Description & Meta) */}
                    <div style={{ padding: "14px" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                        {cert.title}
                      </h4>
                      <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: 600, marginBottom: "6px" }}>
                        🏛️ {cert.issuer}
                      </div>

                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                        {cert.description}
                      </p>

                      {cert.credentialId && (
                        <div style={{ fontSize: "10px", color: "#64748b", background: "#f8fafc", padding: "4px 8px", borderRadius: "4px", marginBottom: "10px" }}>
                          <strong>Credential ID:</strong> {cert.credentialId}
                        </div>
                      )}

                      {/* EDIT & DELETE BUTTONS FOR CERTIFICATE */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "10px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingCertificate(cert)}
                          style={{ padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => handleDeleteCertificate(cert.id, cert.title)}
                          style={{ padding: "4px 10px", fontSize: "11px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Work Experience */}
          <section className="card" style={{ marginTop: "16px" }}>
            <div className="section-title">
              <h2>Experience</h2>
            </div>
            <div className="experience">
              <div className="company-logo">TN</div>
              <div>
                <strong>Software Developer Intern</strong>
                <p>TechNova Solutions</p>
                <small>May 2024 – Jul 2024 · 3 months</small>
                <span className="badge badge-green">Industry verified</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {modal === "edit" && (
        <Modal title="Edit your profile" close={() => setModal(null)}>
          <form onSubmit={saveProfile}>
            <div className="form-grid">
              {(Object.keys(defaultProfile) as (keyof Profile)[]).map((key) => (
                <label key={key} className={key === "about" ? "wide" : ""}>
                  {
                    ({
                      name: "Full name",
                      degree: "Degree and year",
                      college: "College",
                      location: "Location",
                      email: "Email address",
                      linkedin: "LinkedIn",
                      github: "GitHub",
                      about: "About me",
                    })[key]
                  }
                  {key === "about" ? (
                    <textarea
                      required
                      value={draft[key]}
                      onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                    />
                  ) : (
                    <input
                      required={key !== "linkedin" && key !== "github"}
                      type={key === "email" ? "email" : "text"}
                      value={draft[key]}
                      onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD PROJECT MODAL */}
      {modal === "project" && (
        <Modal title="Add a New Project" close={() => setModal(null)}>
          <form onSubmit={uploadEvidence}>
            <div className="form-grid">
              <label className="wide">
                Project Name
                <input name="title" required placeholder="E.g., AI Career Guidance Platform" />
              </label>
              <label className="wide">
                Description and Key Outcomes
                <textarea
                  name="detail"
                  required
                  placeholder="Explain architecture, technologies used (e.g., React, Node, Python), and quantifiable results..."
                />
              </label>
              <label className="wide">
                Supporting File / Source Code (ZIP, PDF, or image)
                <input name="attachment" type="file" accept=".pdf,.zip,.png,.jpg,.jpeg" />
              </label>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Project
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPLOAD CERTIFICATE MODAL */}
      {modal === "certificate" && (
        <Modal title="Upload Certificate" close={() => setModal(null)}>
          <form onSubmit={uploadEvidence}>
            <div className="form-grid">
              <label className="wide">
                Certificate Title
                <input name="title" required placeholder="E.g., AWS Certified Solutions Architect" />
              </label>
              <label>
                Issuing Organization
                <input name="issuer" required placeholder="E.g., Amazon Web Services (AWS), Meta, Google" />
              </label>
              <label>
                Issue Date
                <input name="issueDate" placeholder="E.g., October 2024" />
              </label>
              <label className="wide">
                Credential ID / URL (Optional)
                <input name="credentialId" placeholder="E.g., AWS-CLF-889104" />
              </label>
              <label className="wide">
                Description
                <textarea
                  name="detail"
                  required
                  placeholder="Key competencies proven, e.g. Cloud architecture, serverless microservices, security compliance..."
                />
              </label>
              <label className="wide">
                Certificate Picture / Document (Image or PDF)
                <input name="attachment" type="file" accept="image/*,.pdf" />
              </label>
            </div>
            <p className="upload-help" style={{ fontSize: "11px", color: "#64748b", margin: "8px 0" }}>
              Upload a picture (.png, .jpg) to show your certificate badge prominently with description.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Upload Certificate
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT EXISTING PROJECT MODAL */}
      {editingProject && (
        <Modal title={`Edit Project: ${editingProject.title}`} close={() => setEditingProject(null)}>
          <form onSubmit={handleSaveEditProject}>
            <div className="form-grid">
              <label className="wide">
                Project Name
                <input name="title" defaultValue={editingProject.title} required />
              </label>
              <label className="wide">
                Description
                <textarea name="detail" defaultValue={editingProject.detail} required rows={4} />
              </label>
              <label className="wide">
                Technologies / Tags (comma separated)
                <input name="tags" defaultValue={editingProject.tags.join(", ")} />
              </label>
              <label className="wide">
                GitHub Repository URL
                <input
                  name="githubUrl"
                  type="url"
                  defaultValue={editingProject.githubUrl || ""}
                  placeholder="https://github.com/..."
                />
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: "16px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingProject(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT EXISTING CERTIFICATE MODAL */}
      {editingCertificate && (
        <Modal title={`Edit Certificate: ${editingCertificate.title}`} close={() => setEditingCertificate(null)}>
          <form onSubmit={handleSaveEditCertificate}>
            <div className="form-grid">
              <label className="wide">
                Certificate Title
                <input name="title" defaultValue={editingCertificate.title} required />
              </label>
              <label>
                Issuing Organization
                <input name="issuer" defaultValue={editingCertificate.issuer} required />
              </label>
              <label>
                Issue Date
                <input name="issueDate" defaultValue={editingCertificate.issueDate || ""} />
              </label>
              <label className="wide">
                Credential ID (Optional)
                <input name="credentialId" defaultValue={editingCertificate.credentialId || ""} />
              </label>
              <label className="wide">
                Description
                <textarea name="description" defaultValue={editingCertificate.description} required rows={3} />
              </label>
              <label className="wide">
                Replace Picture (Optional)
                <input name="picture" type="file" accept="image/*" />
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: "16px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCertificate(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
