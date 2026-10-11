import { useEffect, useRef, useState } from "react"
import { UserAvatar, AvatarRole } from "./UserAvatar"

interface HeaderAccountCardProps {
  role: "student" | "industry" | "college"
  name: string
  roleLabel: string
  navigate: (path: string) => void
  onOpenSettings: () => void
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
  shortlistedCount?: number
}

export function HeaderAccountCard({
  role,
  name,
  roleLabel,
  navigate,
  onOpenSettings,
  isDark,
  onToggleTheme,
  onLogout,
  shortlistedCount = 0,
}: HeaderAccountCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const email =
    role === "student"
      ? "alex.johnson@example.com"
      : role === "industry"
        ? "talent@technova.io"
        : "admin@apex.edu"

  return (
    <div className="account-card-container" ref={containerRef}>
      <button
        type="button"
        className={`account-card-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="User Account Card and Profile Menu"
        title="Account Card · View options"
      >
        <div className="account-card-avatar-box">
          <UserAvatar
            role={role as AvatarRole}
            name={name}
            size={36}
            showStatus
          />
        </div>
        <div className="account-card-text">
          <div className="account-card-name-row">
            <strong className="account-card-name">{name}</strong>
            <span className={`account-badge-pill ${role}`}>{roleLabel}</span>
          </div>
          <small className="account-card-sub">
            {role === "student"
              ? "Verified Student"
              : role === "industry"
                ? "Enterprise Recruiter"
                : "Campus Administrator"}
          </small>
        </div>
        <span
          className={`account-card-caret ${isOpen ? "open" : ""}`}
          aria-hidden="true"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          className="account-card-dropdown"
          role="dialog"
          aria-label="Account details"
        >
          {/* Top Banner / Identity */}
          <div className="account-dropdown-hero">
            <div className="account-hero-flex">
              <div className="account-hero-avatar-frame">
                <UserAvatar
                  role={role as AvatarRole}
                  name={name}
                  size={54}
                  showStatus
                />
              </div>
              <div className="account-hero-info">
                <h4>{name}</h4>
                <p className="account-hero-email">{email}</p>
                <div className="account-hero-tags">
                  <span className="account-status-chip">
                    <span className="status-live-dot" /> Online
                  </span>
                  <span className={`account-type-tag ${role}`}>
                    {role === "student"
                      ? "Student Pro"
                      : role === "industry"
                        ? "Enterprise"
                        : "Institutional"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="account-hero-stats">
              {role === "student" ? (
                <>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Readiness</span>
                    <strong className="acc-stat-value">82%</strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Verified Skills</span>
                    <strong className="acc-stat-value">5 Verified</strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Cohort</span>
                    <strong className="acc-stat-value">2025</strong>
                  </div>
                </>
              ) : role === "industry" ? (
                <>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Active Jobs</span>
                    <strong className="acc-stat-value">6 Live</strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Shortlisted</span>
                    <strong className="acc-stat-value">
                      {shortlistedCount} Saved
                    </strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Tier</span>
                    <strong className="acc-stat-value">Enterprise</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Students</span>
                    <strong className="acc-stat-value">1,240</strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Placement</span>
                    <strong className="acc-stat-value">78%</strong>
                  </div>
                  <div className="acc-stat-box">
                    <span className="acc-stat-label">Partners</span>
                    <strong className="acc-stat-value">42 Co.</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Links */}
          <div className="account-dropdown-menu">
            {role === "student" && (
              <button
                type="button"
                className="account-menu-row"
                onClick={() => {
                  setIsOpen(false)
                  navigate("/student/profile")
                }}
              >
                <span className="account-menu-icon blue">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </span>
                <div className="account-menu-label">
                  <strong>My Public Profile</strong>
                  <small>Portfolio, skills & certificates</small>
                </div>
                <span className="account-menu-arrow">→</span>
              </button>
            )}

            <button
              type="button"
              className="account-menu-row"
              onClick={() => {
                setIsOpen(false)
                onOpenSettings()
              }}
            >
              <span className="account-menu-icon purple">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
                </svg>
              </span>
              <div className="account-menu-label">
                <strong>Account Settings</strong>
                <small>Preferences, security, notifications</small>
              </div>
              <span className="account-menu-arrow">→</span>
            </button>

            <button
              type="button"
              className="account-menu-row"
              onClick={onToggleTheme}
            >
              <span className="account-menu-icon amber">
                {isDark ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </span>
              <div className="account-menu-label">
                <strong>Display Theme</strong>
                <small>Current mode: {isDark ? "Dark" : "Light"}</small>
              </div>
              <span className="account-theme-pill">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          {/* Sign Out Row */}
          <div className="account-dropdown-footer">
            <button
              type="button"
              className="account-signout-btn"
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />
              </svg>
              <span>Sign Out of SkillImprove</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SidebarAccountCardProps {
  role: "student" | "industry" | "college"
  name: string
  roleLabel: string
  onOpenProfile?: () => void
}

export function SidebarAccountCard({
  role,
  name,
  roleLabel,
  onOpenProfile,
}: SidebarAccountCardProps) {
  return (
    <button
      type="button"
      className={`sidebar-account-card role-${role}`}
      onClick={onOpenProfile}
      title={`${name} · ${roleLabel} Workspace`}
    >
      <div className="sidebar-account-avatar-wrapper">
        <UserAvatar
          role={role as AvatarRole}
          name={name}
          size={36}
          showStatus
        />
      </div>
      <div className="sidebar-account-text">
        <strong className="sidebar-account-name">{name}</strong>
        <div className="sidebar-account-meta-row">
          <span className="sidebar-role-label">{roleLabel}</span>
          <span className="sidebar-verified-chip">✓ Verified</span>
        </div>
      </div>
    </button>
  )
}

interface SettingsAccountCardProps {
  role: "student" | "industry" | "college"
  name: string
  email: string
  roleLabel: string
}

export function SettingsAccountCard({
  role,
  name,
  email,
  roleLabel,
}: SettingsAccountCardProps) {
  return (
    <div className="settings-account-card">
      <div className="settings-account-avatar">
        <UserAvatar
          role={role as AvatarRole}
          name={name}
          size={56}
          showStatus
        />
      </div>
      <div className="settings-account-details">
        <div className="settings-account-row">
          <strong className="settings-account-title">{name}</strong>
          <span className={`account-badge-pill ${role}`}>
            {roleLabel} Account
          </span>
          <span className="badge badge-green">✓ Verified</span>
        </div>
        <p className="settings-account-subtitle">
          {email} · Primary Identity & Workspace
        </p>
      </div>
    </div>
  )
}
