# SkillImprove · System Architecture Specification

This document details the high-level and component architecture of the **SkillImprove** platform, describing the software tiers, data flows, intelligence layer, data models, and deployment topology.

---

## 1. High-Level System Architecture

SkillImprove is structured as a decoupled, multi-tier system composed of a modern reactive frontend Single Page Application (SPA), a serverless API layer powered by Next.js route handlers, an AI engine utilizing Google Gemini 2.5 Flash, and a flexible persistence tier managed via Prisma ORM.

```mermaid
flowchart TB
    subgraph ClientTier ["Client Tier (Browser / Devices)"]
        direction TB
        SP["Student Portal\n(Profile, ATS, Tests, Jobs)"]
        IP["Industry / Recruiter Portal\n(Shortlists, Excel, Offer Email)"]
        CP["College Admin Portal\n(Cohort Analytics, Benchmarks)"]
        LP["Landing & Ecosystem Hub"]
    end

    subgraph EdgeGateway ["Vercel Edge Gateway / Proxy"]
        VGW["Vercel Routing & Rewrites (vercel.json)"]
        StaticCDN["Edge CDN (Static Assets)"]
    end

    subgraph AppTier ["Application & API Tier (Next.js 15)"]
        AuthSvc["Auth.js / NextAuth (JWT & Sessions)"]
        ProfileAPI["/api/profile (Profiles & Readiness)"]
        AssessAPI["/api/assessments (Quizzes & Grading)"]
        OppAPI["/api/opportunities (Jobs & Applications)"]
        CandAPI["/api/candidates (Talent Search & Filtering)"]
        AnalyticsAPI["/api/analytics (Recharts Data Aggregations)"]
        AIEngine["/api/ai/* (Skill Gaps, Quizzes, Match Explainer)"]
    end

    subgraph IntelligenceTier ["AI Intelligence Tier"]
        Gemini["Google Gemini 2.5 Flash (@google/genai)"]
        ATSParser["ATS Resume & Keyword Match Engine"]
        FallbackEngine["Deterministic Heuristic Fallback Engine"]
    end

    subgraph DataTier ["Persistence & Database Tier"]
        Prisma["Prisma ORM (Schema & Client)"]
        SQLite[("SQLite dev.db (Local Development)")]
        Postgres[("PostgreSQL Serverless (Neon / Supabase)")]
    end

    ClientTier -->|HTTPS / REST| VGW
    VGW -->|Static Requests| StaticCDN
    VGW -->|API Requests /api/*| AppTier
    AppTier --> AuthSvc
    AIEngine --> Gemini
    AIEngine -.->|Offline / Fallback| FallbackEngine
    AppTier --> Prisma
    Prisma -->|env: SQLite| SQLite
    Prisma -->|env: PostgreSQL| Postgres
```

---

## 2. Layered Architecture Breakdown

### 2.1 Presentation Layer (Frontend SPA)
- **Framework & Build**: React 19 + Vite + TypeScript.
- **Styling**: Tailwind CSS v4 with custom glassmorphic tokens, CSS variables, and modern dark/light contrast cards.
- **Data Visualization**: **Recharts** (`ResponsiveContainer`, `BarChart`, `AreaChart`, `PieChart`, `RadarChart`, `ReferenceLine`, `Tooltip`, `Legend`).
- **Portal Modules**:
  1. **Student Portal**:
     - *Dashboard*: Industry Readiness Score Donut Gauge + 5-Pillar Competency Breakdown (Bar & Radar matrix), Priority Skill Gaps grouped comparative chart, recommended roadmaps, active job matches.
     - *My Profile Workspace*: Verified skill credentials, picture-backed certificate cards, GitHub portfolio projects, white-themed Resume Analyzer card.
     - *ATS Resume Analyzer*: Interactive resume text inspection, bullet audit, missing technical keywords, live match scoring against software roles.
     - *AI Skill Assessment & Mock Interview*: Timed exams, fill-in-the-blank questions, instant feedback, automatic score computation.
     - *Skill Demand Intelligence*: Market supply vs. employer demand bar charts, 6-month growth trajectories.
  2. **Industry & Recruiter Portal**:
     - Candidate search with readiness filters and verified evidence badges.
     - Shortlisted candidates management workspace.
     - One-click Excel spreadsheet export (`.xlsx`) containing shortlisted candidates, email addresses, and readiness scores.
     - Direct candidate employment offer contact with pre-filled recruitment dispatch.
  3. **College Admin Portal**:
     - Department-wide readiness benchmarks, cohort placement forecasts, and institutional skill gap matrices.

