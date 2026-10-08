# SkillImprove Next.js Backend & API Service

A modern, production-grade backend service built with **Next.js 15 Route Handlers**, **PostgreSQL**, **Prisma ORM**, **Auth.js (NextAuth)**, and **Google Gemini AI**.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router & Route Handlers)
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: Auth.js (NextAuth) with `@auth/prisma-adapter` & JWT strategy
- **AI Integration**: Google Gemini 2.5 Flash via `@google/genai` (with intelligent offline mock fallbacks)
- **Language**: TypeScript

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```bash
# PostgreSQL URL (e.g. Supabase, Neon, or local PostgreSQL):
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillimprove?schema=public"

# Auth.js secret:
NEXTAUTH_SECRET="your-generated-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# Google Gemini API Key (optional):
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Initialize Prisma & Database
Generate the Prisma Client and sync the schema to your PostgreSQL database:
```bash
# Push schema to database
npm run prisma:push

# Seed with initial users, skills, assessments & jobs
npm run prisma:seed
```

### 4. Start Next.js Development Server
```bash
npm run dev
```
The backend API is now running at **`http://localhost:3001`**.
You can open `http://localhost:3001` in your browser to inspect the interactive endpoint documentation!

---

## 📡 Available API Route Handlers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Retrieve student profile, verified skills, and readiness |
| `PUT` | `/api/profile` | Update profile headline or readiness score |
| `GET` | `/api/assessments` | List available aptitude, programming & soft skills assessments |
| `POST` | `/api/assessments/submit` | Grade assessment answers, record score, update readiness |
| `GET` | `/api/opportunities` | List verified job & internship postings with match weights |
| `POST` | `/api/opportunities/apply` | Apply to an opportunity with match tracking |
| `GET` | `/api/candidates` | Recruiter search for talent with readiness/skill filters |
| `GET` | `/api/analytics` | Recharts-formatted analytics data (Radar, Area, Bar, Donut) |
| `POST` | `/api/ai/skill-gap-analysis` | Google Gemini AI personalized skill gap roadmap |
| `POST` | `/api/ai/quiz-generator` | Google Gemini AI dynamic assessment question generation |
| `POST` | `/api/ai/match-explainer` | Explainable candidate-to-job matching breakdown |
| `GET/POST`| `/api/auth/[...nextauth]` | Auth.js credential and session management |
