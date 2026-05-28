# AI Full-Stack Learning Lab

This repo is now split into two real project folders:

- `frontend`: Next.js, React, TypeScript, Tailwind CSS, TanStack Query, Zustand, and dashboard UI.
- `backend`: Node.js, Express, TypeScript, Prisma, PostgreSQL, auth, workspace APIs, and AI model APIs.

## Run Locally

```bash
npm run dev
```

Or run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000/api/v1` in this workspace, or `http://localhost:4000/api/v1` if you use `backend/.env.example` unchanged.

## AI Model Studio

The backend exposes task-specific AI models at:

- `GET /api/v1/ai/models`
- `POST /api/v1/ai/models/run`
- `POST /api/v1/ai/chat`

Included learning models:

- `portfolio-mentor`: builds a full-stack learning path.
- `subscription-optimizer`: analyzes saved subscription data.
- `goal-coach`: turns goals and roadmaps into a short plan.
- `content-classifier`: classifies workspace content and tags.
- `model-architect`: creates a model card, API contract, eval checklist, and deployment plan.

Without `OPENAI_API_KEY`, the app runs local deterministic model logic. With `OPENAI_API_KEY`, the same model API upgrades to an OpenAI-compatible chat completions provider.

### Gemini API (OpenAI-compatible) setup

If you want to use Gemini via the OpenAI-compatible API surface, set:

- `OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`
- `OPENAI_MODEL=gemini-1.5-flash` (or another supported Gemini model)
- `OPENAI_API_KEY=<your Gemini API key from AI Studio>`

## Learning Roadmap

1. React and Tailwind: build reusable dashboard components with loading, empty, and error states.
2. Next.js: learn app routes, layouts, client components, environment variables, and production builds.
3. TypeScript: keep API contracts typed from backend response to frontend UI.
4. Node and Express: build routes, controllers, services, middleware, and validation.
5. Prisma and PostgreSQL: model data, migrate schema, seed demo data, and query safely.
6. AI integration: design model inputs, context, prompts, fallback logic, output shape, and evals.
7. Deployment: deploy frontend, backend, database, environment variables, CORS, and migrations.

## Deployment Checklist

- Frontend host: set `NEXT_PUBLIC_API_URL` to the deployed backend API URL.
- Backend host: set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, and optional `OPENAI_API_KEY`.
- Database: run `npm --prefix backend run prisma:deploy`.
- Build commands:
  - Frontend: `npm --prefix frontend run build`
  - Backend: `npm --prefix backend run build`