### 2.2 API & Application Services Layer (Backend)
- **Framework**: Next.js 15 (App Router with Route Handlers).
- **Authentication**: Auth.js (NextAuth) using `@auth/prisma-adapter`, password hashing, and signed JWT sessions.
- **API Endpoint Registry**:
  - `GET/PUT /api/profile`: Candidate readiness score, headline, and bio management.
  - `GET /api/assessments` & `POST /api/assessments/submit`: Automated grading and score recording.
  - `GET/POST /api/opportunities`: Job requisition listings, match calculation, application lifecycle.
  - `GET /api/candidates`: Recruiter candidate discovery pipeline.
  - `GET /api/analytics`: Formatted series data optimized for client-side Recharts widgets.
  - `POST /api/ai/skill-gap-analysis`: AI-personalized roadmap tailored to target software roles.
  - `POST /api/ai/quiz-generator`: Dynamic evaluation question generation with Gemini AI.
  - `POST /api/ai/match-explainer`: Semantic candidate-to-job match breakdown.

### 2.3 Intelligence & AI Layer
- **Model**: Google Gemini 2.5 Flash via official `@google/genai` SDK.
- **High Availability Heuristic Fallback**: All AI endpoints (`ai.ts`) implement resilient fallback logic. If `GEMINI_API_KEY` is omitted or network rate limits occur, deterministic semantic mock algorithms generate valid structured JSON responses, ensuring zero downtime.

