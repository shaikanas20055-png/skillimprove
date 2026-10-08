import { ChangeEvent, DragEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import logoImg from "./assets/logo.png";
import ProfileWorkspace from "./ProfileWorkspace";
import Assessments from "./Assessments";
import Opportunities from "./Opportunities";
import FeatureDialog from "./FeatureDialog";
import CareerRecommendations from "./CareerRecommendations";
import {
  Application,
  APPLICATIONS_KEY,
  DATA_EVENT,
  getNotices,
  Notice,
  noticeKey,
  readStored,
  saveStored,
  useStudentName,
  useProjects,
  verifyStudentProject,
  getPrograms,
  addCustomProgram,
  getConnections,
  addConnection,
  StudentProject,
  CustomProgram,
  IndustryConnection,
  Opportunity,
  useOpportunities,
  addOpportunity,
  addStudentNotice,
  downloadStudentResume,
} from "./app-data";
import { CandidateFilters, filterCandidates } from "./candidate-data";
import { evaluateResumeFile, evaluateResumeText, ResumeAnalysisResult } from "./resume-evaluator";

type Role = "student" | "industry" | "college";
type IconName =
  | "grid"
  | "user"
  | "spark"
  | "chart"
  | "book"
  | "briefcase"
  | "search"
  | "users"
  | "building"
  | "settings"
  | "bell"
  | "check"
  | "arrow"
  | "menu"
  | "logout"
  | "plus"
  | "file";

const roleConfig = {
  student: {
    label: "Student",
    name: "Alex Johnson",
    email: "student@skillimprove.com",
    password: "Student@123",
    initials: "AJ",
  },
  industry: {
    label: "Industry",
    name: "TechNova Solutions",
    email: "industry@skillimprove.com",
    password: "Industry@123",
    initials: "TN",
  },
  college: {
    label: "College",
    name: "ABC Institute of Technology",
    email: "college@skillimprove.com",
    password: "College@123",
    initials: "AI",
  },
};

const navigation: Record<Role, { label: string; icon: IconName; path: string }[]> = {
  student: [
    { label: "Dashboard", icon: "grid", path: "dashboard" },
    { label: "My Profile", icon: "user", path: "profile" },
    { label: "Skill Assessment", icon: "file", path: "assessment" },
    { label: "Learning Recommendations", icon: "book", path: "recommendations" },
    { label: "Jobs & Internships", icon: "search", path: "jobs" },
    { label: "Applications", icon: "briefcase", path: "applications" },
  ],
  industry: [
    { label: "Dashboard", icon: "grid", path: "dashboard" },
    { label: "Post Opportunity", icon: "plus", path: "post" },
    { label: "Opportunities", icon: "briefcase", path: "opportunities" },
    { label: "Candidate Search", icon: "search", path: "candidates" },
    { label: "Recommended", icon: "spark", path: "recommended" },
    { label: "Applications", icon: "file", path: "applications" },
    { label: "Skill Demand", icon: "chart", path: "skill-demand" },
  ],
  college: [
    { label: "Dashboard", icon: "grid", path: "dashboard" },
    { label: "Students", icon: "users", path: "students" },
    { label: "Verify Projects", icon: "check", path: "verify-projects" },
    { label: "Student Skills", icon: "spark", path: "student-skills" },
    { label: "Training Programs", icon: "book", path: "training" },
    { label: "Industry Connections", icon: "briefcase", path: "connections" },
    { label: "Placement Analytics", icon: "chart", path: "placements" },
  ],
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    spark: <path d="m12 3 1.7 4.7L18 10l-4.3 2.3L12 17l-1.7-4.7L6 10l4.3-2.3L12 3Zm6 13 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" />,
    chart: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2" /></>,
    book: <><path d="M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2V5Zm16 0a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2V5Z" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18" /></>,
    search: <><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.8M16 3.2a4 4 0 0 1 0 7.6" /></>,
    building: <><path d="M3 21h18M6 21V4h12v17M9 8h2m2 0h2m-6 4h2m2 0h2m-6 4h2m2 0h2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    file: <><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6m-6 4h6" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  disabled = false,
  style,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return <button type={type} onClick={onClick} disabled={disabled} style={style} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`logo ${dark ? "logo-dark" : ""}`}>
      <span className="logo-mark">
        <img src={logoImg} alt="SkillImprove Logo" className="logo-img" />
      </span>
      <span>Skill<span>Improve</span></span>
    </div>
  );
}

function Badge({ children, tone = "blue", style }: { children: ReactNode; tone?: "blue" | "green" | "orange" | "red" | "gray" | "purple"; style?: React.CSSProperties }) {
  return <span className={`badge badge-${tone}`} style={style}>{children}</span>;
}

function Progress({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "orange" | "red" }) {
  return <div className="progress"><span className={`fill ${tone}`} style={{ width: `${value}%` }} /></div>;
}

function ScoreRing({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  return <div className={`score-ring ${size}`} style={{ "--score": score } as React.CSSProperties}><div><strong>{score}</strong><span>/100</span></div></div>;
}

function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`card ${className}`} style={style}>{children}</section>;
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

function MiniChart({ values, labels, color = "blue" }: { values: number[]; labels: string[]; color?: "blue" | "purple" | "green" }) {
  return <div className="mini-chart">{values.map((v, i) => <div className="bar-col" key={labels[i]}><div className={`bar ${color}`} style={{ height: `${v}%` }}><span>{v}%</span></div><small>{labels[i]}</small></div>)}</div>;
}

function Landing({ navigate }: { navigate: (path: string) => void }) {
  const features = ["Skill Assessment", "Verified Skill Evidence", "Industry Readiness Score", "AI Skill Gap Analysis", "Intelligent Job Matching", "College Skill Analytics"];
  return <div className="landing">
    <div className="public-nav-wrapper"><nav className="public-nav"><Logo dark /><div className="public-links"><a href="#how">How it works</a><a href="#features">Features</a><a href="#ecosystem">Ecosystem</a></div><Button onClick={() => navigate("/login")}>Sign in <Icon name="arrow" size={16} /></Button></nav></div>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="blue"><Icon name="spark" size={14} /> AI-powered career readiness</Badge>
          <h1>Build Skills. Prove Skills.<br /><span>Get Industry Ready.</span></h1>
          <p>SkillImprove connects students, colleges and industry through skill assessment, verified evidence, personalized improvement paths and intelligent opportunity matching.</p>
          <div className="hero-actions"><Button onClick={() => navigate("/login")}>Get Started <Icon name="arrow" size={17} /></Button><Button variant="secondary" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Explore Platform</Button></div>
          <div className="trust-row"><span><Icon name="check" size={15} /> Evidence-based profiles</span><span><Icon name="check" size={15} /> Explainable AI</span><span><Icon name="check" size={15} /> Built for outcomes</span></div>
        </div>
        <div className="hero-visual">
          <div className="preview-window">
            <div className="preview-top"><div className="preview-dots"><i /><i /><i /></div><span>Career readiness overview</span><Badge tone="green">Live</Badge></div>
            <div className="preview-body">
              <div className="preview-side"><Logo dark /><span className="active"><Icon name="grid" /> Overview</span><span><Icon name="spark" /> Skills</span><span><Icon name="chart" /> Skill gaps</span><span><Icon name="briefcase" /> Opportunities</span></div>
              <div className="preview-main"><span className="eyebrow">{getTimeGreeting().toUpperCase()}, ALEX</span><h3>Your readiness is looking strong</h3><div className="preview-grid"><div className="preview-score"><ScoreRing score={82} size="small" /><div><Badge tone="green">Industry Ready</Badge><small>+6 points this month</small></div></div><div className="preview-stat"><span>Skill gap</span><strong>3</strong><small>skills to improve</small></div><div className="preview-stat"><span>Job matches</span><strong>24</strong><small>up to 94% match</small></div></div><div className="preview-course"><div className="icon-tile purple"><Icon name="book" /></div><div><small>AI RECOMMENDED NEXT</small><strong>Advanced React Development</strong><Progress value={68} /></div><Badge tone="purple">4 weeks</Badge></div></div>
            </div>
          </div>
          <div className="float-card float-left"><span className="success-icon"><Icon name="check" /></span><div><strong>Skill verified</strong><small>React · Advanced</small></div></div>
          <div className="float-card float-right"><span className="spark-icon"><Icon name="spark" /></span><div><strong>92% match</strong><small>Frontend Intern</small></div></div>
        </div>
      </section>

      <section className="benefits" id="ecosystem"><span className="eyebrow">ONE CONNECTED ECOSYSTEM</span><SectionTitle title="Better outcomes for everyone" subtitle="Real skill data connects every part of the education-to-employment journey." /><div className="benefit-grid">
        <Card className="benefit-card student"><div className="benefit-icon"><Icon name="user" size={26} /></div><Badge tone="blue">FOR STUDENTS</Badge><h3>Turn potential into proof.</h3><p>Discover your strengths, close skill gaps and build a professional profile backed by real evidence.</p><a onClick={() => navigate("/login?role=student")}>Explore student experience <Icon name="arrow" size={16} /></a></Card>
        <Card className="benefit-card industry"><div className="benefit-icon"><Icon name="briefcase" size={26} /></div><Badge tone="purple">FOR INDUSTRY</Badge><h3>Hire for skills, not signals.</h3><p>Find candidates based on verified capability, explainable matches and readiness data.</p><a onClick={() => navigate("/login?role=industry")}>Explore industry experience <Icon name="arrow" size={16} /></a></Card>
        <Card className="benefit-card college"><div className="benefit-icon"><Icon name="building" size={26} /></div><Badge tone="green">FOR COLLEGES</Badge><h3>Make employability measurable.</h3><p>Understand skill gaps, prioritize training and improve placement outcomes with live insights.</p><a onClick={() => navigate("/login?role=college")}>Explore college experience <Icon name="arrow" size={16} /></a></Card>
      </div></section>

      <section className="how" id="how"><span className="eyebrow">FROM LEARNING TO EMPLOYMENT</span><SectionTitle title="Five steps to industry readiness" /><div className="steps">{["Assess", "Prove", "Identify gaps", "Improve", "Get matched"].map((step, i) => <div className="step" key={step}><span>{i + 1}</span><div className="step-icon"><Icon name={["file", "check", "chart", "book", "briefcase"][i] as IconName} /></div><strong>{step}</strong>{i < 4 && <i><Icon name="arrow" /></i>}</div>)}</div></section>

      <section className="features" id="features"><div><span className="eyebrow">THE SKILL INTELLIGENCE LAYER</span><h2>Everything you need to become industry ready.</h2><p>Assessment, improvement and opportunity matching in one connected platform.</p><Button variant="dark" onClick={() => navigate("/login")}>Explore all features <Icon name="arrow" /></Button></div><div className="feature-list">{features.map((f, i) => <div key={f}><span><Icon name={["file", "check", "chart", "spark", "briefcase", "building"][i] as IconName} /></span><strong>{f}</strong><small>{["Benchmark technical ability", "Proof beyond self-declared skills", "A clear, explainable career metric", "Know exactly what to improve", "See why every role fits", "Turn data into better training"][i]}</small></div>)}</div></section>
      <section className="cta"><span className="eyebrow">YOUR NEXT STEP STARTS HERE</span><h2>Start building your future with SkillImprove.</h2><p>Prove what you know. Improve what matters. Connect with the right opportunities.</p><Button onClick={() => navigate("/login")}>Get started free <Icon name="arrow" /></Button></section>
    </main>
    <footer><Logo dark /><p>Students prove skills. Industry finds evidence. Colleges build readiness.</p><span>© 2025 SkillImprove</span></footer>
  </div>;
}

function Login({ navigate, initialRole }: { navigate: (path: string) => void; initialRole: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState(roleConfig[role].email);
  const [password, setPassword] = useState(roleConfig[role].password);
  const [error, setError] = useState("");
  const selectRole = (next: Role) => { setRole(next); setEmail(roleConfig[next].email); setPassword(roleConfig[next].password); setError(""); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email === roleConfig[role].email && password === roleConfig[role].password) {
      localStorage.setItem("skill-role", role);
      navigate(`/${role}/dashboard`);
    } else setError(`Use the demo ${roleConfig[role].label.toLowerCase()} credentials shown below.`);
  };
  return <div className="login-page">
    <div className="login-brand"><Logo dark /><div className="login-message"><Badge tone="blue"><Icon name="spark" size={14} /> Skill intelligence platform</Badge><h1>Skills should be<br /><span>seen, proven, valued.</span></h1><p>A single platform where students build evidence, companies discover capability and colleges improve outcomes.</p><div className="login-points"><span><Icon name="check" /> Verified skill evidence</span><span><Icon name="check" /> Explainable readiness scoring</span><span><Icon name="check" /> AI-powered recommendations</span></div></div><div className="brand-orbit"><div><span>S</span><span>I</span><span>C</span></div></div></div>
    <div className="login-panel"><div className="login-mobile-logo"><Logo /></div><div className="login-box"><span className="eyebrow">WELCOME TO SKILLIMPROVE</span><h2>Sign in to your workspace</h2><p>Select your role to continue with demo credentials.</p><div className="role-tabs">{(["student", "industry", "college"] as Role[]).map(r => <button key={r} className={role === r ? "active" : ""} onClick={() => selectRole(r)}><Icon name={r === "student" ? "user" : r === "industry" ? "briefcase" : "building"} />{roleConfig[r].label}</button>)}</div><form onSubmit={submit}><label>Email address<input value={email} onChange={e => setEmail(e.target.value)} type="email" /></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" /></label>{error && <div className="form-error">{error}</div>}<Button type="submit" className="full">Sign in as {roleConfig[role].label} <Icon name="arrow" /></Button></form><div className="demo-note"><Icon name="check" /><div><strong>Demo credentials pre-filled</strong><small>{roleConfig[role].email} · {roleConfig[role].password}</small></div></div><button className="back-link" onClick={() => navigate("/")}><Icon name="arrow" /> Back to SkillImprove</button></div></div>
  </div>;
}

