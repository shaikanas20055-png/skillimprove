import { memo } from "react"

export type AvatarRole = "student" | "industry" | "college" | "candidate"

interface UserAvatarProps {
  role?: AvatarRole
  name?: string
  size?: number
  showStatus?: boolean
  status?: "online" | "away" | "busy" | "offline"
  className?: string
  src?: string
  style?: React.CSSProperties
}

export const UserAvatar = memo(function UserAvatar({
  role = "student",
  name = "User",
  size = 36,
  showStatus = false,
  status = "online",
  className = "",
  src,
  style,
}: UserAvatarProps) {
  // Hash for candidate variation
  const hash = Math.abs(
    name
      .split("")
      .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0),
  )
  const variant = hash % 4

  const dotSize = Math.max(7, Math.round(size * 0.24))
  const dotOffset = Math.max(-1, Math.round(size * 0.02))

  const statusColor =
    status === "online"
      ? "#10b981"
      : status === "away"
        ? "#f59e0b"
        : status === "busy"
          ? "#ef4444"
          : "#94a3b8"

  // If a real image src is given
  if (src) {
    return (
      <div
        className={`account-avatar-wrapper ${className}`}
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        />
        {showStatus && (
          <span
            style={{
              position: "absolute",
              bottom: `${dotOffset}px`,
              right: `${dotOffset}px`,
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: "50%",
              backgroundColor: statusColor,
              border: "2px solid #ffffff",
              boxShadow: "0 0 4px rgba(0,0,0,0.2)",
            }}
          />
        )}
      </div>
    )
  }

  // Unique ID prefix for gradients and clips
  const uid = `av-${role}-${variant}-${size}-${Math.abs(hash % 997)}`

  return (
    <div
      className={`account-avatar-wrapper ${className}`}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "50%",
        ...style,
      }}
      title={name}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          borderRadius: "50%",
        }}
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <circle cx="32" cy="32" r="32" />
          </clipPath>

          {/* Student backdrop - Academic Green */}
          <linearGradient
            id={`${uid}-student-bg`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Industry backdrop - Executive Warm Gold */}
          <linearGradient
            id={`${uid}-industry-bg`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* College backdrop - Institutional Deep Blue */}
          <linearGradient
            id={`${uid}-college-bg`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          {/* Candidate backdrops */}
          <linearGradient
            id={`${uid}-cand-0`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient
            id={`${uid}-cand-1`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient
            id={`${uid}-cand-2`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient
            id={`${uid}-cand-3`}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {role === "student" && (
          <>
            <circle cx="32" cy="32" r="32" fill={`url(#${uid}-student-bg)`} />
            <g clipPath={`url(#${uid}-clip)`}>
              {/* Shoulders / Tech Hoodie */}
              <path
                d="M10 64 C10 46 20 42 32 42 C44 42 54 46 54 64 Z"
                fill="#0f172a"
              />
              <path d="M25 42 L32 53 L39 42 Z" fill="#f8fafc" />
              <circle cx="32" cy="50" r="1.5" fill="#10b981" />
              {/* Neck */}
              <rect
                x="27.5"
                y="34"
                width="9"
                height="10"
                rx="3"
                fill="#fed7aa"
              />
              {/* Head */}
              <ellipse cx="32" cy="27" rx="13.5" ry="15" fill="#fed7aa" />
              {/* Hair */}
              <path
                d="M18.5 24 C18.5 13 23 9 32 9 C41 9 45.5 13 45.5 24 C45.5 20 42 16 38 16 C32 16 29 14 25 16 C21 18 18.5 21 18.5 24 Z"
                fill="#1e1b4b"
              />
              <rect
                x="18"
                y="24"
                width="2.5"
                height="5"
                rx="1.2"
                fill="#1e1b4b"
              />
              <rect
                x="43.5"
                y="24"
                width="2.5"
                height="5"
                rx="1.2"
                fill="#1e1b4b"
              />
              {/* Eyes */}
              <circle cx="27" cy="26" r="1.6" fill="#0f172a" />
              <circle cx="37" cy="26" r="1.6" fill="#0f172a" />
              {/* Eyebrows */}
              <path
                d="M25 22.5 Q27 21.5 29 22.5"
                stroke="#1e1b4b"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M35 22.5 Q37 21.5 39 22.5"
                stroke="#1e1b4b"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Friendly smile */}
              <path
                d="M29 32 Q32 35.5 35 32"
                stroke="#ea580c"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          </>
        )}

        {role === "industry" && (
          <>
            <circle cx="32" cy="32" r="32" fill={`url(#${uid}-industry-bg)`} />
            <g clipPath={`url(#${uid}-clip)`}>
              {/* Suit Blazer */}
              <path
                d="M8 64 C8 45 19 41 32 41 C45 41 56 45 56 64 Z"
                fill="#1e293b"
              />
              {/* Shirt & Gold Tie */}
              <polygon points="26,41 32,54 38,41" fill="#ffffff" />
              <polygon
                points="30.5,43 33.5,43 32.5,53 31.5,53"
                fill="#d97706"
              />
              {/* Neck */}
              <rect x="28" y="33" width="8" height="10" rx="3" fill="#fde68a" />
              {/* Head */}
              <ellipse cx="32" cy="26" rx="13" ry="14.5" fill="#fde68a" />
              {/* Hair */}
              <path
                d="M18 23 C18 12 24 8 32 8 C40 8 46 12 46 23 C43 19 39 16 32 16 C25 16 21 19 18 23 Z"
                fill="#312e81"
              />
              {/* Professional Glasses */}
              <rect
                x="22.5"
                y="22.5"
                width="8"
                height="6.5"
                rx="1.5"
                stroke="#312e81"
                strokeWidth="1.2"
                fill="none"
              />
              <rect
                x="33.5"
                y="22.5"
                width="8"
                height="6.5"
                rx="1.5"
                stroke="#312e81"
                strokeWidth="1.2"
                fill="none"
              />
              <line
                x1="30.5"
                y1="25.5"
                x2="33.5"
                y2="25.5"
                stroke="#312e81"
                strokeWidth="1.2"
              />
              {/* Eyes */}
              <circle cx="26.5" cy="25.5" r="1.3" fill="#0f172a" />
              <circle cx="37.5" cy="25.5" r="1.3" fill="#0f172a" />
              {/* Confident smile */}
              <path
                d="M29 32 Q32 34.5 35 32"
                stroke="#b45309"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          </>
        )}

        {role === "college" && (
          <>
            <circle cx="32" cy="32" r="32" fill={`url(#${uid}-college-bg)`} />
            <g clipPath={`url(#${uid}-clip)`}>
              {/* Academic sweater / Deep Blue blazer */}
              <path
                d="M9 64 C9 46 20 42 32 42 C44 42 55 46 55 64 Z"
                fill="#1e3a8a"
              />
              <path d="M26 42 L32 52 L38 42 Z" fill="#eff6ff" />
              {/* Neck */}
              <rect x="28" y="34" width="8" height="10" rx="3" fill="#fbcfe8" />
              {/* Head */}
              <ellipse cx="32" cy="26.5" rx="13" ry="14.5" fill="#fbcfe8" />
              {/* Distinguished hair */}
              <path
                d="M17.5 24 C17.5 13 23 8.5 32 8.5 C41 8.5 46.5 13 46.5 24 C43 20 38 17 32 17 C26 17 21 20 17.5 24 Z"
                fill="#374151"
              />
              {/* Glasses */}
              <circle
                cx="26"
                cy="25.5"
                r="4.2"
                stroke="#111827"
                strokeWidth="1.1"
                fill="none"
              />
              <circle
                cx="38"
                cy="25.5"
                r="4.2"
                stroke="#111827"
                strokeWidth="1.1"
                fill="none"
              />
              <line
                x1="30.2"
                y1="25.5"
                x2="33.8"
                y2="25.5"
                stroke="#111827"
                strokeWidth="1.1"
              />
              {/* Eyes */}
              <circle cx="26" cy="25.5" r="1.3" fill="#111827" />
              <circle cx="38" cy="25.5" r="1.3" fill="#111827" />
              {/* Warm smile */}
              <path
                d="M29 32 Q32 35 35 32"
                stroke="#9d174d"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          </>
        )}

        {role === "candidate" && (
          <>
            <circle
              cx="32"
              cy="32"
              r="32"
              fill={`url(#${uid}-cand-${variant})`}
            />
            <g clipPath={`url(#${uid}-clip)`}>
              {variant === 0 && (
                <>
                  <path
                    d="M10 64 C10 47 20 43 32 43 C44 43 54 47 54 64 Z"
                    fill="#0f172a"
                  />
                  <path d="M27 43 L32 51 L37 43 Z" fill="#67e8f9" />
                  <rect
                    x="28"
                    y="35"
                    width="8"
                    height="9"
                    rx="3"
                    fill="#fed7aa"
                  />
                  <ellipse cx="32" cy="27" rx="13" ry="14" fill="#fed7aa" />
                  {/* Curly hair */}
                  <path
                    d="M18 24 C17 14 23 9 32 9 C41 9 47 14 46 24 C43 20 38 18 32 18 C26 18 21 20 18 24 Z"
                    fill="#18181b"
                  />
                  <circle cx="27" cy="26" r="1.5" fill="#18181b" />
                  <circle cx="37" cy="26" r="1.5" fill="#18181b" />
                  <path
                    d="M29 32 Q32 35 35 32"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {variant === 1 && (
                <>
                  <path
                    d="M10 64 C10 47 20 43 32 43 C44 43 54 47 54 64 Z"
                    fill="#1e293b"
                  />
                  <polygon points="26,43 32,53 38,43" fill="#ffffff" />
                  <rect
                    x="28"
                    y="35"
                    width="8"
                    height="9"
                    rx="3"
                    fill="#fde68a"
                  />
                  <ellipse cx="32" cy="27" rx="13" ry="14" fill="#fde68a" />
                  <path
                    d="M18 22 C19 12 24 9 32 9 C40 9 45 12 46 22 C43 19 38 17 32 17 C26 17 21 19 18 22 Z"
                    fill="#312e81"
                  />
                  {/* Glasses */}
                  <rect
                    x="23"
                    y="23"
                    width="7.5"
                    height="5.5"
                    rx="1.5"
                    stroke="#1e1b4b"
                    strokeWidth="1.1"
                    fill="none"
                  />
                  <rect
                    x="33.5"
                    y="23"
                    width="7.5"
                    height="5.5"
                    rx="1.5"
                    stroke="#1e1b4b"
                    strokeWidth="1.1"
                    fill="none"
                  />
                  <line
                    x1="30.5"
                    y1="25.5"
                    x2="33.5"
                    y2="25.5"
                    stroke="#1e1b4b"
                    strokeWidth="1.1"
                  />
                  <circle cx="26.7" cy="25.7" r="1.3" fill="#0f172a" />
                  <circle cx="37.2" cy="25.7" r="1.3" fill="#0f172a" />
                  <path
                    d="M29 32 Q32 34.5 35 32"
                    stroke="#b45309"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {variant === 2 && (
                <>
                  <path
                    d="M10 64 C10 47 20 43 32 43 C44 43 54 47 54 64 Z"
                    fill="#4c1d95"
                  />
                  <path d="M26 43 L32 50 L38 43 Z" fill="#f5d0fe" />
                  <rect
                    x="28"
                    y="35"
                    width="8"
                    height="9"
                    rx="3"
                    fill="#fed7aa"
                  />
                  <ellipse cx="32" cy="27" rx="13" ry="14" fill="#fed7aa" />
                  {/* Long wavy hair */}
                  <path
                    d="M17 28 C16 13 22 9 32 9 C42 9 48 13 47 28 C47 38 45 46 44 50 C41 42 43 28 41 23 C38 18 26 18 23 23 C21 28 23 42 20 50 C19 46 17 38 17 28 Z"
                    fill="#292524"
                  />
                  <circle cx="27" cy="26" r="1.5" fill="#1c1917" />
                  <circle cx="37" cy="26" r="1.5" fill="#1c1917" />
                  <path
                    d="M29 32 Q32 35 35 32"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {variant === 3 && (
                <>
                  <path
                    d="M10 64 C10 47 20 43 32 43 C44 43 54 47 54 64 Z"
                    fill="#14532d"
                  />
                  <path d="M27 43 L32 51 L37 43 Z" fill="#bbf7d0" />
                  <rect
                    x="28"
                    y="35"
                    width="8"
                    height="9"
                    rx="3"
                    fill="#fbcfe8"
                  />
                  <ellipse cx="32" cy="27" rx="13" ry="14" fill="#fbcfe8" />
                  <path
                    d="M18 23 C18 13 23 9 32 9 C41 9 46 13 46 23 C42 19 37 17 32 17 C27 17 22 19 18 23 Z"
                    fill="#451a03"
                  />
                  <circle cx="27" cy="26" r="1.5" fill="#18181b" />
                  <circle cx="37" cy="26" r="1.5" fill="#18181b" />
                  <path
                    d="M29 32 Q32 34.5 35 32"
                    stroke="#9d174d"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>
          </>
        )}
      </svg>

      {showStatus && (
        <span
          className="account-status-dot"
          style={{
            position: "absolute",
            bottom: `${dotOffset}px`,
            right: `${dotOffset}px`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            backgroundColor: statusColor,
            border: "2px solid #ffffff",
            boxShadow: "0 0 5px rgba(0,0,0,0.25)",
            zIndex: 2,
          }}
          title={status === "online" ? "Active Now" : status}
        />
      )}
    </div>
  )
})

export default UserAvatar
