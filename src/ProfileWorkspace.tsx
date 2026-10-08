import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { saveStored, addStudentProject, useProjects, StudentProject } from "./app-data";
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
  about: "Computer Science student passionate about building useful, scalable web products. I enjoy turning complex problems into intuitive experiences and have hands-on experience across React, Node.js and Python.",
};
type Evidence = { title: string; detail: string; attachment: File; url: string };

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
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="workspace-modal" aria-label={title} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="modal-heading"><h2>{title}</h2><button type="button" aria-label="Close dialog" onClick={close}>×</button></div>{children}
  </dialog>;
}

export default function ProfileWorkspace({ focus, resume }: { focus: string; resume: (onFile: (file: File) => void) => ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("skillimprove-profile") || "null");
      return Object.fromEntries(Object.entries(defaultProfile).map(([key, value]) => [key, typeof saved?.[key] === "string" ? saved[key] : value])) as Profile;
    } catch { return defaultProfile; }
  });
  const [draft, setDraft] = useState(profile);
  const [modal, setModal] = useState<"edit" | "project" | "certificate" | null>(null);
  const allProjects = useProjects();
  const studentProjects = allProjects.filter(p => p.studentName === profile.name || !p.studentName || p.studentName === "Alex Johnson");
  const [certificates, setCertificates] = useState<Evidence[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const attachments = useRef<string[]>([]);
  useEffect(() => () => attachments.current.forEach(url => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (focus === "profile") return;
    const frame = requestAnimationFrame(() => document.getElementById(`profile-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [focus]);

  const open = (next: "edit" | "project" | "certificate") => { setDraft(profile); setError(""); setModal(next); };
  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const updated = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as Profile;
    if (!updated.name || !updated.degree || !updated.college || !updated.location || !updated.about) {
      setError("Please complete all required profile fields.");
      return;
    }
    try { saveStored("skillimprove-profile", updated); }
    catch { setError("Your browser could not save changes. Please try again."); return; }
    setProfile(updated);
    setModal(null);
    setNotice("Profile updated. Changes are saved in this browser.");
  };
  const uploadEvidence = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const detail = String(data.get("detail") || "").trim();
    if (!title || !detail) {
      setError("Please provide a name and description.");
      return;
    }
    const file = data.get("attachment");
    if (!(file instanceof File) || !file.size) { setError("Choose a file to upload."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Choose a file smaller than 10 MB."); return; }
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = modal === "certificate" ? ["pdf", "png", "jpg", "jpeg"] : ["pdf", "zip", "png", "jpg", "jpeg"];
    if (!allowed.includes(extension)) { setError("Unsupported file type. Use one of the formats listed below."); return; }
    const url = URL.createObjectURL(file);
    attachments.current.push(url);

    if (modal === "project") {
      const possibleTags = ["React", "Node.js", "Python", "TypeScript", "SQL", "Docker", "AWS", "Git", "Machine Learning", "JavaScript", "Next.js", "Tailwind CSS"];
      const detectedTags = possibleTags.filter(t => (title + " " + detail).toLowerCase().includes(t.toLowerCase()));
      const finalTags = detectedTags.length > 0 ? detectedTags : ["Engineering", "Web Application"];

      addStudentProject({
        studentName: profile.name,
        studentEmail: profile.email,
        college: profile.college,
        title,
        detail,
        tags: finalTags,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      });
      setNotice("Project added! Submitted to your college for verification. Industry recruiters can now view this project on your profile.");
    } else {
      const evidence = { title, detail, attachment: file, url };
      setCertificates(previous => [...previous, evidence]);
      setNotice("Certificate added with its attachment. Verification is pending.");
    }
    setModal(null);
  };
  const downloadResume = () => {
    if (resumeFile) {
      download(resumeFile, resumeFile.name);
      setNotice("Your uploaded resume has been downloaded.");
    } else {
      const text = `${profile.name}\n${profile.degree}\n${profile.college} · ${profile.location}\n${profile.email}\n${profile.linkedin}\n${profile.github}\n\nABOUT\n${profile.about}\n\nSKILLS\nReact, JavaScript, Python, SQL, Git\n\nPROJECTS\nAI-Based Student Career Recommendation System\n${studentProjects.map(project => `${project.title} — ${project.detail}`).join("\n")}\n\nCERTIFICATIONS\nAWS Cloud Practitioner\nMeta Front-End Developer\nPython Programming\n${certificates.map(certificate => `${certificate.title} — ${certificate.detail}`).join("\n")}`;
      download(new Blob([text], { type: "text/plain;charset=utf-8" }), `${profile.name.replace(/\s+/g, "_")}_Resume.txt`);
      setNotice("Profile resume downloaded as text. Upload a PDF or Word resume to download that original file instead.");
    }
  };

  const uploadedCards = (entries: Evidence[]) => entries.map((entry, index) => <div className="uploaded-evidence" key={`${entry.title}-${index}`}>
    <div><h3>{entry.title}</h3><p>{entry.detail}</p><span className="badge badge-orange">Pending verification</span></div>
    <a href={entry.url} download={entry.attachment.name} className="btn btn-secondary">Download attachment</a>
    <small>{entry.attachment.name} · {(entry.attachment.size / 1024).toFixed(1)} KB</small>
  </div>);

  return <>
    <div className="profile-hero">
      <div className="profile-avatar">{profile.name.split(" ").map(name => name[0]).join("").slice(0, 2)}</div>
      <div className="profile-info"><div><h2>{profile.name}</h2><span className="badge badge-green">Verified student</span></div><p>{profile.degree}</p><span>{profile.college} · {profile.location}</span><div className="profile-links"><span>{profile.email}</span><span>{profile.linkedin}</span><span>{profile.github}</span></div></div>
      <div className="profile-actions"><button className="btn btn-secondary" onClick={downloadResume}>Download resume</button><button className="btn btn-primary" onClick={() => open("edit")}>Edit profile</button></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}><span className="badge badge-green">✓ Verified Student</span><small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>2025 Cohort</small></div>
    </div>
    {notice && <div className="profile-notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    <div className="profile-layout">
      <div>
        <section className="card"><div className="section-title"><h2>About me</h2></div><p className="body-copy">{profile.about}</p></section>
        <div id="profile-skills"><div className="section-title"><div><h2>Verified skill evidence</h2><p>Skills backed by assessments, projects and credentials</p></div></div>
          <div className="evidence-list">{[["React", "Advanced", "91", "3"], ["JavaScript", "Advanced", "88", "4"], ["Python", "Intermediate", "82", "2"]].map(([name, level, score, count]) => <section className="card evidence-card" key={name}><div className="evidence-top"><div className="skill-logo">{name.slice(0, 2)}</div><div><h3>{name}</h3><span>{level}</span></div><span className="badge badge-green">Verified</span></div><div className="evidence-grid"><div><small>Assessment</small><strong>{score}%</strong></div><div><small>Projects</small><strong>{count}</strong></div><div><small>Certification</small><strong>1</strong></div></div><div className="confidence"><span><i /> High confidence</span><small>Active recently</small></div></section>)}</div>
          <SkillAnalyticsCharts />
        </div>
        <div id="profile-projects"><div className="section-title"><div><h2>Projects</h2><p>Show what you’ve built and attach supporting evidence.</p></div><button className="btn btn-secondary" onClick={() => open("project")}>Add project</button></div>
          {studentProjects.map((proj) => (
            <section className="card project-card" key={proj.id} style={{ marginBottom: "1rem" }}>
              <div className="project-cover">
                <span className={`badge ${proj.status === "verified" ? "badge-green" : "badge-orange"}`}>
                  {proj.status === "verified" ? "✓ Verified" : "Pending"}
                </span>
                <strong>{proj.tags[0] || "PROJECT"}</strong>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <span className="eyebrow">{proj.status === "verified" ? `VERIFIED BY ${proj.verifiedBy || "COLLEGE"}` : "STUDENT EVIDENCE"}</span>
                    <h3>{proj.title}</h3>
                  </div>
                  <span className={`badge ${proj.status === "verified" ? "badge-green" : "badge-orange"}`}>
                    {proj.status === "verified" ? "College Verified" : "Pending College Verification"}
                  </span>
                </div>
                <p>{proj.detail}</p>
                <div className="tag-row">
                  {proj.tags.map(tag => <span className="badge badge-gray" key={tag}>{tag}</span>)}
                </div>
                <div className="project-meta">
                  {proj.githubUrl && <span><small>CODE</small><a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7", textDecoration: "none" }}>GitHub</a></span>}
                  {proj.fileName && <span><small>ATTACHMENT</small>{proj.fileName}</span>}
                  <span><small>SUBMITTED</small>{proj.submittedAt}</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
      <div>
        <div id="profile-resume">{resume(setResumeFile)}</div>
        <div id="profile-certifications"><section className="card profile-section-card"><div className="section-title"><h2>Certifications</h2><button className="btn btn-secondary" onClick={() => open("certificate")}>Upload certificate</button></div>
          {[["AWS Cloud Practitioner", "Amazon Web Services"], ["Meta Front-End Developer", "Meta"], ["Python Programming", "University of Michigan"]].map(([title, organization]) => <div className="cert-row" key={title}><span>✓</span><div><strong>{title}</strong><small>{organization} · Verified</small></div></div>)}
          {uploadedCards(certificates)}
        </section></div>
        <section className="card"><div className="section-title"><h2>Experience</h2></div><div className="experience"><div className="company-logo">TN</div><div><strong>Software Developer Intern</strong><p>TechNova Solutions</p><small>May 2024 – Jul 2024 · 3 months</small><span className="badge badge-green">Industry verified</span></div></div></section>
      </div>
    </div>
    {modal && <Modal title={modal === "edit" ? "Edit your profile" : modal === "project" ? "Add a project" : "Upload a certificate"} close={() => setModal(null)}>
      {modal === "edit" ? <form onSubmit={saveProfile}><div className="form-grid">
        {(Object.keys(defaultProfile) as (keyof Profile)[]).map(key => <label key={key} className={key === "about" ? "wide" : ""}>{({ name: "Full name", degree: "Degree and year", college: "College", location: "Location", email: "Email address", linkedin: "LinkedIn", github: "GitHub", about: "About me" })[key]}
          {key === "about" ? <textarea required value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /> : <input required={key !== "linkedin" && key !== "github"} type={key === "email" ? "email" : "text"} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />}
        </label>)}
      </div>{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save changes</button></div></form> :
      <form onSubmit={uploadEvidence}><div className="form-grid">
        <label className="wide">{modal === "project" ? "Project name" : "Certification name"}<input name="title" required placeholder={modal === "project" ? "E-Commerce Web Application" : "AWS Cloud Practitioner"} /></label>
        <label className="wide">{modal === "project" ? "Description and technologies" : "Issuing organization and credential ID"}<textarea name="detail" required /></label>
        <label className="wide">Supporting file<input name="attachment" type="file" required accept={modal === "project" ? ".pdf,.zip,.png,.jpg,.jpeg" : ".pdf,.png,.jpg,.jpeg"} /></label>
      </div><p className="upload-help">{modal === "project" ? "PDF, ZIP or image" : "PDF or image"} · Up to 10 MB. Attachments are available while this profile is open and are not uploaded to a server. New evidence is unverified.</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">{modal === "project" ? "Add project" : "Upload certificate"}</button></div></form>}
    </Modal>}
  </>;
}