function AppShell({ role, page, navigate, logout }: { role: Role; page: string; navigate: (p: string) => void; logout: () => void }) {
  const [menu, setMenu] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(() => getNotices(role));
  const studentName = useStudentName();
  const hoverTimeout = useRef<number | null>(null);

  const handleMenuHoverEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setMenu(true);
  };

  const handleMenuHoverLeave = () => {
    if (isPinned) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => {
      setMenu(false);
    }, 350);
  };

  const cancelCloseTimeout = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  const closeSidebar = () => {
    cancelCloseTimeout();
    setIsPinned(false);
    setMenu(false);
  };

  useEffect(() => {
    const update = () => setNotices(getNotices(role));
    update();
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [role]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const config = role === "student" ? { ...roleConfig.student, name: studentName, initials: studentName.split(" ").map(word => word[0]).join("").slice(0, 2) } : roleConfig[role];
  const titles: Record<string, string> = { dashboard: "Dashboard", profile: "My Profile", skills: role === "student" ? "My Skills" : "Skill Analytics", "verify-projects": "Student Projects Verification", projects: "Projects", certifications: "Certifications", resume: "Resume", assessment: "Skill Assessment", gaps: "Skill Gap Analysis", learning: "Career & Learning Recommendations", recommendations: "Career & Learning Recommendations", career: "Career & Learning Recommendations", jobs: "Jobs & Internships", applications: "Applications", candidates: "Candidate Search", candidate: "Candidate Profile", "matched-students": "Matched Students Intelligence", recommended: "Recommended Candidates", opportunities: "Opportunities", "company-profile": "Dashboard", "skill-demand": "Skill Demand", analytics: role === "industry" ? "Analytics" : "Placement Analytics", post: "Post Opportunity", students: "Student Management", "student-skills": "Student Skills", training: "Training Recommendations", connections: "Industry Connections", placements: "Placement Analytics" };
  return <div className={`app-shell role-${role}`}>
    <aside id="workspace-navigation" inert={!menu} aria-label="Workspace navigation" className={menu ? "open" : ""} onMouseEnter={cancelCloseTimeout} onMouseLeave={handleMenuHoverLeave}><div className="side-head"><Logo dark /><button aria-label="Close navigation" onClick={closeSidebar}>×</button></div><div className={`role-pill ${role}`}><span>{config.initials}</span><div><strong>{config.name}</strong><small>{config.label} workspace</small></div></div><nav>{navigation[role].map((item, i) => <button key={`${item.label}-${i}`} className={page === item.path ? "active" : ""} onClick={() => { navigate(`/${role}/${item.path}`); closeSidebar(); }}><Icon name={item.icon} />{item.label}</button>)}</nav><div className="side-bottom"><button onClick={() => { closeSidebar(); setSettingsOpen(true); }}><Icon name="settings" /> Settings</button><button onClick={logout}><Icon name="logout" /> Sign out</button></div></aside>
    {menu && <div className="scrim" onClick={closeSidebar} />}
    <main className="app-main"><header><div><button aria-label="Open navigation" aria-expanded={menu} aria-controls="workspace-navigation" className="menu-btn" onMouseEnter={handleMenuHoverEnter} onMouseLeave={handleMenuHoverLeave} onClick={() => { cancelCloseTimeout(); setMenu(prev => { const next = !prev; setIsPinned(next); return next; }); }}><Icon name="menu" /></button><div><small>{config.label} portal</small><h1>{page === "dashboard" ? "Dashboard" : titles[page] || "Dashboard"}</h1></div></div><div className="header-tools"><button aria-label="Search workspace" className="search-box" onClick={() => setSearchOpen(true)}><Icon name="search" /><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-btn notification-trigger" aria-label={`Open notifications, ${notices.filter(item => !item.read).length} unread`} onClick={() => setNotificationsOpen(true)}><Icon name="bell" />{notices.some(item => !item.read) && <i />}</button><div className="user-chip"><span>{config.initials}</span><div><strong>{config.name}</strong><small>{config.label}</small></div></div></div></header>
      <div className="app-content">{role === "student" ? <StudentPages page={page} navigate={navigate} /> : role === "industry" ? <IndustryPages page={page} navigate={navigate} /> : <CollegePages page={page} navigate={navigate} />}</div>
    </main>
    {searchOpen && <WorkspaceSearch role={role} navigate={navigate} close={() => setSearchOpen(false)} />}
    {settingsOpen && <SettingsModal role={role} close={() => setSettingsOpen(false)} />}
    {notificationsOpen && <FeatureDialog title="Notifications" close={() => setNotificationsOpen(false)}>
      <div className="notification-summary"><span>{notices.filter(item => !item.read).length} unread</span><button className="text-link" onClick={() => {
        const next = notices.map(item => ({ ...item, read: true }));
        setNotices(next);
        try { saveStored(noticeKey(role), next); } catch { /* Read state still updates for this session. */ }
      }}>Mark all as read</button></div>
      <div className="notification-list">{notices.map(item => <button key={item.id} className={item.read ? "read" : "unread"} onClick={() => {
        const next = notices.map(notice => notice.id === item.id ? { ...notice, read: true } : notice);
        setNotices(next);
        try { saveStored(noticeKey(role), next); } catch { /* Navigation remains available without persistent storage. */ }
        setNotificationsOpen(false);
        navigate(`/${role}/${item.path}`);
      }}><span className="notification-marker" /><div><strong>{item.title}</strong><p>{item.detail}</p></div><Icon name="arrow" /></button>)}</div>
    </FeatureDialog>}
  </div>;
}

function WorkspaceSearch({ role, navigate, close }: { role: Role; navigate: (path: string) => void; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  const entries = [
    ...navigation[role],
    ...(role === "student" ? [
      { label: "Verified skills · React, JavaScript, Python", icon: "spark" as IconName, path: "skills" },
      { label: "Projects · AI Career Recommendation System", icon: "briefcase" as IconName, path: "projects" },
      { label: "Certifications · AWS, Meta, Python", icon: "check" as IconName, path: "certifications" },
      { label: "Resume · Upload and analysis", icon: "file" as IconName, path: "resume" },
    ] : []),
    ...(role === "industry" ? [
      { label: "Matched Students · AI Opportunity Candidate Matching", icon: "spark" as IconName, path: "matched-students" },
    ] : []),
  ];
  const results = entries.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <dialog ref={dialog} className="workspace-modal search-modal" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="modal-heading"><div><span className="eyebrow">{roleConfig[role].label} workspace</span><h2>Search your workspace</h2></div><button aria-label="Close search" onClick={close}>×</button></div>
    <label className="workspace-search-input"><Icon name="search" /><input autoFocus placeholder="Search pages, skills, projects or resume…" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div className="search-results">{results.length ? results.map(item => <button key={item.path} onClick={() => { navigate(`/${role}/${item.path}`); close(); }}><Icon name={item.icon} /><span>{item.label}</span><Icon name="arrow" /></button>) : <p>No results for “{query}”. Try a page name or “React”.</p>}</div>
    <small>Search is limited to this role’s pages and demo profile sections.</small>
  </dialog>;
}

function ResumeViewerModal({
  candidateName,
  resumeFileName,
  score = 88,
  college = "Apex Institute of Technology",
  close,
}: {
  candidateName: string;
  resumeFileName?: string;
  score?: number;
  college?: string;
  close: () => void;
}) {
  const [shortlisted, setShortlisted] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileName = resumeFileName || `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`;

  const handleDownload = () => {
    downloadStudentResume(candidateName, fileName);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <FeatureDialog title={`Candidate Resume · ${candidateName}`} close={close} className="wide-modal">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge tone="green"><Icon name="check" size={12} /> Verified Technical Resume</Badge>
          <Badge tone="purple"><Icon name="spark" size={12} /> Authenticity Score: {score}%</Badge>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={handleDownload}>
            <Icon name="file" /> {downloaded ? "Downloaded!" : "Download Resume"}
          </Button>
          <Button onClick={() => setShortlisted(!shortlisted)}>
            {shortlisted ? <><Icon name="check" /> Shortlisted</> : <>Shortlist Candidate</>}
          </Button>
        </div>
      </div>

      <div className="resume-doc-sheet">
        <div className="resume-doc-sheet-header">
          <h2>{candidateName}</h2>
          <div className="resume-doc-contact">
            <span>📧 {candidateName.toLowerCase().replace(/\s+/g, ".")}@student.apex.edu</span>
            <span>📱 +91 98765 43210</span>
            <span>📍 Bengaluru, India</span>
            <span>🔗 github.com/{candidateName.toLowerCase().replace(/\s+/g, "")}-dev</span>
            <span>💼 linkedin.com/in/{candidateName.toLowerCase().replace(/\s+/g, "")}</span>
          </div>
        </div>

        <div className="resume-doc-section">
          <h4>Professional Summary</h4>
          <p>
            Motivated Computer Science undergraduate specializing in modern full-stack web engineering, scalable API development, and distributed systems. Demonstrated strong problem-solving abilities through college-verified software engineering projects and continuous assessment benchmarks.
          </p>
        </div>

        <div className="resume-doc-section">
          <h4>Technical Skills & Competencies</h4>
          <p>
            <strong>Core Languages:</strong> JavaScript (ES6+), TypeScript, Python, SQL, C++<br />
            <strong>Web Frameworks:</strong> React, Next.js, Redux, Node.js, Express, HTML5, CSS3, Tailwind CSS<br />
            <strong>Databases & Cloud:</strong> PostgreSQL, MongoDB, Redis, AWS (S3, EC2), Docker, Git & GitHub<br />
            <strong>Engineering Practices:</strong> RESTful API Design, Agile/Scrum, CI/CD, Unit Testing (Jest)
          </p>
        </div>

        <div className="resume-doc-section">
          <h4>College-Verified Technical Projects</h4>
          <div className="resume-doc-project-item">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>SkillImprove Intelligence Web Platform</strong>
              <Badge tone="green">College Verified</Badge>
            </div>
            <p style={{ margin: "4px 0" }}>
              Engineered end-to-end evidence-based talent platform featuring AI skill gap analysis, portfolio verification pipelines, and recruiter discovery portals.
            </p>
            <small style={{ color: "#0284c7" }}>Tech: React, TypeScript, Tailwind CSS, Vite · Repo: github.com/{candidateName.toLowerCase().replace(/\s+/g, "")}-dev/skillimprove</small>
          </div>
          <div className="resume-doc-project-item">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>CampusConnect Student Portal</strong>
              <Badge tone="green">College Verified</Badge>
            </div>
            <p style={{ margin: "4px 0" }}>
              Built multi-tenant campus management system with secure authentication, departmental project submissions, and real-time announcement notifications.
            </p>
            <small style={{ color: "#0284c7" }}>Tech: Node.js, Express, PostgreSQL, REST APIs · Repo: github.com/{candidateName.toLowerCase().replace(/\s+/g, "")}-dev/campusconnect</small>
          </div>
        </div>

        <div className="resume-doc-section">
          <h4>Education</h4>
          <p>
            <strong>Bachelor of Technology in Computer Science & Engineering</strong><br />
            {college} · 2021 – 2025 · CGPA: 8.9 / 10
          </p>
        </div>

        <div className="resume-doc-section">
          <h4>Certifications & Experience</h4>
          <p>
            • Meta Certified Frontend Developer Professional Certificate (Coursera)<br />
            • HackerRank Certified Problem Solving (Advanced)<br />
            • Software Engineering Intern | TechStart Labs (3 months, React & API integration)
          </p>
        </div>
      </div>
    </FeatureDialog>
  );
}

function SettingsModal({ role, close }: { role: Role; close: () => void }) {
  const studentName = useStudentName();
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "appearance" | "privacy">("account");
  const storedSettings = readStored<Record<string, any>>(`skillimprove-settings-${role}`, {});
  
  const [name, setName] = useState<string>(() => {
    if (storedSettings.name) return storedSettings.name;
    return role === "student" ? studentName : roleConfig[role].name;
  });
  const [email, setEmail] = useState<string>(() => storedSettings.email || roleConfig[role].email);
  const [org, setOrg] = useState<string>(() => {
    if (storedSettings.org) return storedSettings.org;
    return role === "student" ? "Apex Institute of Technology" : role === "industry" ? "TechNova Solutions" : "Apex Institute of Technology";
  });
  const [headline, setHeadline] = useState<string>(() => {
    if (storedSettings.headline) return storedSettings.headline;
    return role === "student" ? "B.Tech Computer Science · Aspiring Frontend Developer" : role === "industry" ? "Talent Acquisition & University Hiring Lead" : "Director of Placements & Corporate Relations";
  });
  const [bio, setBio] = useState<string>(() => {
    if (storedSettings.bio) return storedSettings.bio;
    return role === "student" ? "Focused on building performant React applications, state management, and full-stack software with verified project evidence." : role === "industry" ? "Partnering with leading colleges to recruit verified technical interns and engineering talent." : "Connecting skilled undergraduate engineers with leading technology enterprises and startups.";
  });

  const [emailAlerts, setEmailAlerts] = useState<boolean>(storedSettings.emailAlerts ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(storedSettings.weeklyDigest ?? true);
  const [verificationNotices, setVerificationNotices] = useState<boolean>(storedSettings.verificationNotices ?? true);
  const [instantAlerts, setInstantAlerts] = useState<boolean>(storedSettings.instantAlerts ?? true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(storedSettings.soundAlerts ?? false);

  const [themeMode, setThemeMode] = useState<string>(storedSettings.themeMode || "light");
  const [compactMode, setCompactMode] = useState<boolean>(storedSettings.compactMode || false);
  const [defaultLanding, setDefaultLanding] = useState<string>(storedSettings.defaultLanding || "dashboard");

  const [twoFactor, setTwoFactor] = useState<boolean>(storedSettings.twoFactor ?? true);
  const [profilePublic, setProfilePublic] = useState<boolean>(storedSettings.profilePublic ?? true);
  const [shareVerifiedProjects, setShareVerifiedProjects] = useState<boolean>(storedSettings.shareVerifiedProjects ?? true);

  const [savedNotice, setSavedNotice] = useState<string>("");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (role === "student") {
      const existing = readStored("skillimprove-profile", {});
      saveStored("skillimprove-profile", { ...existing, name, email, college: org, about: bio });
    }
    const data = {
      name, email, org, headline, bio,
      emailAlerts, weeklyDigest, verificationNotices, instantAlerts, soundAlerts,
      themeMode, compactMode, defaultLanding,
      twoFactor, profilePublic, shareVerifiedProjects,
      updatedAt: new Date().toISOString()
    };
    saveStored(`skillimprove-settings-${role}`, data);
    setSavedNotice("Workspace settings saved successfully!");
    setTimeout(() => {
      setSavedNotice("");
      close();
    }, 1100);
  };

  const handleExportData = () => {
    const dataToExport = {
      role,
      user: { name, email, org, headline, bio },
      applications: readStored(APPLICATIONS_KEY, []),
      settings: { emailAlerts, weeklyDigest, themeMode, twoFactor },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillimprove-${role}-data-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FeatureDialog title={`${roleConfig[role].label} Settings`} close={close} className="wide-modal">
      <div className="settings-tabs">
        <button type="button" className={`settings-tab-btn ${activeTab === "account" ? "active" : ""}`} onClick={() => setActiveTab("account")}>Profile & Account</button>
        <button type="button" className={`settings-tab-btn ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>Notifications & Alerts</button>
        <button type="button" className={`settings-tab-btn ${activeTab === "appearance" ? "active" : ""}`} onClick={() => setActiveTab("appearance")}>Appearance & Layout</button>
        <button type="button" className={`settings-tab-btn ${activeTab === "privacy" ? "active" : ""}`} onClick={() => setActiveTab("privacy")}>Security & Privacy</button>
      </div>

      {savedNotice && <div className="settings-success-alert"><Icon name="check" /> {savedNotice}</div>}

      <form onSubmit={handleSave}>
        {activeTab === "account" && (
          <div className="settings-section">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", background: "var(--soft)", borderRadius: "10px" }}>
              <div className="user-chip" style={{ padding: 0 }}>
                <span style={{ width: "48px", height: "48px", fontSize: "16px" }}>{name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
              </div>
              <div>
                <strong style={{ fontSize: "16px", color: "var(--ink)" }}>{name}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>{roleConfig[role].label} Account · {email}</p>
              </div>
            </div>

            <div className="settings-field-group">
              <label>Full Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="settings-field-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="settings-field-group">
              <label>{role === "student" ? "College / University" : role === "industry" ? "Company / Organization" : "Institution Name"}</label>
              <input value={org} onChange={e => setOrg(e.target.value)} required />
            </div>

            <div className="settings-field-group">
              <label>Professional Headline / Position</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)} />
            </div>

            <div className="settings-field-group">
              <label>Bio / About</label>
              <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="settings-section">
            <div className="settings-toggle-card">
              <div>
                <strong>Opportunity & Application Alerts</strong>
                <small>Get notified when applications are updated or new matching opportunities are published.</small>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Weekly Placement & Skill Digest</strong>
                <small>Receive periodic insights on in-demand technical skills, gaps, and readiness progress.</small>
              </div>
              <input type="checkbox" checked={weeklyDigest} onChange={e => setWeeklyDigest(e.target.checked)} />
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>College Project Verification Notices</strong>
                <small>Notifications when student projects are submitted or verified by institutional faculty.</small>
              </div>
              <input type="checkbox" checked={verificationNotices} onChange={e => setVerificationNotices(e.target.checked)} />
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Instant In-App Popups</strong>
                <small>Show toast notifications and badge counts in the top navigation bar.</small>
              </div>
              <input type="checkbox" checked={instantAlerts} onChange={e => setInstantAlerts(e.target.checked)} />
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Sound Effects</strong>
                <small>Play subtle audio cues when new notifications or achievements arrive.</small>
              </div>
              <input type="checkbox" checked={soundAlerts} onChange={e => setSoundAlerts(e.target.checked)} />
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="settings-section">
            <div className="settings-field-group">
              <label>Interface Theme</label>
              <select value={themeMode} onChange={e => setThemeMode(e.target.value)}>
                <option value="light">Light Mode (Default)</option>
                <option value="dark">Dark Slate</option>
                <option value="contrast">High Contrast Mode</option>
              </select>
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Compact Table & Card Layout</strong>
                <small>Condense padding and font sizes to fit more data onto the screen.</small>
              </div>
              <input type="checkbox" checked={compactMode} onChange={e => setCompactMode(e.target.checked)} />
            </div>

            <div className="settings-field-group">
              <label>Default Workspace View</label>
              <select value={defaultLanding} onChange={e => setDefaultLanding(e.target.value)}>
                <option value="dashboard">Dashboard Overview</option>
                <option value="applications">Applications Tracker</option>
                {role === "student" && <option value="jobs">Jobs & Internships</option>}
                {role === "industry" && <option value="matched-students">Matched Students Intelligence</option>}
                {role === "industry" && <option value="opportunities">Opportunities Management</option>}
                {role === "college" && <option value="verify-projects">Project Verification Queue</option>}
              </select>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="settings-section">
            <div className="settings-toggle-card">
              <div>
                <strong>Two-Factor Authentication (2FA)</strong>
                <small>Require multi-factor authorization when logging into this portal workspace.</small>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge tone="green">Active</Badge>
                <input type="checkbox" checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} />
              </div>
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Public Discovery Visibility</strong>
                <small>Allow verified recruiters and institutional partner portals to discover your profile and credentials.</small>
              </div>
              <input type="checkbox" checked={profilePublic} onChange={e => setProfilePublic(e.target.checked)} />
            </div>

            <div className="settings-toggle-card">
              <div>
                <strong>Share College Verified Projects</strong>
                <small>Automatically show college-verified project badges and repository links to hiring managers.</small>
              </div>
              <input type="checkbox" checked={shareVerifiedProjects} onChange={e => setShareVerifiedProjects(e.target.checked)} />
            </div>

            <div style={{ marginTop: "10px", padding: "14px", border: "1px dashed var(--line)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ display: "block", fontSize: "13px" }}>Export Account Data</strong>
                <small style={{ color: "var(--muted)" }}>Download an offline JSON archive of your workspace profile and activity.</small>
              </div>
              <Button type="button" variant="secondary" onClick={handleExportData}>Export JSON</Button>
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </FeatureDialog>
  );
}

const SkillEvidence = ({ name, level, score, projects, certificate = 1 }: { name: string; level: string; score: number; projects: number; certificate?: number }) => <Card className="evidence-card"><div className="evidence-top"><div className="skill-logo">{name.slice(0, 2)}</div><div><h3>{name}</h3><span>{level}</span></div><Badge tone="green"><Icon name="check" size={13} /> Verified</Badge></div><div className="evidence-grid"><div><small>Assessment</small><strong>{score}%</strong></div><div><small>Projects</small><strong>{projects}</strong></div><div><small>Certification</small><strong>{certificate}</strong></div></div><div className="confidence"><span><i /> High confidence</span><small>Active recently</small></div></Card>;

function StudentPages({ page, navigate }: { page: string; navigate: (p: string) => void }) {
  if (["profile", "skills", "projects", "certifications", "resume"].includes(page)) return <StudentProfile focus={page} />;
  if (page === "assessment") return <Assessments navigate={navigate} />;
  if (["recommendations", "learning", "career", "gaps"].includes(page)) return <CareerRecommendations navigate={navigate} />;
  if (page === "jobs") return <Opportunities navigate={navigate} />;
  if (page === "applications") return <Applications role="student" />;
  return <StudentDashboard navigate={navigate} />;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

function useTimeGreeting() {
  const [greeting, setGreeting] = useState(getTimeGreeting);
  useEffect(() => {
    const update = () => setGreeting(getTimeGreeting());
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  return greeting;
}

function StudentDashboard({ navigate }: { navigate: (p: string) => void }) {
  const studentName = useStudentName();
  const greeting = useTimeGreeting();
  const allOpps = useOpportunities();
  const opportunities = allOpps.slice(0, 3);
  return <><div className="welcome"><div><Badge tone="blue"><Icon name="spark" size={13} /> AI career coach active</Badge><h2>{greeting}, {studentName.split(" ")[0]}</h2><p>Here’s your current career readiness overview.</p></div><Button onClick={() => navigate("/student/profile")}>View public profile <Icon name="arrow" /></Button></div>
    <div className="student-hero-grid"><Card className="readiness-card"><div className="card-head"><div><span className="eyebrow">INDUSTRY READINESS SCORE</span><h3>You’re industry ready</h3></div><Badge tone="green">+6 this month</Badge></div><div className="readiness-body"><ScoreRing score={82} /><div className="score-breakdown">{[["Technical Skills", 86], ["Projects", 78], ["Assessments", 88], ["Certifications", 75], ["Professional Skills", 82]].map(([n, v]) => <div key={n}><span><small>{n}</small><b>{v}%</b></span><Progress value={v as number} /></div>)}</div></div><div className="explain"><Icon name="spark" /><p><strong>Why 82?</strong> Your verified React and JavaScript skills are strong. Completing a testing project could add up to 5 points.</p></div></Card>
      <Card className="gap-card"><div className="card-head"><div><span className="eyebrow">PRIORITY SKILL GAPS</span><h3>3 skills need improvement</h3></div><div className="warning-icon"><Icon name="chart" /></div></div>{[["React", "Intermediate", "Advanced", 82], ["SQL", "Beginner", "Intermediate", 68], ["Communication", "Intermediate", "Advanced", 80]].map(([n, a, b, p]) => <div className="gap-item" key={n}><div><strong>{n}</strong><span>{a} <Icon name="arrow" size={13} /> {b}</span></div><Progress value={p as number} tone={(p as number) < 70 ? "red" : "orange"} /></div>)}<Button variant="secondary" className="full" onClick={() => navigate("/student/recommendations")}>View complete skill gap <Icon name="arrow" /></Button></Card>
    </div>
    <div className="content-grid">
      <div>
        <SectionTitle title="Recommended learning" subtitle="Personalized to close your highest-impact gaps" action={<button className="text-link" onClick={() => navigate("/student/recommendations")}>View roadmap <Icon name="arrow" /></button>} />
        <div className="learning-row">
          {[["Advanced React Development", "React", "68", "4 weeks"], ["SQL for Developers", "SQL", "32", "3 weeks"], ["Technical Communication", "Soft skill", "12", "2 weeks"]].map(([n, s, p, t], i) => (
            <Card className="course-card" key={n}>
              <div className={`icon-tile ${i === 1 ? "green" : i === 2 ? "orange" : "purple"}`}><Icon name="book" /></div>
              <div className="course-content">
                <Badge tone={i === 0 ? "purple" : i === 1 ? "green" : "orange"}>{s}</Badge>
                <h3>{n}</h3>
                <p><span>{t}</span><span>·</span><span>{p}% complete</span></p>
                <Progress value={Number(p)} tone={i === 1 ? "green" : "blue"} />
              </div>
              <button onClick={() => navigate("/student/recommendations")}><Icon name="arrow" /></button>
            </Card>
          ))}
        </div>
        <SectionTitle title="Recommended opportunities" subtitle="Matched using your verified skills and preferences" action={<button className="text-link" onClick={() => navigate("/student/jobs")}>View all jobs <Icon name="arrow" /></button>} />
        <div className="opportunity-list">
          {opportunities.map(o => (
            <Card className="job-row" key={o.id}>
              <div className="company-logo">{o.company.split(" ").map(x => x[0]).join("").slice(0, 2)}</div>
              <div className="job-main">
                <h3>{o.title}</h3>
                <p>{o.company} · {o.location} ({o.mode})</p>
                <div>{(o.skills || []).map(s => <Badge tone="gray" key={s}>{s}</Badge>)}</div>
              </div>
              <div className="match"><strong>{o.match}% match</strong><small>Active listing</small></div>
              <Button variant="secondary" onClick={() => navigate("/student/jobs")}>View role</Button>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle title="Recent activity" />
        <Card className="activity-card">
          {[["check", "Completed JavaScript Assessment", "Scored 88% · Advanced", "2h"], ["briefcase", "Added React project", "E-Commerce Web Application", "1d"], ["file", "Updated resume", "AI analysis completed", "2d"], ["check", "Earned Python certification", "Credential verified", "5d"]].map(([icon, title, sub, time]) => (
            <div className="activity" key={title}>
              <span><Icon name={icon as IconName} /></span>
              <div><strong>{title}</strong><small>{sub}</small></div>
              <time>{time}</time>
            </div>
          ))}
        </Card>
        <Card className="profile-complete">
          <div><span>Profile strength</span><strong>88%</strong></div>
          <Progress value={88} tone="green" />
          <p>Add one more project with verified evidence to reach “Excellent”.</p>
          <Button variant="ghost" onClick={() => navigate("/student/profile")}>Improve profile <Icon name="arrow" /></Button>
        </Card>
      </div>
    </div>
  </>;
}

function ResumePanel({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Alex_Johnson_Resume.pdf");
  const [fileSize, setFileSize] = useState("1.2 MB");
  const [dragging, setDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [message, setMessage] = useState("");

  const sampleAlexResumeText = `
    Alex Johnson
    alex.johnson@email.com | +91 98765 43210 | Bengaluru, India
    GitHub: https://github.com/alexj
    LinkedIn: https://linkedin.com/in/alexjohnson

    EDUCATION
    B.Tech in Computer Science, 4th Year - ABC Institute of Technology (2021 - 2025)

    TECHNICAL SKILLS
    Languages & Frameworks: React, JavaScript, TypeScript, Python, Node.js, Express, HTML, CSS, Tailwind
    Databases & Cloud: SQL, PostgreSQL, MongoDB, Git, GitHub, Docker, AWS, REST APIs

    PROJECTS
    1. AI-Based Student Career Recommendation System
       Built full-stack platform using React, Node.js, Python and machine learning.
       Repository: https://github.com/alexj/ai-career-advisor
    2. E-Commerce Microservices Platform
       Engineered backend architecture with Docker, PostgreSQL and Redis.
       Repository: https://github.com/alexj/micro-storefront

    EXPERIENCE
    Software Developer Intern - TechNova Solutions (May 2024 - July 2024)
    Developed responsive React UI components and connected RESTful backend endpoints.

    CERTIFICATIONS
    AWS Cloud Practitioner - Amazon Web Services
    Meta Front-End Developer Professional Certificate
    Python Programming - University of Michigan
  `;

  const acceptFile = (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "txt", "md"].includes(extension || "")) {
      setMessage("Please upload a PDF, DOC, DOCX, or TXT resume.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Please choose a resume smaller than 10 MB.");
      return;
    }
    setSelectedFile(file);
    onFile(file);
    setFileName(file.name);
    setFileSize(`${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`);
    setAnalysisResult(null);
    setMessage(`"${file.name}" uploaded. Click "Analyze resume with AI" to check authenticity and compute score.`);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setMessage("Scanning resume text, verifying skills & technical skills, projects, and repository links...");
    try {
      let result: ResumeAnalysisResult;
      if (selectedFile) {
        result = await evaluateResumeFile(selectedFile);
      } else {
        result = evaluateResumeText(sampleAlexResumeText, fileName);
      }
      setAnalysisResult(result);
      if (result.isRealResume) {
        setMessage(`AI analysis complete! Authenticity confirmed: ${result.authenticityRating}.`);
        const profile = readStored<{ readinessScore?: number }>("skillimprove-profile", {});
        saveStored("skillimprove-profile", { ...profile, readinessScore: result.score });
      } else {
        setMessage("Verification Alert: Document lacks technical resume criteria.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Analysis completed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentScore = analysisResult ? analysisResult.score : 82;
  const scoreToneColor = currentScore >= 80 ? "#10b981" : currentScore >= 50 ? "#f59e0b" : "#ef4444";

  return <Card className="resume-card">
    <div className="card-head">
      <h3>Resume Intelligence & Authenticity Checker</h3>
      <Badge tone="green">Real-time Evaluator</Badge>
    </div>

    <input ref={inputRef} className="file-input" type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleInput} />
    <div
      className={`resume-uploader ${dragging ? "dragging" : ""}`}
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <span className="upload-icon"><Icon name="file" size={28} /></span>
      <strong>Drag and drop your resume here</strong>
      <small>PDF, DOC, DOCX or TXT · Maximum 10 MB</small>
      <Button variant="secondary" onClick={() => inputRef.current?.click()}>Choose file manually</Button>
    </div>
    <div className="uploaded-file"><Icon name="check" /><div><strong>{fileName}</strong><small>{fileSize} · Ready for deep verification</small></div><Button variant="ghost" onClick={() => inputRef.current?.click()}>Replace</Button></div>
    {message && <div className="upload-message"><Icon name={message.includes("Alert") || message.includes("Please") ? "chart" : "check"} />{message}</div>}
    <Button className="full" disabled={isAnalyzing} onClick={runAnalysis}>
      <Icon name="spark" /> {isAnalyzing ? "Analyzing Document Authenticity..." : "Analyze resume with AI"}
    </Button>

    {/* The Resume Score (82/100) is placed below the Analyze resume with AI button */}
    <div
      style={{
        marginTop: "1rem",
        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
        padding: "0.85rem 1rem",
        borderRadius: "0.75rem",
        border: "1px solid #cbd5e1",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <Badge tone={analysisResult ? (analysisResult.isRealResume ? (analysisResult.score >= 80 ? "green" : "blue") : "red") : "blue"}>
            <Icon name="spark" size={11} /> {analysisResult ? analysisResult.authenticityRating : "Resume Authenticity Score"}
          </Badge>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
            {analysisResult ? (analysisResult.isRealResume ? "Verified Real Resume" : "Unverified Document") : "Baseline Evaluation"}
          </span>
        </div>
        <h3 style={{ margin: "0.15rem 0", fontSize: "1rem", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {analysisResult ? (analysisResult.isRealResume ? "Technical Resume Verified" : "Needs Technical Criteria") : "Resume Score"}
        </h3>
        <small style={{ color: "#64748b", fontSize: "0.72rem", display: "block", lineHeight: "1.3" }}>
          Evaluates Skills / Technical Skills (treated identically), Projects, GitHub links & Certifications
        </small>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "white",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            border: `3px solid ${scoreToneColor}`,
          }}
        >
          <strong style={{ fontSize: "1.2rem", fontWeight: 800, color: scoreToneColor }}>
            {currentScore}
          </strong>
        </div>
        <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700 }}>/100</span>
      </div>
    </div>

    {analysisResult ? (
      <div className="resume-analysis">
        <div className="analysis-heading">
          <div>
            <Badge tone={analysisResult.isRealResume ? (analysisResult.score >= 80 ? "green" : "blue") : "red"}>
              <Icon name="spark" size={12} /> {analysisResult.authenticityRating.toUpperCase()}
            </Badge>
            <h3>{analysisResult.isRealResume ? "Technical Resume Verified" : "Unverified / Non-Technical Document"}</h3>
          </div>
          <strong style={{ color: scoreToneColor }}>
            {analysisResult.score}<span>/100</span>
          </strong>
        </div>
        <Progress value={analysisResult.score} tone={analysisResult.score >= 80 ? "green" : analysisResult.score >= 50 ? "orange" : "red"} />
        <p style={{ margin: "0.5rem 0 1rem", fontSize: "0.85rem", color: "#475569" }}>
          {analysisResult.verdict}
        </p>

        {/* Verification Elements Checklist */}
        <div style={{ background: "#f8fafc", padding: "0.875rem", borderRadius: "0.5rem", marginBottom: "1rem", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <small style={{ fontWeight: 700, color: "#334155" }}>RESUME CRITERIA CHECKLIST</small>
            <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: 600 }}>Skills & Technical Skills Treated Same</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem" }}>
            <div>
              <span>Skills / Technical Skills: </span>
              {analysisResult.detectedSkills.length > 0 ? (
                <strong style={{ color: "#10b981" }}>✓ {analysisResult.detectedSkills.length} found (Considered Same)</strong>
              ) : (
                <strong style={{ color: "#ef4444" }}>✗ None found</strong>
              )}
            </div>
            <div>
              <span>GitHub / Code: </span>
              {analysisResult.detectedLinks.length > 0 ? (
                <strong style={{ color: "#10b981" }}>✓ Verified link</strong>
              ) : (
                <strong style={{ color: "#ef4444" }}>✗ Missing link</strong>
              )}
            </div>
            <div>
              <span>Project Evidence: </span>
              {analysisResult.detectedProjects.length > 0 ? (
                <strong style={{ color: "#10b981" }}>✓ {analysisResult.detectedProjects.length} projects</strong>
              ) : (
                <strong style={{ color: "#ef4444" }}>✗ No projects</strong>
              )}
            </div>
            <div>
              <span>Certifications: </span>
              {analysisResult.detectedCerts.length > 0 ? (
                <strong style={{ color: "#10b981" }}>✓ {analysisResult.detectedCerts.length} verified</strong>
              ) : (
                <strong style={{ color: "#64748b" }}>○ Optional</strong>
              )}
            </div>
          </div>

          <div style={{ marginTop: "0.5rem", padding: "0.4rem 0.6rem", background: "#f1f5f9", borderRadius: "0.375rem", fontSize: "0.75rem", color: "#475569" }}>
            <strong>Rule Applied:</strong> Skill and Technical Skill sections are evaluated identically as core capability evidence.
          </div>

          {analysisResult.detectedSkills.length > 0 && (
            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {analysisResult.detectedSkills.slice(0, 10).map(s => (
                <span key={s} className="badge badge-blue" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>{s}</span>
              ))}
              {analysisResult.detectedSkills.length > 10 && (
                <span className="badge badge-gray" style={{ fontSize: "0.7rem" }}>+{analysisResult.detectedSkills.length - 10} more</span>
              )}
            </div>
          )}
        </div>

        <div className="analysis-columns">
          <div>
            <h4>Strengths Detected</h4>
            {analysisResult.strengths.length > 0 ? (
              analysisResult.strengths.map((str, i) => (
                <p key={i}><Icon name="check" /> {str}</p>
              ))
            ) : (
              <p style={{ color: "#ef4444" }}>No technical strengths detected</p>
            )}
          </div>
          <div>
            <h4>Recommendations</h4>
            {analysisResult.improvements.map((imp, i) => (
              <p key={i}><Icon name="chart" /> {imp}</p>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="resume-score">
        <span>Evaluates Skills / Technical Skills, Projects, GitHub URLs, Certifications & Work History</span>
        <p><Icon name="spark" /> Upload your resume to test whether it passes real industry validation.</p>
      </div>
    )}
  </Card>;
}

function StudentProfile({ focus = "profile" }: { focus?: string }) {
  return <ProfileWorkspace focus={focus} resume={onFile => <ResumePanel onFile={onFile} />} />;
}

function StudentGaps({ navigate }: { navigate: (p: string) => void }) {
  const gaps = [["React", "Intermediate", "Advanced", 72, 90, 18], ["SQL", "Beginner", "Intermediate", 43, 75, 32], ["Communication", "Intermediate", "Advanced", 65, 85, 20]];
  return <><div className="welcome"><div><Badge tone="purple"><Icon name="spark" size={13} /> AI ANALYSIS UPDATED TODAY</Badge><h2>Your Skill Gap</h2><p>Compared with Frontend Developer roles across 1,240 active opportunities.</p></div><Button onClick={() => navigate("/student/learning")}>Start learning path <Icon name="arrow" /></Button></div><Card className="gap-summary"><div><span className="warning-icon"><Icon name="chart" /></span><div><strong>3 priority gaps</strong><small>Closing these could improve your readiness score by 11 points.</small></div></div><div><span>Current readiness</span><strong>82</strong><Icon name="arrow" /><span>Potential</span><strong className="green-text">93</strong></div></Card><div className="gap-analysis-list">{gaps.map(([name, current, required, cv, rv, gap]) => <Card className="gap-analysis" key={name as string}><div className="gap-name"><div className="skill-logo">{(name as string).slice(0, 2)}</div><div><h3>{name}</h3><Badge tone={gap as number > 25 ? "red" : "orange"}>{gap}% gap</Badge></div></div><div className="compare-bars"><div><span>Current · {current}</span><b>{cv}%</b><Progress value={cv as number} tone={cv as number < 50 ? "red" : "orange"} /></div><div><span>Required · {required}</span><b>{rv}%</b><Progress value={rv as number} tone="green" /></div></div><div className="gap-action"><small>AI RECOMMENDATION</small><p>{name === "React" ? "Complete Advanced React and ship one tested project." : name === "SQL" ? "Complete SQL for Developers and pass the skill assessment." : "Practice two mock interviews with AI feedback."}</p><Button variant="secondary">View action plan</Button></div></Card>)}</div><SectionTitle title="Recommended actions" subtitle="The fastest path to your target role" /><div className="action-grid">{["Complete Advanced React course", "Build one tested React project", "Complete SQL assessment", "Practice communication skills"].map((a, i) => <Card key={a} className="action-card"><span>{i + 1}</span><div><h3>{a}</h3><small>{["4 weeks · High impact", "2 weeks · +3 readiness", "45 minutes · Verify skill", "2 weeks · AI coached"][i]}</small></div><Icon name="arrow" /></Card>)}</div></>;
}

function LearningPath() {
  return <><div className="welcome"><div><Badge tone="blue"><Icon name="spark" size={13} /> PERSONALIZED ROADMAP</Badge><h2>Frontend Developer Roadmap</h2><p>Built around your skills, goals and industry demand.</p></div><div className="roadmap-progress"><span>Overall progress <strong>42%</strong></span><Progress value={42} /></div></div><div className="roadmap">{[["HTML & CSS Foundations", "Completed", "Beginner", "100"], ["Modern JavaScript", "Completed", "Intermediate", "100"], ["Advanced React Development", "In progress", "Advanced", "68"], ["Testing React Applications", "Upcoming", "Intermediate", "0"], ["TypeScript Essentials", "Upcoming", "Intermediate", "0"], ["System Design Basics", "Upcoming", "Advanced", "0"]].map(([name, status, level, progress], i) => <div className={`roadmap-item ${status.toLowerCase().replace(" ", "-")}`} key={name}><div className="road-line"><span>{status === "Completed" ? <Icon name="check" /> : i + 1}</span></div><Card><div className="road-main"><div><Badge tone={status === "Completed" ? "green" : status === "In progress" ? "blue" : "gray"}>{status}</Badge><h3>{name}</h3><p>{level} · {i < 2 ? "Completed" : `${[0, 0, 4, 2, 3, 2][i]} weeks`} · {progress}%</p></div>{status === "In progress" ? <Button>Continue learning</Button> : status === "Upcoming" ? <Button variant="secondary">Preview</Button> : <span className="complete-mark"><Icon name="check" /></span>}</div>{status === "In progress" && <><Progress value={68} /><div className="next-lesson"><Icon name="book" /><div><small>UP NEXT</small><strong>State management patterns</strong></div><span>18 min</span></div></>}</Card></div>)}</div></>;
}

function Applications({ role }: { role: "student" | "industry" }) {
  const [saved, setSaved] = useState<Application[]>(() => readStored(APPLICATIONS_KEY, []));
  const [viewingResume, setViewingResume] = useState<{ candidateName: string; resumeFileName?: string; score?: number; college?: string } | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState("");

  const studentDemoRows = [
    ["PixelCraft Labs", "Frontend Developer Intern", "Jun 14", "Shortlisted", "92"],
    ["TechNova Solutions", "Software Engineering Intern", "Jun 10", "Interview", "88"],
    ["CloudSphere", "Full Stack Intern", "Jun 4", "Under Review", "84"],
    ["BrightStack", "Junior React Developer", "May 28", "Applied", "81"]
  ];

  useEffect(() => {
    const update = () => setSaved(readStored(APPLICATIONS_KEY, []));
    window.addEventListener(DATA_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(DATA_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const studentRows = [
    ...saved.map(item => [item.company, item.title, item.date, item.status, String(item.match)]),
    ...studentDemoRows.filter(row => !saved.some(item => item.company === row[0] && item.title === row[1]))
  ];

  const defaultIndustryApplicants = [
    {
      id: "demo-alex",
      name: "Alex Johnson",
      role: "Frontend Developer Intern",
      company: "TechNova Solutions",
      date: "Jun 14",
      match: 92,
      readiness: 84,
      status: "Shortlisted",
      resumeFileName: "Alex_Johnson_Resume.pdf",
      resumeScore: 88,
      college: "Apex Institute of Technology",
      experience: "1 internship"
    },
    {
      id: "demo-priya",
      name: "Priya Sharma",
      role: "Software Engineering Intern",
      company: "TechNova Solutions",
      date: "Jun 10",
      match: 94,
      readiness: 91,
      status: "Interview",
      resumeFileName: "Priya_Sharma_Resume.pdf",
      resumeScore: 92,
      college: "National Engineering Institute",
      experience: "2 internships"
    },
    {
      id: "demo-rahul",
      name: "Rahul Verma",
      role: "Full Stack Intern",
      company: "TechNova Solutions",
      date: "Jun 04",
      match: 87,
      readiness: 79,
      status: "New",
      resumeFileName: "Rahul_Verma_Resume.pdf",
      resumeScore: 85,
      college: "City University of Technology",
      experience: "1 internship"
    },
    {
      id: "demo-maya",
      name: "Maya Patel",
      role: "Junior React Developer",
      company: "TechNova Solutions",
      date: "May 28",
      match: 91,
      readiness: 88,
      status: "Selected",
      resumeFileName: "Maya_Patel_Resume.pdf",
      resumeScore: 90,
      college: "State College of Engineering",
      experience: "2 internships"
    }
  ];

  const submittedIndustryApplicants = saved.map(item => ({
    id: item.id,
    name: item.studentName || "Alex Johnson",
    role: item.title,
    company: item.company,
    date: item.date,
    match: item.match,
    readiness: item.readiness || 84,
    status: item.status || "Applied",
    resumeFileName: item.resumeFileName || `${(item.studentName || "Alex Johnson").replace(/\s+/g, "_")}_Resume.pdf`,
    resumeScore: item.resumeScore || 88,
    college: item.studentCollege || "Apex Institute of Technology",
    experience: item.experience || "1 completed internship"
  }));

  const allIndustryApplicants = [
    ...submittedIndustryApplicants,
    ...defaultIndustryApplicants.filter(def => !submittedIndustryApplicants.some(s => s.name === def.name && s.role === def.role))
  ];

  const filteredIndustry = allIndustryApplicants.filter(item => {
    const currentStatus = statusMap[item.id] || item.status;
    if (activeTab === "All") return true;
    if (activeTab === "New") return currentStatus === "New" || currentStatus === "Applied";
    return currentStatus.toLowerCase() === activeTab.toLowerCase();
  });

  const handleStatusChange = (id: string, newStatus: string, applicantName: string) => {
    setStatusMap(prev => ({ ...prev, [id]: newStatus }));
    setToastMessage(`Status for ${applicantName} updated to "${newStatus}".`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  if (role === "student") {
    return (
      <>
        <div className="welcome">
          <div>
            <h2>Track your applications</h2>
            <p>Stay up to date at every step of your opportunity journey with verified skill credentials.</p>
          </div>
          <Button>Find more opportunities</Button>
        </div>
        <div className="tabs">
          {["All", "Applied", "Under Review", "Shortlisted", "Interview", "Selected"].map((x) => (
            <button className={activeTab === x ? "active" : ""} key={x} onClick={() => setActiveTab(x)}>{x}</button>
          ))}
        </div>
        <Card className="data-table">
          <div className="table-row header student">
            {["Company", "Role", "Applied date", "Status", "Match score", ""].map(x => <span key={x}>{x}</span>)}
          </div>
          {studentRows.filter(r => activeTab === "All" || r[3].toLowerCase() === activeTab.toLowerCase()).map((r, i) => (
            <div className="table-row student" key={`${r[0]}-${r[1]}-${i}`}>
              {r.map((v, j) => j === 3 ? (
                <span key={j}><Badge tone={v === "Selected" ? "green" : v === "Interview" ? "purple" : v === "Shortlisted" ? "blue" : "orange"}>{v}</Badge></span>
              ) : (
                <span key={j} data-label={["Company", "Role", "Applied", "Status", "Match"][j]}>
                  {j === 0 && <i className="table-avatar">{r[0].split(" ").map(x => x[0]).join("").slice(0, 2)}</i>}
                  {v}{j === 4 ? "%" : ""}
                </span>
              ))}
              <button><Icon name="arrow" /></button>
            </div>
          ))}
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="welcome">
        <div>
          <Badge tone="purple"><Icon name="users" size={13} /> APPLICANT TRACKING PIPELINE</Badge>
          <h2>Application management</h2>
          <p>Review student applications, inspect verified resumes, and advance candidates through hiring stages.</p>
        </div>
        <Button variant="secondary" onClick={() => downloadStudentResume("Alex Johnson")}>Export applicant roster</Button>
      </div>

      {toastMessage && (
        <div className="profile-notice" style={{ marginBottom: "14px" }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")}>×</button>
        </div>
      )}

      <div className="tabs">
        {["All", "New", "Shortlisted", "Interview", "Selected", "Rejected"].map(tabName => {
          const count = allIndustryApplicants.filter(item => {
            const currentStatus = statusMap[item.id] || item.status;
            if (tabName === "All") return true;
            if (tabName === "New") return currentStatus === "New" || currentStatus === "Applied";
            return currentStatus.toLowerCase() === tabName.toLowerCase();
          }).length;
          return (
            <button key={tabName} className={activeTab === tabName ? "active" : ""} onClick={() => setActiveTab(tabName)}>
              {tabName} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
        {filteredIndustry.map(applicant => {
          const currentStatus = statusMap[applicant.id] || applicant.status;
          return (
            <Card key={applicant.id} style={{ padding: "16px 20px", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div className="table-avatar" style={{ width: "42px", height: "42px", fontSize: "14px" }}>
                    {applicant.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "15px", color: "var(--ink)" }}>{applicant.name}</strong>
                      <Badge tone={applicant.match >= 90 ? "green" : "blue"}>{applicant.match}% match</Badge>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>
                      Applied for: <strong>{applicant.role}</strong> · {applicant.company}
                    </p>
                    <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                      {applicant.college} · Applied {applicant.date} · Readiness: {applicant.readiness}%
                    </small>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Candidate Resume Display */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <Icon name="file" size={16} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                      {applicant.resumeFileName}
                    </span>
                    <Badge tone="purple">{applicant.resumeScore}% Score</Badge>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      onClick={() => setViewingResume({
                        candidateName: applicant.name,
                        resumeFileName: applicant.resumeFileName,
                        score: applicant.resumeScore,
                        college: applicant.college
                      })}
                    >
                      View Resume
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      onClick={() => downloadStudentResume(applicant.name, applicant.resumeFileName)}
                    >
                      Download
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <select
                      value={currentStatus}
                      onChange={e => handleStatusChange(applicant.id, e.target.value, applicant.name)}
                      style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--line)", background: "white", fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}
                    >
                      <option value="Applied">Applied / New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {viewingResume && (
        <ResumeViewerModal
          candidateName={viewingResume.candidateName}
          resumeFileName={viewingResume.resumeFileName}
          score={viewingResume.score}
          college={viewingResume.college}
          close={() => setViewingResume(null)}
        />
      )}
    </>
  );
}

function IndustryPages({ page, navigate }: { page: string; navigate: (p: string) => void }) {
  if (["candidates", "recommended"].includes(page)) return <CandidateSearch navigate={navigate} />;
  if (page === "matched-students") return <MatchedStudents navigate={navigate} />;
  if (page === "candidate") return <CandidateProfile />;
  if (["analytics", "skill-demand"].includes(page)) return <IndustryAnalytics />;
  if (page === "applications") return <Applications role="industry" />;
  if (page === "opportunities") return <IndustryOpportunities navigate={navigate} />;
  if (page === "post") return <PostOpportunity navigate={navigate} />;
  return <IndustryDashboard navigate={navigate} />;
}

function KpiCard({ label, value, note, icon, tone = "blue" }: { label: string; value: string; note: string; icon: IconName; tone?: string }) {
  return <Card className="kpi-card"><div className={`icon-tile ${tone}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></Card>;
}

function IndustryDashboard({ navigate }: { navigate: (p: string) => void }) {
  const opportunities = useOpportunities();
  return <><div className="welcome"><div><Badge tone="purple"><Icon name="building" size={13} /> INDUSTRY WORKSPACE</Badge><h2>Welcome, TechNova Solutions</h2><p>Here’s what’s happening across your talent pipeline.</p></div><Button onClick={() => navigate("/industry/post")}><Icon name="plus" /> Post opportunity</Button></div><div className="kpi-grid four"><KpiCard label="Active opportunities" value={String(opportunities.length)} note="+3 this month" icon="briefcase" /><KpiCard label="Total applications" value="248" note="+18% vs last month" icon="file" tone="purple" /><KpiCard label="Shortlisted candidates" value="36" note="14 awaiting review" icon="users" tone="green" /><KpiCard label="Average candidate match" value="84%" note="+4.2% this month" icon="spark" tone="orange" /></div><div className="analytics-grid"><Card><SectionTitle title="Top skills in demand" subtitle="Across your active opportunities" action={<Badge tone="gray">Last 30 days</Badge>} /><MiniChart values={[88, 76, 68, 61, 56, 48]} labels={["React", "Python", "SQL", "Java", "Cloud", "AI/ML"]} color="purple" /></Card><Card className="pipeline"><SectionTitle title="Hiring pipeline" /><div className="pipeline-ring"><div><strong>248</strong><span>Applicants</span></div></div>{[["New", 86, "blue"], ["Shortlisted", 36, "purple"], ["Interview", 12, "orange"], ["Selected", 8, "green"]].map(([a, b, c]) => <p key={a}><i className={c as string} /><span>{a}</span><strong>{b}</strong></p>)}</Card></div><SectionTitle title="Recommended candidates" subtitle="AI-matched to your active opportunities" action={<button className="text-link" onClick={() => navigate("/industry/candidates")}>View all candidates <Icon name="arrow" /></button>} /><div className="candidate-grid">{[["Priya Sharma", "91", "94", ["React", "Node.js", "SQL"]], ["Alex Johnson", "82", "92", ["React", "JavaScript", "Python"]], ["Maya Patel", "88", "91", ["Python", "AI/ML", "Cloud"]]].map(c => <CandidateCard data={c as [string, string, string, string[]]} key={c[0] as string} onClick={() => navigate("/industry/candidate")} />)}</div></>;
}

function CandidateCard({ data, onClick, internships = 1, softSkills = [] }: { data: [string, string, string, string[]]; onClick: () => void; internships?: number; softSkills?: string[] }) {
  const [name, readiness, match, skills] = data;
  return <Card className="candidate-card"><div className="candidate-head"><div className="candidate-avatar">{name.split(" ").map(x => x[0]).join("")}</div><div><h3>{name}</h3><p>ABC Institute of Technology</p><small>B.Tech Computer Science · 2025</small></div><Badge tone="green">{match}% match</Badge></div><div className="candidate-score"><ScoreRing score={Number(readiness)} size="small" /><div><span>Industry readiness</span><strong>{Number(readiness) >= 90 ? "Highly Ready" : "Industry Ready"}</strong><small>Verified across 5 dimensions</small></div></div><div className="tag-row">{skills.map(s => <Badge tone="gray" key={s}><Icon name="check" size={11} /> {s}</Badge>)}</div>{softSkills.length > 0 && <div className="candidate-soft-skills"><small>SOFT SKILLS</small><div className="tag-row">{softSkills.map(skill => <Badge tone="purple" key={skill}>{skill}</Badge>)}</div></div>}<div className="candidate-meta"><span><strong>4</strong> Projects</span><span><strong>3</strong> Certifications</span><span><strong>{internships}</strong> {internships === 1 ? "Internship" : "Internships"}</span></div><Button variant="secondary" className="full" onClick={onClick}>View candidate <Icon name="arrow" /></Button></Card>;
}

function CandidateSearch({ navigate }: { navigate: (p: string) => void }) {
  const emptyFilters: CandidateFilters = { skills: [], softSkills: [], experience: "", minimumReadiness: 0 };
  const [filters, setFilters] = useState<CandidateFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFilters>(emptyFilters);
  const [sort, setSort] = useState("match");
  const filtered = filterCandidates(appliedFilters).sort((a, b) => sort === "readiness" ? b.readiness - a.readiness : sort === "experience" ? b.internships - a.internships : b.match - a.match);
  const clear = () => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); };
  return <>
    <div className="welcome"><div><h2>Discover proven talent</h2><p>Select technical skills, soft skills and experience to find suitable candidates.</p></div><Badge tone="purple"><Icon name="spark" size={13} /> Evidence-based discovery</Badge></div>
    <form className="card candidate-filter-panel" onSubmit={event => { event.preventDefault(); setAppliedFilters(filters); }}>
      <div className="candidate-filter-fields">
        <label>Technical skills<select value="" onChange={event => { const value = event.target.value; if (value) setFilters({ ...filters, skills: [...filters.skills, value] }); }}>
          <option value="">Select a skill to add</option>
          {["Java", "Python", "JavaScript", "React", "Node.js", "SQL", "TypeScript", "C", "C++", "AI/ML", "Cloud", "AWS", "Spring", "Django", "Docker"].filter(skill => !filters.skills.includes(skill)).map(skill => <option key={skill} value={skill}>{skill === "JavaScript" ? "JavaScript (JS)" : skill}</option>)}
        </select></label>
        <label>Soft skills<select value="" onChange={event => { const value = event.target.value; if (value) setFilters({ ...filters, softSkills: [...filters.softSkills, value] }); }}>
          <option value="">Select a soft skill to add</option>
          {["Communication", "Teamwork", "Problem solving", "Leadership", "Time management", "Critical thinking"].filter(skill => !filters.softSkills.includes(skill)).map(skill => <option key={skill}>{skill}</option>)}
        </select></label>
        <label>Experience<select value={filters.experience} onChange={event => setFilters({ ...filters, experience: event.target.value })}><option value="">Any experience</option><option value="0">Fresher · No internships</option><option value="1">1 completed internship</option><option value="2+">2+ completed internships</option></select></label>
        <label>Minimum readiness<select value={filters.minimumReadiness} onChange={event => setFilters({ ...filters, minimumReadiness: Number(event.target.value) })}><option value={0}>Any readiness score</option><option value={60}>60+ · Nearly ready</option><option value={75}>75+ · Industry ready</option><option value={90}>90+ · Highly ready</option></select></label>
      </div>
      {(filters.skills.length > 0 || filters.softSkills.length > 0) && <div className="candidate-selected-skills">
        {filters.skills.map(skill => <button type="button" className="badge badge-blue" key={skill} aria-label={`Remove ${skill}`} onClick={() => setFilters({ ...filters, skills: filters.skills.filter(item => item !== skill) })}>{skill} <span aria-hidden="true">×</span></button>)}
        {filters.softSkills.map(skill => <button type="button" className="badge badge-purple" key={skill} aria-label={`Remove ${skill}`} onClick={() => setFilters({ ...filters, softSkills: filters.softSkills.filter(item => item !== skill) })}>{skill} <span aria-hidden="true">×</span></button>)}
      </div>}
      <div className="candidate-filter-footer"><p>Candidates must match all selected skills. Experience is based on completed internships.</p><div><Button variant="secondary" onClick={clear}>Clear filters</Button><Button type="submit"><Icon name="search" /> Search candidates</Button></div></div>
    </form>
    <div className="results-head"><span role="status">{filtered.length} {filtered.length === 1 ? "candidate" : "candidates"} found · Demo talent pool</span><select aria-label="Sort candidates" value={sort} onChange={event => setSort(event.target.value)}><option value="match">Best match first</option><option value="readiness">Highest readiness first</option><option value="experience">Most experience first</option></select></div>
    {filtered.length ? <div className="candidate-grid">{filtered.map(candidate => <CandidateCard data={[candidate.name, String(candidate.readiness), String(candidate.match), candidate.skills]} internships={candidate.internships} softSkills={candidate.softSkills} key={candidate.name} onClick={() => navigate("/industry/candidate")} />)}</div> :
      <Card className="empty-opportunities"><Icon name="users" size={30} /><h3>No candidates match these selections</h3><p>Remove a skill or choose a broader experience range to see more candidates.</p><Button variant="secondary" onClick={clear}>Reset filters</Button></Card>}
  </>;
}

function CandidateProfile() {
  const [shortlisted, setShortlisted] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const allProjects = useProjects();
  const candidateProjects = allProjects.filter(p => p.studentName === "Alex Johnson" || !p.studentName);

  return <><div className="candidate-profile-head"><button className="back-button"><Icon name="arrow" /> Back to candidates</button><div className="candidate-profile-main"><div className="candidate-avatar large">AJ<span><Icon name="check" /></span></div><div><div><h2>Alex Johnson</h2><Badge tone="green">Open to opportunities</Badge></div><p>B.Tech Computer Science · ABC Institute of Technology</p><small>Graduating 2025 · Bengaluru, India</small></div><div className="profile-actions"><Button variant="secondary">Contact candidate</Button><Button onClick={() => setShortlisted(true)}>{shortlisted ? <><Icon name="check" /> Shortlisted</> : <>Shortlist candidate <Icon name="plus" /></>}</Button></div></div></div><div className="candidate-profile-grid"><div><Card className="match-card"><ScoreRing score={92} size="small" /><div><span className="eyebrow">MATCH FOR FRONTEND INTERN</span><h3>Excellent candidate match</h3><p>Alex strongly matches your role through verified React skills, relevant projects and a high assessment score.</p></div></Card><SectionTitle title="Verified skill evidence" subtitle="Capability backed by multiple sources" /><div className="evidence-list"><SkillEvidence name="React" level="Advanced" score={91} projects={3} /><SkillEvidence name="JavaScript" level="Advanced" score={88} projects={4} /><SkillEvidence name="Node.js" level="Intermediate" score={83} projects={2} /></div><SectionTitle title="Student portfolio projects" subtitle="Projects completed by candidate" /><div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>{candidateProjects.map(proj => <Card className="simple-project" key={proj.id}><div className={`icon-tile ${proj.status === "verified" ? "green" : "purple"}`}><Icon name={proj.status === "verified" ? "check" : "spark"} /></div><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0 }}>{proj.title}</h3><Badge tone={proj.status === "verified" ? "green" : "orange"}>{proj.status === "verified" ? "College Verified" : "Student Submitted"}</Badge></div><p style={{ margin: "0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>{proj.detail}</p><div className="tag-row">{proj.tags.map(x => <Badge tone="gray" key={x}>{x}</Badge>)}</div>{proj.githubUrl && <small style={{ display: "block", marginTop: "0.25rem", color: "#0284c7" }}>Repository: {proj.githubUrl}</small>}{proj.fileName && <small style={{ display: "block", color: "#64748b" }}>Attachment: {proj.fileName}</small>}</div></Card>)}</div></div><div><Card className="readiness-side"><span className="eyebrow">INDUSTRY READINESS</span><ScoreRing score={82} /><Badge tone="green">Industry Ready</Badge>{[["Required skills", 86], ["Projects", 78], ["Assessments", 88], ["Skill evidence", 84], ["Professional skills", 82]].map(([x, y]) => <div className="mini-progress" key={x}><span>{x}<b>{y}%</b></span><Progress value={y as number} /></div>)}</Card><Card className="why-card"><span className="eyebrow">AI MATCH EXPLANATION</span><h3>Why this candidate matches</h3>{["Strong React and JavaScript skills", `${candidateProjects.length} completed projects with verified evidence`, "High assessment scores", "Relevant internship experience"].map(x => <p key={x}><Icon name="check" /> {x}</p>)}<p className="caution"><Icon name="chart" /> Limited production testing experience</p></Card><Card><SectionTitle title="Resume" /><div className="resume-download"><Icon name="file" /><div><strong>Alex_Johnson_Resume.pdf</strong><small>Updated 2 days ago · Verified</small></div><div style={{ display: "flex", gap: "6px" }}><Button variant="ghost" onClick={() => setResumeOpen(true)}>Preview</Button><Button variant="secondary" onClick={() => downloadStudentResume("Alex Johnson")}>Download</Button></div></div></Card></div></div>{resumeOpen && <ResumeViewerModal candidateName="Alex Johnson" resumeFileName="Alex_Johnson_Resume.pdf" score={88} close={() => setResumeOpen(false)} />}</>;
}

function IndustryAnalytics() {
  return <><div className="welcome"><div><Badge tone="purple"><Icon name="spark" size={13} /> AI DEMAND INTELLIGENCE</Badge><h2>Skill demand analytics</h2><p>Understand market shifts and find where talent supply falls short.</p></div><Button variant="secondary">Export report</Button></div><div className="kpi-grid"><KpiCard label="Skills tracked" value="48" note="Across 12 roles" icon="spark" /><KpiCard label="Fastest growing" value="AI/ML" note="+38% in 6 months" icon="chart" tone="purple" /><KpiCard label="Largest talent gap" value="Cloud" note="21% supply deficit" icon="users" tone="orange" /></div><div className="analytics-grid"><Card><SectionTitle title="Most in-demand skills" subtitle="Based on active roles and application data" /><MiniChart values={[91, 84, 78, 69, 62, 55]} labels={["AI/ML", "React", "Python", "Cloud", "Analytics", "Cyber"]} color="purple" /></Card><Card><SectionTitle title="Skill growth trends" subtitle="Demand index · Last 6 months" /><div className="line-chart"><svg viewBox="0 0 500 180" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d5dfc" stopOpacity=".3" /><stop offset="1" stopColor="#6d5dfc" stopOpacity="0" /></linearGradient></defs><path d="M0 145 C70 125 85 130 145 100 S230 110 285 65 S390 85 500 20 L500 180 L0 180Z" fill="url(#area)" /><path d="M0 145 C70 125 85 130 145 100 S230 110 285 65 S390 85 500 20" fill="none" stroke="#6d5dfc" strokeWidth="4" /></svg><div>{["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(x => <span key={x}>{x}</span>)}</div></div></Card></div><Card className="supply-card"><SectionTitle title="Industry demand vs student supply" subtitle="Where the biggest opportunities exist" action={<Badge tone="orange">Average gap 14%</Badge>} /><div className="supply-head"><span>Skill</span><span>Demand</span><span>Student supply</span><span>Talent gap</span></div>{[["React", 82, 68, 14], ["Python", 75, 61, 14], ["Cloud", 72, 51, 21], ["AI / ML", 86, 59, 27], ["Data Analytics", 68, 62, 6]].map(([x, d, s, g]) => <div className="supply-row" key={x as string}><strong>{x}</strong><div><Progress value={d as number} /></div><div><Progress value={s as number} tone="green" /></div><Badge tone={g as number > 20 ? "red" : g as number > 10 ? "orange" : "green"}>{g}% gap</Badge></div>)}</Card></>;
}

function MatchedStudents({ navigate }: { navigate: (p: string) => void }) {
  const opportunities = useOpportunities();
  const [selectedOppId, setSelectedOppId] = useState<string>(() => {
    return localStorage.getItem("skillimprove-selected-opportunity") || opportunities[0]?.id || "opp-1";
  });
  const [minMatch, setMinMatch] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [viewingResume, setViewingResume] = useState<{ candidateName: string; resumeFileName?: string; score?: number; college?: string } | null>(null);
  const [shortlistedMap, setShortlistedMap] = useState<Record<string, boolean>>({});
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string>("");

  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0] || {
    id: "opp-1",
    title: "Frontend Developer Intern",
    company: "TechNova Solutions",
    location: "Bengaluru",
    mode: "Hybrid",
    pay: "₹25,000 / month",
    duration: "3 months",
    type: "Internship",
    skills: ["React", "JavaScript", "Git"]
  };

  const pool = [
    {
      name: "Alex Johnson",
      college: "Apex Institute of Technology",
      degree: "B.Tech Computer Science · 2025",
      location: "Bengaluru",
      skills: ["React", "JavaScript", "TypeScript", "Python", "Git", "Node.js"],
      readiness: 84,
      internships: 1,
      collegeVerifiedProjects: [
        { title: "SkillImprove Web Platform", tech: "React, TypeScript, CSS", verifiedBy: "Apex Institute of Technology", github: "https://github.com/alexjohnson-dev/skillimprove" },
        { title: "CampusConnect Student Portal", tech: "Node.js, PostgreSQL", verifiedBy: "Apex Institute of Technology", github: "https://github.com/alexjohnson-dev/campusconnect" }
      ],
      resumeFileName: "Alex_Johnson_Resume.pdf",
      resumeScore: 88,
      baseMatch: 96
    },
    {
      name: "Priya Sharma",
      college: "National Engineering Institute",
      degree: "B.Tech Information Technology · 2025",
      location: "Bengaluru",
      skills: ["Java", "Spring", "SQL", "React", "Cloud", "Git"],
      readiness: 91,
      internships: 2,
      collegeVerifiedProjects: [
        { title: "Enterprise Microservices Hub", tech: "Java, Spring Boot, Docker", verifiedBy: "NEI CS Dept", github: "https://github.com/priyasharma/microservices" }
      ],
      resumeFileName: "Priya_Sharma_Resume.pdf",
      resumeScore: 92,
      baseMatch: 93
    },
    {
      name: "Rahul Verma",
      college: "City University of Technology",
      degree: "B.Tech Computer Science · 2025",
      location: "Pune",
      skills: ["React", "Node.js", "MongoDB", "JavaScript", "Express"],
      readiness: 79,
      internships: 1,
      collegeVerifiedProjects: [
        { title: "Healthcare Appointment Engine", tech: "React, Node.js, Mongo", verifiedBy: "CUT Faculty Cell", github: "https://github.com/rahulverma/health-engine" }
      ],
      resumeFileName: "Rahul_Verma_Resume.pdf",
      resumeScore: 85,
      baseMatch: 89
    },
    {
      name: "Maya Patel",
      college: "State College of Engineering",
      degree: "B.Tech Computer Science · 2025",
      location: "Hyderabad",
      skills: ["React", "TypeScript", "Redux", "AI/ML", "Python"],
      readiness: 88,
      internships: 2,
      collegeVerifiedProjects: [
        { title: "Smart Document Analyzer", tech: "Python, AI/ML, React", verifiedBy: "SCE Research Lab", github: "https://github.com/mayapatel/doc-ai" }
      ],
      resumeFileName: "Maya_Patel_Resume.pdf",
      resumeScore: 90,
      baseMatch: 91
    },
    {
      name: "Rohan Gupta",
      college: "Apex Institute of Technology",
      degree: "B.Tech Computer Science · 2025",
      location: "Bengaluru",
      skills: ["JavaScript", "React", "CSS", "HTML", "Git"],
      readiness: 80,
      internships: 1,
      collegeVerifiedProjects: [
        { title: "E-Commerce Checkout Suite", tech: "React, Tailwind, Stripe", verifiedBy: "Apex Placement Cell", github: "https://github.com/rohangupta/checkout" }
      ],
      resumeFileName: "Rohan_Gupta_Resume.pdf",
      resumeScore: 84,
      baseMatch: 86
    },
    {
      name: "Ananya Sen",
      college: "Apex Institute of Technology",
      degree: "B.Tech Data Science · 2025",
      location: "Bengaluru",
      skills: ["Python", "SQL", "Pandas", "JavaScript", "Django"],
      readiness: 82,
      internships: 1,
      collegeVerifiedProjects: [
        { title: "Predictive Analytics Dashboard", tech: "Python, SQL, Chart.js", verifiedBy: "Apex Placement Cell", github: "https://github.com/ananyasen/analytics" }
      ],
      resumeFileName: "Ananya_Sen_Resume.pdf",
      resumeScore: 86,
      baseMatch: 82
    }
  ];

  const matched = pool.filter(c => {
    const text = `${c.name} ${c.college} ${c.skills.join(" ")}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesScore = c.baseMatch >= minMatch;
    const matchesVerified = !verifiedOnly || c.collegeVerifiedProjects.length > 0;
    return matchesSearch && matchesScore && matchesVerified;
  }).sort((a, b) => b.baseMatch - a.baseMatch);

  return (
    <>
      <div className="welcome">
        <div>
          <Badge tone="purple"><Icon name="spark" size={13} /> AI MATCHING INTELLIGENCE</Badge>
          <h2>Matched Students for Opportunity</h2>
          <p>Candidates dynamically ranked and scored against your active opportunity requirements with verified evidence and resumes.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => navigate("/industry/opportunities")}><Icon name="arrow" /> Back to opportunities</Button>
          <Button onClick={() => navigate("/industry/post")}><Icon name="plus" /> Post new role</Button>
        </div>
      </div>

      {notice && <div className="profile-notice"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}

      <div style={{ marginBottom: "16px" }}>
        <small style={{ display: "block", marginBottom: "8px", color: "var(--muted)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700, letterSpacing: ".06em" }}>Select active opportunity to match against:</small>
        <div className="opp-selector-pills">
          {opportunities.map(opp => (
            <button
              key={opp.id}
              className={`opp-selector-pill ${opp.id === currentOpp.id ? "active" : ""}`}
              onClick={() => {
                setSelectedOppId(opp.id);
                localStorage.setItem("skillimprove-selected-opportunity", opp.id);
              }}
            >
              {opp.title} · {opp.type}
            </button>
          ))}
        </div>
      </div>

      <div className="matched-hero-opp">
        <div className="matched-hero-opp-details">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge tone="purple">{currentOpp.type}</Badge>
            <Badge tone="blue">{currentOpp.mode}</Badge>
            <span style={{ fontSize: "12px", color: "#64748b" }}>{currentOpp.location}</span>
          </div>
          <h3>{currentOpp.title} · {currentOpp.company}</h3>
          <p>Required Skills: {(currentOpp.skills || []).join(", ")} | Comp: {currentOpp.pay} | Duration: {currentOpp.duration}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <strong style={{ fontSize: "22px", color: "#6d5dfc", display: "block" }}>{matched.length}</strong>
            <small style={{ color: "#64748b" }}>Matched Students</small>
          </div>
          <Button onClick={() => navigate("/industry/applications")}>View applicants</Button>
        </div>
      </div>

      <div className="opportunity-filters" style={{ margin: "16px 0" }}>
        <label>
          Search Students or Skills
          <input
            placeholder="Type skill or candidate name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minHeight: "38px", padding: "0 12px", border: "1px solid var(--line)", borderRadius: "9px", background: "white" }}
          />
        </label>
        <label>
          Minimum Match Score
          <select value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}>
            <option value={0}>All matches</option>
            <option value={80}>80%+ Good match</option>
            <option value={90}>90%+ Top matches</option>
            <option value={95}>95%+ Perfect match</option>
          </select>
        </label>
        <label>
          College Verification
          <select value={verifiedOnly ? "yes" : "all"} onChange={e => setVerifiedOnly(e.target.value === "yes")}>
            <option value="all">All students</option>
            <option value="yes">Only with college-verified projects</option>
          </select>
        </label>
        <button className="btn btn-ghost" onClick={() => { setSearch(""); setMinMatch(0); setVerifiedOnly(false); }}>Reset filters</button>
      </div>

      <div className="results-head">
        <span>Showing {matched.length} matched candidates for “{currentOpp.title}”</span>
        <button className="text-link" onClick={() => navigate("/industry/candidates")}>Go to generic candidate directory</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {matched.map(student => {
          const isShortlisted = shortlistedMap[student.name];
          const isInvited = invitedMap[student.name];
          return (
            <Card className="matched-student-card" key={student.name}>
              <div className="matched-student-header">
                <div className="matched-student-bio">
                  <div className="matched-student-avatar">
                    {student.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px" }}>{student.name}</h3>
                      <Badge tone="green">Verified Student</Badge>
                    </div>
                    <p style={{ margin: "2px 0", fontSize: "12px", color: "var(--muted)" }}>{student.degree} · {student.college}</p>
                    <small style={{ color: "#64748b" }}>Location: {student.location} · {student.internships} completed internship</small>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>ROLE MATCH</span>
                    <strong style={{ fontSize: "22px", color: student.baseMatch >= 90 ? "#10b981" : "#4f46e5" }}>{student.baseMatch}%</strong>
                  </div>
                  <Badge tone={student.baseMatch >= 90 ? "green" : "blue"}>{student.baseMatch >= 90 ? "Top Match" : "Strong Match"}</Badge>
                </div>
              </div>

              <div className="matched-breakdown-row">
                <div className="matched-breakdown-item">
                  <span>Required Skills Match</span>
                  <strong>{Math.min(98, student.baseMatch + 2)}% Alignment</strong>
                </div>
                <div className="matched-breakdown-item">
                  <span>College Project Evidence</span>
                  <strong>{student.collegeVerifiedProjects.length} Verified Projects</strong>
                </div>
                <div className="matched-breakdown-item">
                  <span>Industry Readiness</span>
                  <strong>{student.readiness}% ({student.readiness >= 90 ? "Highly Ready" : "Industry Ready"})</strong>
                </div>
              </div>

              <div style={{ margin: "12px 0" }}>
                <small style={{ display: "block", marginBottom: "6px", color: "var(--muted)", fontSize: "11px", fontWeight: 700 }}>SKILLS PROFILE</small>
                <div className="tag-row">
                  {student.skills.map(s => {
                    const isRequired = (currentOpp.skills || []).some(req => req.toLowerCase() === s.toLowerCase());
                    return (
                      <Badge tone={isRequired ? "purple" : "gray"} key={s}>
                        {isRequired && <Icon name="check" size={11} />} {s}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {student.collegeVerifiedProjects.length > 0 && (
                <div style={{ margin: "12px 0", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--line)" }}>
                  <small style={{ display: "block", marginBottom: "4px", color: "var(--muted)", fontSize: "11px", fontWeight: 700 }}>COLLEGE VERIFIED PROJECTS</small>
                  {student.collegeVerifiedProjects.map(proj => (
                    <div key={proj.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", margin: "4px 0" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}>{proj.title} <small style={{ color: "#64748b", fontWeight: 400 }}>({proj.tech})</small></span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Badge tone="green"><Icon name="check" size={10} /> {proj.verifiedBy}</Badge>
                        <a href={proj.github} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--blue)", textDecoration: "none" }}>GitHub</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--ink)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icon name="file" /> {student.resumeFileName}
                  </span>
                  <Badge tone="purple">{student.resumeScore}% Score</Badge>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => setViewingResume({ candidateName: student.name, resumeFileName: student.resumeFileName, score: student.resumeScore, college: student.college })}
                  >
                    View Resume
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => downloadStudentResume(student.name, student.resumeFileName)}
                  >
                    Download
                  </button>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShortlistedMap(prev => ({ ...prev, [student.name]: !isShortlisted }));
                      setNotice(!isShortlisted ? `${student.name} shortlisted for ${currentOpp.title}.` : `${student.name} removed from shortlists.`);
                    }}
                  >
                    {isShortlisted ? <><Icon name="check" /> Shortlisted</> : "Shortlist"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setInvitedMap(prev => ({ ...prev, [student.name]: true }));
                      setNotice(`Interview invite sent to ${student.name} for ${currentOpp.title}!`);
                    }}
                  >
                    {isInvited ? "✓ Interview Sent" : "Invite to Interview"}
                  </Button>
                  <Button onClick={() => navigate("/industry/candidate")}>
                    Candidate Profile <Icon name="arrow" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {viewingResume && (
        <ResumeViewerModal
          candidateName={viewingResume.candidateName}
          resumeFileName={viewingResume.resumeFileName}
          score={viewingResume.score}
          college={viewingResume.college}
          close={() => setViewingResume(null)}
        />
      )}
    </>
  );
}

function IndustryOpportunities({ navigate }: { navigate: (p: string) => void }) {
  const opportunities = useOpportunities();
  return <>
    <div className="welcome">
      <div>
        <Badge tone="purple"><Icon name="briefcase" size={13} /> ACTIVE JOB LISTINGS</Badge>
        <h2>Opportunities Management</h2>
        <p>Manage your company's internship and full-time listings. New roles appear live in the Student Portal immediately.</p>
      </div>
      <Button onClick={() => navigate("/industry/post")}><Icon name="plus" /> Post new opportunity</Button>
    </div>

    <div className="results-head">
      <span>{opportunities.length} opportunities published and accepting applications</span>
      <button className="text-link" onClick={() => navigate("/industry/applications")}>View candidate applications</button>
    </div>

    <div style={{ display: "grid", gap: "1rem" }}>
      {opportunities.map((opp) => (
        <Card key={opp.id} style={{ padding: "1.25rem", borderRadius: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Badge tone={opp.type === "Internship" ? "purple" : "blue"}>{opp.type}</Badge>
                <Badge tone="green">✓ Live in Student Portal</Badge>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{opp.mode}</span>
              </div>
              <h3 style={{ margin: "0 0 0.35rem 0", fontSize: "1.2rem", fontWeight: 700 }}>{opp.title}</h3>
              <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.9rem" }}>{opp.company} · {opp.location}</p>
              <p style={{ margin: "0 0 0.75rem 0", color: "#64748b", fontSize: "0.85rem", lineHeight: 1.5 }}>{opp.description}</p>
              <div className="tag-row" style={{ marginBottom: "0.5rem" }}>
                {(opp.skills || []).map(skill => <Badge tone="gray" key={skill}>{skill}</Badge>)}
              </div>
              <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: "#64748b", flexWrap: "wrap" }}>
                <span>Compensation: <strong style={{ color: "#0f172a" }}>{opp.pay}</strong></span>
                <span>Duration: <strong style={{ color: "#0f172a" }}>{opp.duration}</strong></span>
                <span>Openings: <strong style={{ color: "#0f172a" }}>{opp.openings || 2}</strong></span>
                {opp.deadline && <span>Deadline: {opp.deadline}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "160px" }}>
              <Button onClick={() => navigate("/industry/applications")}>View applicants</Button>
              <Button variant="secondary" onClick={() => {
                localStorage.setItem("skillimprove-selected-opportunity", opp.id);
                navigate("/industry/matched-students");
              }}>Search matched students</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </>;
}

function PostOpportunity({ navigate }: { navigate: (p: string) => void }) {
  const [type, setType] = useState("Internship");
  const [title, setTitle] = useState("Frontend Developer Intern");
  const [company, setCompany] = useState("TechNova Solutions");
  const [location, setLocation] = useState("Bengaluru");
  const [mode, setMode] = useState("Hybrid");
  const [stipend, setStipend] = useState("₹25,000 / month");
  const [duration, setDuration] = useState("3 months");
  const [deadline, setDeadline] = useState("2025-08-30");
  const [openings, setOpenings] = useState(4);
  const [skills, setSkills] = useState<string[]>(["React", "JavaScript", "Git"]);
  const [newSkill, setNewSkill] = useState("");
  const [description, setDescription] = useState("Join our product team to build intuitive, performant web experiences used by thousands of customers. Collaborate with senior engineers on frontend architecture and production features.");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const addSkillTag = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkillTag = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || skills.length === 0) {
      setError("Please provide a title, company, location, and at least one required skill.");
      return;
    }

    const created = addOpportunity({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      mode,
      type,
      match: 88,
      skills,
      missing: "Docker",
      pay: stipend.trim(),
      duration: duration.trim(),
      description: description.trim(),
      openings: Number(openings) || 1,
      deadline,
    });

    addStudentNotice({
      id: `opp-notice-${created.id}`,
      title: `New opportunity: ${created.title} at ${created.company}`,
      detail: `${created.type} in ${created.location} (${created.mode}) · ${created.pay}. Now accepting student applications!`,
      path: "jobs",
    });

    setNotice(`Opportunity "${created.title}" successfully published! It is now live in the Student Portal.`);
    setTimeout(() => {
      navigate("/industry/opportunities");
    }, 1200);
  };

  return <>
    <div className="welcome">
      <div>
        <h2>Create a new opportunity</h2>
        <p>Define the role and publish it instantly to students in the Student Portal.</p>
      </div>
      <Button variant="secondary" onClick={() => navigate("/industry/opportunities")}>Back to opportunities</Button>
    </div>

    {notice && (
      <div className="profile-notice" role="status" style={{ marginBottom: "1.25rem", background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
        <span><strong>Success:</strong> {notice}</span>
        <button aria-label="Dismiss" onClick={() => setNotice("")}>×</button>
      </div>
    )}

    {error && (
      <div className="form-error" style={{ marginBottom: "1.25rem" }}>
        {error}
      </div>
    )}

    <Card className="opportunity-form">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <span>1</span>
          <div>
            <h3>Opportunity type</h3>
            <p>What kind of opportunity are you offering?</p>
            <div className="type-options">
              {["Internship", "Full-time job", "Apprenticeship", "Training"].map((x) => (
                <button
                  type="button"
                  className={type === x ? "active" : ""}
                  key={x}
                  onClick={() => setType(x)}
                >
                  <Icon name={x === "Training" ? "book" : "briefcase"} />
                  {x}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <span>2</span>
          <div>
            <h3>Role details</h3>
            <p>Tell candidates about the opportunity.</p>
            <div className="form-grid">
              <label className="wide">Job title<input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Full Stack Developer Intern" /></label>
              <label className="wide">Description<textarea value={description} onChange={e => setDescription(e.target.value)} required /></label>
              <label>Company Name<input value={company} onChange={e => setCompany(e.target.value)} required /></label>
              <label>Location<input value={location} onChange={e => setLocation(e.target.value)} required /></label>
              <label>Work mode<select value={mode} onChange={e => setMode(e.target.value)}><option>Hybrid</option><option>Remote</option><option>On-site</option></select></label>
              <label>Stipend / Compensation<input value={stipend} onChange={e => setStipend(e.target.value)} required /></label>
              <label>Duration<input value={duration} onChange={e => setDuration(e.target.value)} required /></label>
              <label>Application deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label>
              <label>Number of openings<input type="number" min="1" value={openings} onChange={e => setOpenings(Number(e.target.value))} /></label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <span>3</span>
          <div>
            <h3>Skills and eligibility</h3>
            <p>Skills power candidate matching and explanations. Candidates can match regardless of whether skills are labeled technical or general.</p>
            <label>Required skills
              <div className="tag-input" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
                {skills.map(x => (
                  <button
                    type="button"
                    key={x}
                    onClick={() => removeSkillTag(x)}
                    style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "9999px", padding: "0.2rem 0.6rem", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    {x} <span>×</span>
                  </button>
                ))}
                <div style={{ display: "flex", gap: "0.25rem", flex: 1, minWidth: "180px" }}>
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillTag(); } }}
                    placeholder="Type skill & press Enter..."
                    style={{ border: "1px solid #cbd5e1", borderRadius: "0.375rem", padding: "0.3rem 0.6rem", fontSize: "0.85rem", flex: 1 }}
                  />
                  <Button type="button" variant="secondary" onClick={addSkillTag} style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}>Add</Button>
                </div>
              </div>
            </label>
            <div className="form-grid" style={{ marginTop: "1rem" }}>
              <label>Experience required<select><option>0–1 years</option><option>Fresher / Final Year</option><option>1–2 years</option></select></label>
              <label>Education<select><option>B.Tech / B.E. Computer Science</option><option>Any Engineering Graduate</option><option>BCA / MCA</option></select></label>
            </div>
          </div>
        </div>

        <div className="form-submit">
          <Button variant="secondary" type="button" onClick={() => navigate("/industry/opportunities")}>Cancel</Button>
          <Button type="submit">Publish opportunity <Icon name="arrow" /></Button>
        </div>
      </form>
    </Card>
  </>;
}

function downloadPlacementReportCsv() {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      "ABC Institute of Technology - Placement & Institutional Readiness Report 2025",
      "Export Date," + new Date().toLocaleDateString(),
      "",
      "Department,Total Students,Assessed %,Industry Ready %,Placed Students,Placement %,Avg Package (LPA),Highest Package (LPA),Top Hiring Partner",
      "Computer Science & Eng,1280,94%,84%,1140,89%,9.8,28.5,TechNova Solutions",
      "Information Technology,960,96%,81%,825,86%,8.9,24.0,GlobalSoft",
      "Electronics & Comm,880,90%,73%,686,78%,7.6,18.0,CloudSphere Labs",
      "Electrical & Electronics,740,86%,68%,532,72%,6.8,14.5,BrightStack",
      "Mechanical Engineering,620,82%,62%,415,67%,6.2,12.0,Apex Cloud Labs",
      "",
      "Institutional Highlights:",
      "Overall Placement Rate: 82% (Target: 80% - Exceeded)",
      "Total Active Industry Partnerships: 32 Companies",
      "Average Student Readiness: 76/100",
      "Students Verified with Real Projects: 2480"
    ].join("\n");
  const encoded = encodeURI(csvContent);
  const a = document.createElement("a");
  a.href = encoded;
  a.download = "ABC_Institute_Placement_Report_2025.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function CollegePages({ page, navigate }: { page: string; navigate: (p: string) => void }) {
  if (["skills", "student-skills"].includes(page)) return <CollegeSkills />;
  if (page === "verify-projects") return <CollegeVerifyProjects />;
  if (page === "training") return <Training />;
  if (page === "connections") return <Connections />;
  if (["placements", "reports"].includes(page)) return <Placements />;
  if (page === "students") return <StudentManagement navigate={navigate} />;
  return <CollegeDashboard navigate={navigate} />;
}

function CollegeVerifyProjects() {
  const projects = useProjects();
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [notice, setNotice] = useState("");

  const filtered = projects.filter((p) => {
    if (filter === "pending") return p.status === "pending";
    if (filter === "verified") return p.status === "verified";
    return true;
  });

  const handleVerify = (id: string, title: string, student: string) => {
    verifyStudentProject(id, "ABC Institute of Technology");
    setNotice(`Project "${title}" by ${student} has been verified! Evidence is now approved for industry recruiters.`);
  };

  return (
    <>
      <div className="welcome">
        <div>
          <Badge tone="green"><Icon name="check" size={13} /> COLLEGE VERIFICATION PORTAL</Badge>
          <h2>Student Project Verification</h2>
          <p>Review uploaded student projects, inspect code repositories and attachments, and approve verified credentials.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>All ({projects.length})</Button>
          <Button variant={filter === "pending" ? "primary" : "secondary"} onClick={() => setFilter("pending")}>Pending ({projects.filter(p => p.status === "pending").length})</Button>
          <Button variant={filter === "verified" ? "primary" : "secondary"} onClick={() => setFilter("verified")}>Verified ({projects.filter(p => p.status === "verified").length})</Button>
        </div>
      </div>

      {notice && (
        <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>
          {notice}
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map((proj) => (
          <Card key={proj.id} style={{ padding: "1.25rem", borderRadius: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span className="eyebrow" style={{ margin: 0 }}>STUDENT: {proj.studentName} ({proj.college || "ABC Institute of Technology"})</span>
                  <Badge tone={proj.status === "verified" ? "green" : "orange"}>
                    {proj.status === "verified" ? "✓ Verified" : "Pending Verification"}
                  </Badge>
                </div>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 700 }}>{proj.title}</h3>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", color: "#475569" }}>{proj.detail}</p>
                <div className="tag-row" style={{ marginBottom: "0.5rem" }}>
                  {proj.tags.map(t => <Badge tone="blue" key={t}>{t}</Badge>)}
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "#64748b" }}>
                  {proj.fileName && <span>Attachment: <strong>{proj.fileName}</strong> ({proj.fileSize || "File"})</span>}
                  {proj.githubUrl && <span>Repository: <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>{proj.githubUrl}</a></span>}
                  <span>Submitted: {proj.submittedAt}</span>
                  {proj.verifiedAt && <span style={{ color: "#10b981", fontWeight: 600 }}>Verified: {proj.verifiedAt}</span>}
                </div>
              </div>
              <div>
                {proj.status === "pending" ? (
                  <Button onClick={() => handleVerify(proj.id, proj.title, proj.studentName)}>
                    <Icon name="check" /> Verify Project
                  </Button>
                ) : (
                  <Badge tone="green" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>
                    ✓ College Verified
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="empty-opportunities">
            <Icon name="check" size={32} />
            <h3>No projects found in this view</h3>
            <p>All student projects in this category have been processed.</p>
          </Card>
        )}
      </div>
    </>
  );
}

function CollegeDashboard({ navigate }: { navigate: (p: string) => void }) {
  const [recOpen, setRecOpen] = useState(false);
  const [toast, setToast] = useState("");

  const handleExport = () => {
    downloadPlacementReportCsv();
    setToast("ABC Institute Placement Report 2025 exported successfully.");
  };

  return <><div className="welcome"><div><Badge tone="green"><Icon name="building" size={13} /> INSTITUTION WORKSPACE</Badge><h2>Welcome, ABC Institute of Technology</h2><p>Track readiness, close skill gaps and improve student outcomes.</p></div><Button variant="secondary" onClick={handleExport}>Download report</Button></div>
  {toast && <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>{toast}<button aria-label="Dismiss" onClick={() => setToast("")}>×</button></div>}
  <div className="kpi-grid six"><KpiCard label="Total students" value="4,820" note="+240 this year" icon="users" /><KpiCard label="Industry ready" value="68%" note="+7% vs last year" icon="check" tone="green" /><KpiCard label="Students with gaps" value="1,245" note="26% of students" icon="chart" tone="orange" /><KpiCard label="Industry partners" value="32" note="+6 this semester" icon="briefcase" tone="purple" /><KpiCard label="Placement rate" value="82%" note="+5.4% YoY" icon="building" tone="green" /><KpiCard label="Avg. readiness" value="76/100" note="+4 points this term" icon="spark" /></div><div className="analytics-grid college"><Card><SectionTitle title="Student skill distribution" subtitle="Students with verified intermediate+ proficiency" /><MiniChart values={[84, 78, 65, 57, 52, 41]} labels={["Programming", "Web Dev", "Data", "AI/ML", "Cloud", "Cyber"]} color="green" /></Card><Card><SectionTitle title="Skill gap overview" subtitle="Highest priority institutional gaps" action={<button className="text-link" onClick={() => navigate("/college/verify-projects")}>Verify projects <Icon name="arrow" /></button>} />{[["Cloud Computing", 32, 68], ["AI / Machine Learning", 38, 62], ["Technical Communication", 42, 58], ["React Development", 51, 49]].map(([x, supply, gap]) => <div className="college-gap" key={x as string}><div><strong>{x}</strong><Badge tone={gap as number > 60 ? "red" : "orange"}>{gap}% gap</Badge></div><Progress value={supply as number} tone={supply as number < 40 ? "red" : "orange"} /><small>{supply}% student supply</small></div>)}</Card></div><div className="analytics-grid"><Card><SectionTitle title="Placement trend" subtitle="Placement rate across graduating cohorts" /><div className="line-chart"><svg viewBox="0 0 500 180" preserveAspectRatio="none"><defs><linearGradient id="greenarea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12a174" stopOpacity=".28" /><stop offset="1" stopColor="#12a174" stopOpacity="0" /></linearGradient></defs><path d="M0 155 C80 140 100 145 165 110 S245 120 320 65 S410 70 500 25 L500 180 L0 180Z" fill="url(#greenarea)" /><path d="M0 155 C80 140 100 145 165 110 S245 120 320 65 S410 70 500 25" fill="none" stroke="#12a174" strokeWidth="4" /></svg><div>{["2020", "2021", "2022", "2023", "2024", "2025"].map(x => <span key={x}>{x}</span>)}</div></div></Card><Card className="insight-card"><span className="spark-icon"><Icon name="spark" /></span><Badge tone="purple">AI INSIGHT</Badge><h3>React training could unlock 126 students.</h3><p>42% of final-year students targeting frontend roles have a React gap. A focused 4-week program could improve average readiness by 15 points.</p><Button onClick={() => setRecOpen(true)}>View recommendation <Icon name="arrow" /></Button></Card></div>
  {recOpen && (
    <FeatureDialog title="AI Curriculum Recommendation" close={() => setRecOpen(false)}>
      <div style={{ padding: "0.5rem 0" }}>
        <Badge tone="purple"><Icon name="spark" size={12} /> HIGHEST PLACEMENT IMPACT</Badge>
        <h3 style={{ margin: "0.5rem 0", fontSize: "1.25rem" }}>Advanced React & Web Architecture Sprint</h3>
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>
          Analysis of 1,240 partner job postings shows 68% require intermediate React proficiency, but only 51% of your final-year Computer Science students have verified evidence.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "1rem 0", background: "#f8fafc", padding: "1rem", borderRadius: "0.5rem" }}>
          <div><small style={{ color: "#64748b" }}>Target Cohort:</small><strong style={{ display: "block" }}>126 CS/IT Students</strong></div>
          <div><small style={{ color: "#64748b" }}>Duration:</small><strong style={{ display: "block" }}>4 Weeks (Intensive)</strong></div>
          <div><small style={{ color: "#64748b" }}>Projected Readiness:</small><strong style={{ display: "block", color: "#10b981" }}>+15 Points (76 ➔ 91)</strong></div>
          <div><small style={{ color: "#64748b" }}>Hiring Partners:</small><strong style={{ display: "block" }}>TechNova, GlobalSoft</strong></div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
          <Button variant="secondary" onClick={() => setRecOpen(false)}>Close</Button>
          <Button onClick={() => { setRecOpen(false); navigate("/college/training"); }}>Open Training Program Workspace <Icon name="arrow" /></Button>
        </div>
      </div>
    </FeatureDialog>
  )}
  </>;
}

function CollegeSkills() {
  return <><div className="welcome"><div><Badge tone="purple"><Icon name="spark" size={13} /> LIVE SKILL INTELLIGENCE</Badge><h2>Institutional skill analytics</h2><p>Understand capability and gaps across every department.</p></div><div className="filter-row"><button>2025 cohort ⌄</button><button>All departments ⌄</button></div></div><div className="top-skill-grid">{[["React", 78, "+12%"], ["Python", 74, "+8%"], ["Java", 71, "+4%"], ["SQL", 68, "+9%"], ["Cloud", 52, "+16%"]].map(([x, v, g], i) => <Card key={x as string}><span>{i + 1}</span><div><h3>{x}</h3><Progress value={v as number} tone="green" /><small>{v}% proficient</small></div><Badge tone="green">{g}</Badge></Card>)}</div><Card className="skill-gap-table"><SectionTitle title="Skill gaps vs industry requirements" subtitle="Prioritized by placement impact" /><div className="supply-head"><span>Skill</span><span>Current level</span><span>Industry requirement</span><span>Gap</span></div>{[["Cloud Computing", 41, 74, 33], ["AI / ML", 46, 76, 30], ["React", 58, 82, 24], ["Technical Communication", 63, 84, 21], ["Data Analytics", 61, 78, 17]].map(([x, c, r, g]) => <div className="supply-row" key={x as string}><strong>{x}</strong><span>{c}%</span><span>{r}%</span><Badge tone={g as number > 25 ? "red" : "orange"}>{g}% gap</Badge></div>)}</Card><SectionTitle title="Department comparison" subtitle="Average industry readiness score" /><div className="department-grid">{[["Computer Science", 82, 1280], ["Information Technology", 79, 960], ["Electronics", 71, 880], ["Mechanical", 66, 740]].map(([x, score, count], i) => <Card key={x as string}><Badge tone={i < 2 ? "green" : "orange"}>#{i + 1}</Badge><h3>{x}</h3><strong>{score}<small>/100</small></strong><Progress value={score as number} tone={i < 2 ? "green" : "orange"} /><p>{count.toLocaleString()} students assessed</p></Card>)}</div></>;
}

function Training() {
  const [programsList, setProgramsList] = useState<CustomProgram[]>(getPrograms);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewRecModalOpen, setViewRecModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>("Advanced React Development");
  const [notice, setNotice] = useState("");

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    const skill = String(data.get("skill") || "").trim();
    const department = String(data.get("department") || "Computer Science").trim();
    const duration = String(data.get("duration") || "4 weeks").trim();
    const targetStudents = Number(data.get("targetStudents") || 100);
    const expectedPoints = Number(data.get("expectedPoints") || 12);
    const industryPartner = String(data.get("industryPartner") || "TechNova Solutions").trim();

    if (!title || !skill) return;

    const newProg = addCustomProgram({
      title,
      skill,
      department,
      duration,
      targetStudents,
      expectedPoints,
      industryPartner,
    });

    setProgramsList([newProg, ...programsList]);
    setCreateModalOpen(false);
    setNotice(`Custom training program "${title}" created successfully! Enrolling eligible students.`);
  };

  return <><div className="welcome"><div><Badge tone="purple"><Icon name="spark" size={13} /> AI-RECOMMENDED PROGRAMS</Badge><h2>Close the gaps that matter most</h2><p>Training recommendations based on student gaps and live industry demand.</p></div><Button onClick={() => setCreateModalOpen(true)}><Icon name="plus" /> Create custom program</Button></div>
  {notice && <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}>×</button></div>}
  <Card className="featured-training"><div className="training-art"><Icon name="book" size={46} /><Badge tone="purple">TOP RECOMMENDATION</Badge></div><div><span className="eyebrow">HIGHEST PLACEMENT IMPACT</span><h2>Advanced React Development</h2><p>42% of final-year students targeting frontend roles have a React skill gap.</p><div className="training-stats"><div><strong>126</strong><span>Target students</span></div><div><strong>+15</strong><span>Readiness points</span></div><div><strong>4 weeks</strong><span>Duration</span></div><div><strong>High</strong><span>Industry demand</span></div></div><div className="match-explain"><Icon name="spark" /><div><strong>Why this program?</strong><p>React appears in 68% of partner frontend roles, but only 51% of eligible students meet the required level.</p></div></div><Button onClick={() => { setSelectedProgram("Advanced React Development"); setViewRecModalOpen(true); }}>View recommendation details <Icon name="arrow" /></Button></div></Card>
  
  <SectionTitle title="Active & Recommended Programs" subtitle="Curriculum tracks configured for institutional gap closure" />
  <div className="training-grid">
    {programsList.map((prog, i) => (
      <Card key={prog.id || prog.title}>
        <div className={`icon-tile ${i % 2 ? "green" : "purple"}`}><Icon name="book" /></div>
        <Badge tone={i % 2 ? "green" : "purple"}>{prog.skill}</Badge>
        <h3>{prog.title}</h3>
        <p>{prog.department} · {prog.industryPartner ? `Sponsored by ${prog.industryPartner}` : "Institutional Program"}</p>
        <div><span>Target students <strong>{prog.targetStudents}</strong></span><span>Expected impact <strong>+{prog.expectedPoints} pts</strong></span></div>
        <Button variant="secondary" className="full" onClick={() => { setSelectedProgram(prog.title); setViewRecModalOpen(true); }}>View program</Button>
      </Card>
    ))}
    {[["Python for Data Science", "98", "+12", "Python"], ["Cloud Fundamentals", "184", "+11", "Cloud"], ["AI/ML Foundations", "142", "+14", "AI/ML"], ["Technical Communication", "216", "+8", "Soft skill"]].map(([x, students, points, skill], i) => (
      <Card key={x}><div className={`icon-tile ${i % 2 ? "green" : "purple"}`}><Icon name="book" /></div><Badge tone={i % 2 ? "green" : "purple"}>{skill}</Badge><h3>{x}</h3><p>Recommended from institutional gaps and employer demand signals.</p><div><span>Target students <strong>{students}</strong></span><span>Expected impact <strong>{points} pts</strong></span></div><Button variant="secondary" className="full" onClick={() => { setSelectedProgram(x); setViewRecModalOpen(true); }}>View program</Button></Card>
    ))}
  </div>

  {createModalOpen && (
    <FeatureDialog title="Create Custom Training Program" close={() => setCreateModalOpen(false)}>
      <form onSubmit={handleCreate}>
        <div className="form-grid">
          <label className="wide">Program Title<input name="title" required defaultValue="Full Stack React & Cloud Sprint" /></label>
          <label>Focus Skill<input name="skill" required defaultValue="React" /></label>
          <label>Department<select name="department"><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>All Departments</option></select></label>
          <label>Duration<select name="duration"><option>3 weeks</option><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option></select></label>
          <label>Target Students<input name="targetStudents" type="number" defaultValue={120} /></label>
          <label>Expected Readiness Points<input name="expectedPoints" type="number" defaultValue={14} /></label>
          <label className="wide">Industry Partner Sponsor<select name="industryPartner"><option>TechNova Solutions</option><option>GlobalSoft Technologies</option><option>CloudSphere Labs</option><option>BrightStack Systems</option></select></label>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button type="submit">Create Program <Icon name="arrow" /></Button>
        </div>
      </form>
    </FeatureDialog>
  )}

  {viewRecModalOpen && (
    <FeatureDialog title={`Program Recommendation: ${selectedProgram}`} close={() => setViewRecModalOpen(false)}>
      <div>
        <Badge tone="purple"><Icon name="spark" size={12} /> AI CURRICULUM SYLLABUS</Badge>
        <h3 style={{ margin: "0.5rem 0" }}>{selectedProgram}</h3>
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>
          This program directly addresses verified skill deficits identified in student assessments and aligns with employer hiring criteria.
        </p>
        <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", margin: "1rem 0" }}>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>Curriculum Modules:</h4>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155", fontSize: "0.85rem", lineHeight: 1.6 }}>
            <li>Core Architecture & State Management (Week 1)</li>
            <li>Production Integration, REST APIs & Testing (Week 2)</li>
            <li>Capstones: Full-Stack Project with Git Verification (Week 3)</li>
            <li>Industry Mock Assessment & Recruiter Review (Week 4)</li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setViewRecModalOpen(false)}>Close</Button>
          <Button onClick={() => { setViewRecModalOpen(false); setNotice(`Cohort enrolled in ${selectedProgram}!`); }}>Enroll Eligible Cohort <Icon name="check" /></Button>
        </div>
      </div>
    </FeatureDialog>
  )}
  </>;
}

function Connections() {
  const [connectionsList, setConnectionsList] = useState<IndustryConnection[]>(getConnections);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const handleConnect = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const company = String(data.get("company") || "").trim();
    const partnershipType = String(data.get("partnershipType") || "").trim();
    const department = String(data.get("department") || "Computer Science").trim();
    const studentsInvolved = String(data.get("studentsInvolved") || "60 students").trim();

    if (!company) return;

    const newConn = addConnection({
      company,
      partnershipType,
      department,
      studentsInvolved,
      outcomes: "Proposal pending",
      status: "Connected",
    });

    setConnectionsList([newConn, ...connectionsList]);
    setConnectModalOpen(false);
    setNotice(`Connection established with ${company}! Partnership proposal has been sent.`);
  };

  return <><div className="welcome"><div><h2>Industry connections</h2><p>Build partnerships that create real learning and employment outcomes.</p></div><Button onClick={() => setConnectModalOpen(true)}><Icon name="plus" /> Connect with industry</Button></div>
  {notice && <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}>×</button></div>}
  <div className="kpi-grid"><KpiCard label="Active partnerships" value={String(connectionsList.length + 28)} note="+6 this semester" icon="briefcase" tone="purple" /><KpiCard label="Students involved" value="1,240" note="Across 18 departments" icon="users" /><KpiCard label="Opportunities created" value="286" note="This academic year" icon="spark" tone="green" /></div>
  <Card className="data-table"><div className="table-row connection header">{["Company", "Partnership type", "Students involved", "Outcomes", "Status", ""].map(x => <span key={x}>{x}</span>)}</div>
  {connectionsList.map(r => <div className="table-row connection" key={r.id || r.company}>
    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <i className="table-avatar">{r.company.split(" ").map(x => x[0]).join("").slice(0, 2)}</i>
      <strong>{r.company}</strong>
    </span>
    <span>{r.partnershipType}</span>
    <span>{r.studentsInvolved}</span>
    <span>{r.outcomes}</span>
    <span><Badge tone={r.status === "Active" || r.status === "Connected" ? "green" : "orange"}>{r.status}</Badge></span>
    <Button variant="ghost" onClick={() => setNotice(`Viewing partner agreement with ${r.company}.`)}>View <Icon name="arrow" /></Button>
  </div>)}
  </Card>

  {connectModalOpen && (
    <FeatureDialog title="Connect with Industry Partner" close={() => setConnectModalOpen(false)}>
      <form onSubmit={handleConnect}>
        <div className="form-grid">
          <label className="wide">Partner Company<select name="company"><option>Veloce Technologies</option><option>Apex Cloud Labs</option><option>Cognitive Nexus</option><option>TechNova Solutions</option><option>GlobalSoft Technologies</option><option>CloudSphere Labs</option></select></label>
          <label>Partnership Type<select name="partnershipType"><option>Internships + Training</option><option>Hiring Partnership</option><option>Campus Recruitment Drive</option><option>Curriculum Sponsorship</option></select></label>
          <label>Target Department<select name="department"><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>All Engineering</option></select></label>
          <label className="wide">Expected Student Intake<input name="studentsInvolved" defaultValue="60 students" /></label>
          <label className="wide">Partnership Proposal Notes<textarea defaultValue="We would like to connect your hiring managers with our pre-assessed, verified student talent pool for upcoming summer internships." /></label>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button variant="secondary" type="button" onClick={() => setConnectModalOpen(false)}>Cancel</Button>
          <Button type="submit">Send Connection Invitation <Icon name="arrow" /></Button>
        </div>
      </form>
    </FeatureDialog>
  )}
  </>;
}

function Placements() {
  const [toast, setToast] = useState("");

  const handleExport = () => {
    downloadPlacementReportCsv();
    setToast("ABC_Institute_Placement_Report_2025.csv downloaded successfully.");
  };

  return <><div className="welcome"><div><h2>Placement analytics</h2><p>Measure outcomes and identify the factors that drive student success.</p></div><Button variant="secondary" onClick={handleExport}>Export placement report</Button></div>
  {toast && <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>{toast}<button aria-label="Dismiss" onClick={() => setToast("")}>×</button></div>}
  <div className="kpi-grid four"><KpiCard label="Placement rate" value="82%" note="+5.4% year over year" icon="check" tone="green" /><KpiCard label="Internship rate" value="74%" note="+9% vs previous cohort" icon="briefcase" /><KpiCard label="Average package" value="₹8.4L" note="+12% year over year" icon="chart" tone="purple" /><KpiCard label="Industry ready" value="68%" note="3,278 students" icon="spark" tone="orange" /></div><div className="analytics-grid"><Card><SectionTitle title="Department-wise placements" subtitle="Placement rate by department" /><MiniChart values={[91, 87, 78, 71, 68, 62]} labels={["CSE", "IT", "ECE", "EEE", "Mech", "Civil"]} color="green" /></Card><Card><SectionTitle title="Top hiring companies" />{[["TechNova Solutions", 84], ["GlobalSoft", 72], ["CloudSphere", 58], ["BrightStack", 46], ["DataPulse", 38]].map(([x, n], i) => <div className="hiring-row" key={x as string}><span>{i + 1}</span><div><strong>{x}</strong><small>{n} students hired</small></div><Progress value={(n as number)} tone="green" /></div>)}</Card></div><Card><SectionTitle title="Placement trend" subtitle="Five-year improvement across the institution" /><div className="line-chart large"><svg viewBox="0 0 900 200" preserveAspectRatio="none"><path d="M0 170 C120 155 150 160 270 125 S430 115 540 85 S720 80 900 20" fill="none" stroke="#12a174" strokeWidth="5" /></svg><div>{["2021 · 64%", "2022 · 68%", "2023 · 73%", "2024 · 77%", "2025 · 82%"].map(x => <span key={x}>{x}</span>)}</div></div></Card></>;
}

function StudentManagement({ navigate }: { navigate: (p: string) => void }) {
  const students = [["Alex Johnson", "Computer Science", "4th", "82", "React", "SQL", "Shortlisted"], ["Priya Sharma", "Information Tech", "4th", "91", "Node.js", "Cloud", "Placed"], ["Rahul Verma", "Computer Science", "3rd", "74", "Java", "Communication", "Seeking"], ["Maya Patel", "Electronics", "4th", "88", "Python", "Cloud", "Interview"], ["Sara Khan", "Computer Science", "3rd", "79", "React", "Testing", "Seeking"]];
  const [toast, setToast] = useState("");

  const handleExportData = () => {
    downloadPlacementReportCsv();
    setToast("Student records and assessment data exported.");
  };

  return <><div className="welcome"><div><h2>Student management</h2><p>Track individual readiness, skill gaps, verified projects, and placement progress.</p></div><div style={{ display: "flex", gap: "0.5rem" }}><Button onClick={() => navigate("/college/verify-projects")}><Icon name="check" /> Verify Student Projects</Button><Button variant="secondary" onClick={handleExportData}>Export student data</Button></div></div>
  {toast && <div className="profile-notice" role="status" style={{ marginBottom: "1rem" }}>{toast}<button aria-label="Dismiss" onClick={() => setToast("")}>×</button></div>}
  <div className="candidate-search"><div><Icon name="search" /><input placeholder="Search students by name, skill or department" /></div><Button>Search students</Button></div><div className="filter-row">{["Department", "Year", "Skill", "Readiness", "Placement status"].map(x => <button key={x}>{x} ⌄</button>)}</div><Card className="data-table"><div className="table-row students header">{["Student", "Department", "Year", "Readiness", "Top skill", "Skill gap", "Placement"].map(x => <span key={x}>{x}</span>)}</div>{students.map(r => <div className="table-row students" key={r[0]}>{r.map((v, i) => <span key={v}>{i === 0 && <i className="table-avatar">{v.split(" ").map(x => x[0]).join("")}</i>}{i === 3 ? <b className="score-chip">{v}</b> : i === 6 ? <Badge tone={v === "Placed" ? "green" : v === "Interview" ? "purple" : "blue"}>{v}</Badge> : v}</span>)}</div>)}</Card></>;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname + window.location.search);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  const navigate = (next: string) => { window.history.pushState({}, "", next); setPath(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const logout = () => { localStorage.removeItem("skill-role"); navigate("/login"); };
  const pathname = path.split("?")[0];
  if (pathname === "/") return <Landing navigate={navigate} />;
  if (pathname === "/login") {
    const q = new URLSearchParams(path.split("?")[1] || "");
    const selected = q.get("role") as Role;
    return <Login navigate={navigate} initialRole={selected && roleConfig[selected] ? selected : "student"} />;
  }
  const [, rolePart, page = "dashboard"] = pathname.split("/");
  const role = rolePart as Role;
  if (!roleConfig[role]) return <Landing navigate={navigate} />;
  return <AppShell role={role} page={page} navigate={navigate} logout={logout} />;
}
