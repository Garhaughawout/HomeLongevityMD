# HomeLongevityMD

HomeLongevityMD is a clinical operations platform for physicians and practitioners who help older adults stay independent and out of assisted living. It combines a structured intake and risk assessment workflow with personalized plan generation and client management — all in one internal dashboard.

---

## What It Does

- **Client Management** — Searchable CRM for tracking clients, their status, and their full history in one place.
- **Structured Intake** — Multi-step intake wizard covering home safety, mobility, ADLs/IADLs, cognition, fall risk, and caregiver support.
- **Risk Scoring** — Weighted domain scoring engine that produces an aggregate risk score and assigns a risk category (Low → Unsafe for Independent Living).
- **Plan Generation** — Risk-adjusted plan quotes with suggested deliverables auto-populated from the assessment. Fully editable before sending.
- **Notes** — Per-client clinical notes with timestamps.
- **Activity Log** — Automatic audit trail of all key events: intake submissions, assessments, plan changes, status updates, and notes.
- **Dashboard** — KPI overview of active clients, high-risk alerts, and pipeline status.

---

## Plan Deliverables

Every client receives a personalized plan. Deliverables are suggested based on which domains scored high in the assessment and may include:

- Personalized home longevity plan
- Home safety assessment & modification recommendations
- Fall risk reduction protocol
- Mobility & exercise prescription
- Medication review & simplification guidance
- Nutrition & meal planning recommendations
- Cognitive health strategies
- ADL/IADL independence strategies
- Local resource & referral guide
- Annual plan review & update

---

## Tech Stack

- **Next.js 14** (App Router) — full-stack React framework
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility-first styling
- **Supabase** — Postgres database, auth, and row-level security
- **Zod** — server-side form and schema validation
- **Prettier + ESLint** — consistent code formatting and linting
- **Vercel** — deployment

---

## Local Development

**Prerequisites:** Node.js 20 LTS, npm

Copy the environment file and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Install dependencies:

npm install

Start the development server at http://localhost:3000:

npm run dev

---

## Available Commands

npm run dev — start local dev server

npm run build — production build

npm run start — run production build locally

npm run lint — check for ESLint errors

npm run lint:fix — auto-fix ESLint errors

npm run format — format all files with Prettier

npm run format:check — check formatting without writing

npm run db:push — apply local SQL migrations to Supabase

npm run db:pull — pull remote schema into a migration file

npm run db:types — regenerate types/database.ts from live schema

---

## Database

Schema is managed through versioned SQL migrations in supabase/migrations/. Tables:

- clients
- client_intake
- risk_assessments
- quotes
- notes
- activity_log

To apply migrations, run: npm run db:push

To regenerate TypeScript types after a schema change: npm run db:types

---

## Deployment

The app is deployed on Vercel. Set the same environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in the Vercel project settings. Pushes to main deploy automatically.