### 2.4 Persistence & Data Modeling Layer
- **ORM**: Prisma 6.
- **Database Abstraction**:
  - **Local Development**: SQLite (`file:./dev.db`) for instant zero-dependency execution.
  - **Cloud Production**: PostgreSQL via serverless platforms ([Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres).
  - **Automated Engine Switch**: `backend/scripts/prepare-prisma.js` inspects `DATABASE_URL` at build time and seamlessly adapts the schema datasource provider.

---

## 3. Core Data Model & Entity Relationships

The data layer models the lifecycle of candidates, verified skills, standardized assessments, and job requisitions.

```mermaid
erDiagram
    USER ||--o| PROFILE : "has"
    USER ||--o{ USER_SKILL : "proves"
    SKILL ||--o{ USER_SKILL : "classified in"
    USER ||--o{ ASSESSMENT_SUBMISSION : "completes"
    ASSESSMENT ||--o{ ASSESSMENT_QUESTION : "contains"
    ASSESSMENT ||--o{ ASSESSMENT_SUBMISSION : "evaluates"
    OPPORTUNITY ||--o{ APPLICATION : "receives"
    USER ||--o{ APPLICATION : "submits"

    USER {
        string id PK
        string email UK
        string name
        string role "STUDENT | RECRUITER | COLLEGE_ADMIN"
        datetime createdAt
    }
    PROFILE {
        string id PK
        string userId FK
        int readinessScore
        int matchAverage
        string college
        int graduationYear
    }
    SKILL {
        string id PK
        string name UK
        string category "TECHNICAL | SOFT | APTITUDE"
    }
    USER_SKILL {
        string id PK
        string userId FK
        string skillId FK
        string level "BEGINNER | INTERMEDIATE | ADVANCED"
        int score
        boolean isVerified
    }
    ASSESSMENT {
        string id PK
        string title
        string category
        int durationMinutes
        int passingScore
    }
    ASSESSMENT_QUESTION {
        string id PK
        string assessmentId FK
        string prompt
        string options "JSON"
        int correctIndex
    }
    ASSESSMENT_SUBMISSION {
        string id PK
        string userId FK
        string assessmentId FK
        int score
        boolean passed
        datetime completedAt
    }
    OPPORTUNITY {
        string id PK
        string title
        string company
        string location
        string type
        string skills "JSON"
        int matchWeight
    }
    APPLICATION {
        string id PK
        string userId FK
        string opportunityId FK
        int matchScore
        string status "APPLIED | SHORTLISTED | OFFER"
    }
```

---

## 4. Key End-to-End Sequence Flows

### 4.1 Skill Assessment & Readiness Scoring Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend Assessment UI
    participant API as Assessment API (/api/assessments/submit)
    participant Engine as Scoring & Grading Engine
    participant DB as Prisma / Database
    participant Recharts as Dashboard Recharts Widget

    Student->>UI: Selects & starts role assessment
    UI->>Student: Presents timed questions (Fill-in-the-blank & MCQ)
    Student->>UI: Submits test answers
    UI->>API: POST /api/assessments/submit (payload: answers, timer)
    API->>Engine: Grades submission & checks passing criteria
    Engine->>DB: Records AssessmentSubmission & updates UserSkill
    Engine->>DB: Recomputes weighted Industry Readiness Score (0-100)
    DB-->>API: Persisted updated profile state
    API-->>UI: 200 OK (Score, breakdown, certificate trigger)
    UI->>Recharts: Re-renders Donut Gauge & 5-Pillar Competency Bars
```

### 4.2 Recruiter Shortlist & Direct Recruitment Offer Flow
```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    participant RUI as Recruiter Portal UI
    participant Storage as Shortlist Store / Directory
    participant ExcelLib as Excel Exporter (SheetJS)
    participant MailClient as System Mail Dispatcher
    actor Candidate

    Recruiter->>RUI: Searches candidates by skill & readiness filters
    Recruiter->>RUI: Clicks "Shortlist Candidate"
    RUI->>Storage: Adds candidate to shortlist state
    opt Export to Excel
        Recruiter->>RUI: Clicks "Download Shortlisted (Excel)"
        RUI->>ExcelLib: Compiles table (Name, Email, Score, Skills)
        ExcelLib-->>Recruiter: Downloads Shortlisted_Candidates_2026.xlsx
    end
    opt Direct Recruitment Offer
        Recruiter->>RUI: Clicks "Contact Candidate" / "Send Offer"
        RUI->>MailClient: Dispatches mailto payload with employment confirmation
        MailClient-->>Candidate: Delivers recruitment offer notification
    end
```

---

## 5. Deployment Topology & Cloud Infrastructure

The platform is optimized for **Vercel** as a dual-project architecture with serverless PostgreSQL.

```
                    ┌──────────────────────────────────────────────┐
                    │               Git Repository                 │
                    │   (shaikanas20055-png/skillimprove:main)     │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │                                              │
                    ▼                                              ▼
       ┌────────────────────────┐                    ┌────────────────────────┐
       │   Vercel Project 1     │                    │   Vercel Project 2     │
       │   skillimprove-web     │                    │   skillimprove-api     │
       │   (Root Vite SPA)      │                    │   (Next.js 15 Backend) │
       └───────────┬────────────┘                    └───────────┬────────────┘
                   │                                             │
                   │  Reverse Proxy /api/*                       │  Database Queries
                   └─────────────────────────────────────────────┼────────────────┐
                                                                 │                │
                                                                 ▼                ▼
                                                    ┌─────────────────┐  ┌─────────────────┐
                                                    │ Neon / Supabase │  │ Google Gemini   │
                                                    │ (Postgres Cloud)│  │ 2.5 Flash API   │
                                                    └─────────────────┘  └─────────────────┘
```

1. **Frontend Project (`skillimprove-web`)**:
   - Deploys from root `/`.
   - Uses `vercel.json` rewrites to proxy all `/api/*` traffic directly to the backend project.
   - Provides instant global CDN delivery, zero CORS conflicts, and unified cookie domain.
2. **Backend Project (`skillimprove-api`)**:
   - Deploys from `/backend` root directory.
   - Auto-executes `prepare-prisma.js` during build to configure PostgreSQL.
   - Runs serverless route handlers scaling on demand.
3. **Database Cloud Layer**:
   - PostgreSQL hosted on Neon or Supabase with SSL connection pooling.
   - Local fallback automatically defaults to SQLite `dev.db`.

---

## 6. Security & Architectural Controls

| Dimension | Architectural Safeguard |
|---|---|
| **Authentication & Tokens** | NextAuth JWT with HMAC-SHA256 signing; session tokens stored in HTTP-only cookies. |
| **Database Security** | Parameterized Prisma queries preventing SQL injection; cascading foreign key deletes. |
| **API Secret Isolation** | `GEMINI_API_KEY` and `NEXTAUTH_SECRET` are strictly backend environment variables; never exposed to the client bundle. |
| **Cross-Origin Security** | Vercel rewrite proxy routes all requests through the same origin domain, eliminating open CORS wildcards. |
| **Fault Tolerance** | Dual-mode AI execution ensures zero-crash operations if third-party AI APIs become unreachable. |
