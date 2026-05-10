# HomeLongevityMD

A lightweight operational platform for aging-in-place service providers. It includes a public website, CRM-lite dashboard, intake and risk assessments, quote generation, and client workflow management built with Next.js, Tailwind, and Supabase.

## Step 1 Status

The repository is now initialized as a Next.js App Router project with TypeScript, Tailwind CSS, ESLint, and Prettier.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Prettier

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run linting and formatting checks:

```bash
npm run lint
npm run format:check
```

## Environment Notes

The current machine is on Node.js 18.17.0. The project installs and boots there, but some modern linting dependencies warn because they prefer Node 18.18.0 or newer. Upgrading to Node 20 LTS is the cleanest path before continuing with the later phases.

## Next Phase

The next implementation step is to add the core project structure and shared app foundations:

- app route organization
- components
- lib
- services
- hooks
- types
- utils
