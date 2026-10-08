# Vercel Deployment Guide · SkillImprove Platform

This project is a modern full-stack application composed of:
1. **Frontend**: Vite + React 19 + Tailwind CSS v4 Single Page Application (root directory `/`)
2. **Backend**: Next.js 15 + Prisma ORM + NextAuth (Auth.js) + Google Gemini AI (`/backend`)

---

## Recommended Deployment Strategy: Two Vercel Projects

Because the repository separates the high-performance Vite frontend and Next.js backend API, the cleanest, production-ready approach on Vercel is to deploy them as **two linked services** from the same Git repository.

```
Git Repository
 ├── Root (/)        ──► Vercel Project 1: skillimprove-web  (Vite Frontend)
 └── /backend        ──► Vercel Project 2: skillimprove-api  (Next.js API & Prisma)
```

---

## Step 1: Set Up a Production Database (Free Serverless PostgreSQL)

Vercel Serverless Functions use an ephemeral, read-only filesystem. Local SQLite (`file:./dev.db`) cannot persist data on Vercel. Use a free hosted PostgreSQL database:

1. **Neon** ([neon.tech](https://neon.tech)) — Recommended (Free serverless Postgres, ready in 30 seconds)
2. **Supabase** ([supabase.com](https://supabase.com))
3. **Vercel Postgres** (accessible directly inside the Vercel dashboard)

Copy your connection string (`postgresql://username:password@ep-host.region.neon.tech/neondb?sslmode=require`).

> 💡 **Automatic Provider Switch**:  
> `backend/scripts/prepare-prisma.js` automatically detects your `DATABASE_URL`. When it starts with `postgresql://` or `postgres://`, it automatically configures `prisma/schema.prisma` for PostgreSQL during the Vercel build!

---

## Step 2: Deploy the Backend API (`/backend`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** &rarr; **Project**.
2. Select your Git repository.
3. Configure project settings:
   - **Project Name**: `skillimprove-api` (or your preferred name)
   - **Root Directory**: Click *Edit* and select **`backend`**.
   - **Framework Preset**: **Next.js** (detected automatically).
   - **Build Command**: `npm run build` (runs `prepare-prisma.js`, `prisma generate`, and `next build`).
4. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://...` | Hosted PostgreSQL connection string from Neon/Supabase |
   | `NEXTAUTH_SECRET` | *32-char secret* | Generate with `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://skillimprove-api.vercel.app` | Your deployed backend Vercel URL |
   | `GEMINI_API_KEY` | *(optional)* | Google Gemini API key for AI endpoints |
5. Click **Deploy**.
6. Once deployed, push your schema and seed initial data to the hosted database from your local machine:
   ```bash
   cd backend
   # Push schema to hosted database
   npx prisma db push --schema=prisma/schema.prisma
   # Seed initial demo data
   npx tsx prisma/seed.ts
   ```

---

## Step 3: Deploy the Frontend (`/`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** &rarr; **Project**.
2. Select the **same** Git repository.
3. Configure project settings:
   - **Project Name**: `skillimprove-web`
   - **Root Directory**: `./` (leave default root).
   - **Framework Preset**: **Vite**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://skillimprove-api.vercel.app/api` | The backend API URL created in Step 2 |
5. Click **Deploy**.

---

## Single Domain Option (Vercel Rewrites Proxy)

If you prefer to serve both the frontend and API under a single domain (e.g. `https://skillimprove.vercel.app`) without CORS:

Edit the root [vercel.json](file:///c:/Users/shaik/OneDrive/Desktop/SkillImprove%20Web%20Application/vercel.json):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://skillimprove-api.vercel.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
When configured this way:
- `https://skillimprove-web.vercel.app/api/profile` automatically proxies to the backend.
- All browser cookies and sessions work on the same origin without CORS issues.

---

## Local Development Verification

Your local environment remains completely unaffected and ready:
- Frontend runs on `http://localhost:8443` (or default Vite port).
- Backend runs on `http://localhost:3001`.
- Local SQLite database (`dev.db`) continues working with zero setup when `DATABASE_URL` is not pointing to Postgres.
