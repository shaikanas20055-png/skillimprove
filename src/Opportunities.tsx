import { FormEvent, useState } from "react";
import FeatureDialog from "./FeatureDialog";
import { addIndustryNotice, addStudentNotice, Application, APPLICATIONS_KEY, readStored, saveStored, Opportunity, useOpportunities } from "./app-data";

export default function Opportunities({ navigate }: { navigate: (path: string) => void }) {
  const opportunities = useOpportunities();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [details, setDetails] = useState<Opportunity | null>(null);
  const [applying, setApplying] = useState<Opportunity | null>(null);
  const [applications, setApplications] = useState<Application[]>(() => readStored(APPLICATIONS_KEY, []));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const hasApplied = (id: string) => applications.some(application => application.id === id);
  const filtered = opportunities.filter(job =>
    `${job.title} ${job.company} ${job.location} ${(job.skills || []).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!type || job.type === type) && (!mode || job.mode === mode) && (!location || job.location === location) && (!skill || (job.skills || []).includes(skill)));
  const startApply = (job: Opportunity) => { setDetails(null); setError(""); setApplying(job); };
  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applying) return;
    const stored = readStored<Application[]>(APPLICATIONS_KEY, []);
    if (stored.some(application => application.id === applying.id)) {
      setApplications(stored); setApplying(null); setMessage("You have already applied to this role."); return;
    }
    const studentProfile = readStored<{ name?: string; college?: string; degree?: string }>("skillimprove-profile", {});
    const studentName = studentProfile.name?.trim() || "Alex Johnson";
    const studentCollege = studentProfile.college?.trim() || "Apex Institute of Technology";
    const resumeScore = readStored<number>("skillimprove-resume-score", 88);
    const next: Application[] = [{
      id: applying.id,
      title: applying.title,
      company: applying.company,
      match: applying.match,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: "Applied",
      studentName,
      studentEmail: `${studentName.toLowerCase().replace(/\s+/g, ".")}@student.apex.edu`,
      studentCollege,
      readiness: 84,
      experience: "1 completed internship",
      resumeFileName: `${studentName.replace(/\s+/g, "_")}_Resume.pdf`,
      resumeScore,
      skills: applying.skills || ["React", "JavaScript", "Python", "SQL"],
      collegeVerified: true
    }, ...stored];
    try {
      saveStored(APPLICATIONS_KEY, next);
      addStudentNotice({ id: `application-${applying.id}`, title: `Application saved · ${applying.company}`, detail: `${applying.title} is now in your application tracker.`, path: "applications" });
      addIndustryNotice({ id: `applicant-${applying.id}-${Date.now()}`, title: `New applicant · ${studentName}`, detail: `${studentName} applied for ${applying.title} with verified resume.`, path: "applications" });
    } catch { setError("Could not save the application. Please check your browser storage and try again."); return; }
    setApplications(next);
    setMessage(`Application saved for ${applying.title} at ${applying.company}. Track its status in Applications.`);
    setApplying(null);
  };

  const getCleanRole = (title: string) => {
    return title.replace(/(\s+(Intern|Junior|Senior|Lead|Entry-Level|Associate))/gi, "").trim();
  };

  const goToQualifications = (jobTitle: string) => {
    const roleName = getCleanRole(jobTitle);
    navigate(`/student/recommendations?role=${encodeURIComponent(roleName)}`);
  };

  return <>
    <div className="welcome"><div><h2>Jobs & Internships</h2><p>Opportunities ranked by verified skills and career preferences.</p></div><span className="badge badge-green">{opportunities.length} recommended matches</span></div>
    <form className="job-search" onSubmit={event => { event.preventDefault(); setSearch(query); }}><div><input aria-label="Search opportunities" placeholder="Search roles, skills, companies or locations" value={query} onChange={event => setQuery(event.target.value)} /></div><button type="submit" className="btn btn-primary">Search opportunities</button></form>
    <div className="opportunity-filters">
      <label>Type<select value={type} onChange={event => setType(event.target.value)}><option value="">All opportunities</option><option>Internship</option><option>Full-time</option></select></label>
      <label>Work mode<select value={mode} onChange={event => setMode(event.target.value)}><option value="">All work modes</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
      <label>Location<select value={location} onChange={event => setLocation(event.target.value)}><option value="">All locations</option>{["Bengaluru", "Pune", "Remote", "Hyderabad"].map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Skill<select value={skill} onChange={event => setSkill(event.target.value)}><option value="">All skills</option>{["React", "JavaScript", "Python", "SQL", "Node.js", "Git", "CSS"].map(item => <option key={item}>{item}</option>)}</select></label>
      <button className="btn btn-ghost" onClick={() => { setQuery(""); setSearch(""); setType(""); setMode(""); setLocation(""); setSkill(""); }}>Clear filters</button>
    </div>
    {message && <div className="profile-notice" role="status"><span>{message}</span><button aria-label="Dismiss confirmation" onClick={() => setMessage("")}>×</button></div>}
    <div className="results-head"><span>{filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"} found{search && ` for “${search}”`}</span><button className="text-link" onClick={() => navigate("/student/applications")}>View my applications</button></div>
    <div className="jobs-layout"><div className="jobs-list">
      {!filtered.length && <section className="card empty-opportunities"><h3>No matching opportunities</h3><p>Try another keyword or clear your filters.</p><button className="btn btn-secondary" onClick={() => { setSearch(""); setQuery(""); setType(""); setMode(""); setLocation(""); setSkill(""); }}>Show all opportunities</button></section>}
      {filtered.map(job => (
        <section className="card job-card" key={job.id}>
          <div className="job-card-head">
            <div className="company-logo">{job.company.split(" ").map(word => word[0]).join("").slice(0, 2)}</div>
            <div>
              <h3>{job.title}</h3>
              <p>{job.company} · {job.location} · {job.mode}</p>
            </div>
            <span className={`badge ${job.match > 90 ? "badge-green" : "badge-blue"}`}>{job.match}% match</span>
          </div>
          <div className="job-details">
            <span>{job.type} · {job.duration}</span>
            <span>{job.pay}</span>
            <span>Rolling applications</span>
          </div>
          <div className="tag-row">
            {(job.skills || []).map(item => <span className="badge badge-gray" key={item}>{item}</span>)}
          </div>
          <div className="match-explain">
            <div>
              <strong>Skill Match: {job.match}%</strong>
              <p>Your {job.skills?.[0] || "core"} skills align with this role. Missing: <b>{job.missing || "Testing"}</b>.</p>
            </div>
          </div>
          <div className="job-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => goToQualifications(job.title)}
              title="See learning roadmap and requirements to become qualified"
            >
              See How to Become Qualified
            </button>
            <button className="btn btn-secondary" onClick={() => setDetails(job)}>View details</button>
            <button disabled={hasApplied(job.id)} className="btn btn-primary" onClick={() => startApply(job)}>
              {hasApplied(job.id) ? "Applied" : "Apply now"}
            </button>
          </div>
        </section>
      ))}
    </div><section className="card match-side"><h3>How matching works</h3><p>Your demo match score is based on:</p>{[["Required skills", "40%"], ["Projects", "25%"], ["Assessments", "15%"], ["Skill evidence", "10%"], ["Professional skills", "10%"]].map(([label, weight]) => <div key={label}><span>{label}</span><strong>{weight}</strong></div>)}</section></div>
    {details && <FeatureDialog title={details.title} close={() => setDetails(null)}>
      <span className="badge badge-green">{details.match}% match</span>
      <p className="opportunity-modal-copy">{details.company} · {details.location} · {details.mode}</p>
      <div className="opportunity-modal-metadata"><span>{details.type}</span><span>{details.duration}</span><span>{details.pay}</span></div>
      <h3>About the role</h3>
      <p className="opportunity-modal-copy">{details.description}</p>
      <h3>Required skills</h3>
      <div className="tag-row">{(details.skills || []).map(item => <span className="badge badge-blue" key={item}>{item}</span>)}</div>
      <h3 className="opportunity-subheading">Eligibility & Matching</h3>
      <p className="opportunity-modal-copy">Computer Science or related degree · 0–1 years of experience · Relevant project portfolio.</p>
      
      {/* Skill Gap & Qualification Guidance */}
      <div className="match-explain" style={{ background: "#f8fafd", border: "1px solid #dce4f5", padding: "14px", borderRadius: "10px", margin: "16px 0" }}>
        <div>
          <strong style={{ display: "block", color: "var(--ink)", marginBottom: "4px" }}>
            Student Match: {details.match}% · Skill Gaps: {details.missing || "Automated Testing"}
          </strong>
          <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "12px" }}>
            Don't worry if you have skill gaps. SkillImprove shows you the exact courses and projects to bridge the gap.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setDetails(null);
              goToQualifications(details.title);
            }}
          >
            See How to Become Qualified →
          </button>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={() => setDetails(null)}>Close</button>
        <button disabled={hasApplied(details.id)} className="btn btn-primary" onClick={() => startApply(details)}>{hasApplied(details.id) ? "Already applied" : "Apply now"}</button>
      </div>
    </FeatureDialog>}
    {applying && <FeatureDialog title="Confirm your application" close={() => setApplying(null)}><h3>{applying.title}</h3><p className="opportunity-modal-copy">{applying.company} · {applying.location}</p><form onSubmit={submitApplication}><label className="application-consent"><input type="checkbox" required />I agree to share my professional profile and verified skill evidence for this opportunity.</label><p className="upload-help">Demo mode: this saves an application in your browser. It does not send information to a real recruiter.</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setApplying(null)}>Cancel</button><button type="submit" className="btn btn-primary">Submit application</button></div></form></FeatureDialog>}
  </>;
}
