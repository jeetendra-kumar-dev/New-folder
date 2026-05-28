# SaaS Backend

Production-ready Express backend using TypeScript, Prisma, PostgreSQL, JWT auth, Zod validation, and a controller-service architecture.

## Quick Start

```bash
cd backend
npm install
copy .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs on the `PORT` in `.env`. The example file uses `http://localhost:4000/api/v1`; this workspace can use `http://localhost:5000/api/v1` when `PORT=5000`.

## DBeaver PostgreSQL Connection

- Host: `localhost`
- Port: `5432`
- Database: `saas_starter`
- Username: `postgres`
- Password: `postgres`
- Schema: `public`

## Core Routes

- `GET /api/v1/health`
- `GET /api/v1/health/ready`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/register` (alias)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/ai/models`
- `POST /api/v1/ai/models/run`
- `POST /api/v1/ai/chat`

## AI Model Studio

The AI layer is designed for learning real production patterns:

- Model catalog: task-specific model definitions live in `src/services/ai-models.service.ts`.
- Local fallback: every model works without an external API key.
- Provider upgrade: add `OPENAI_API_KEY` to call an OpenAI-compatible chat completions API.
- Typed contract: request validation lives in `src/types/ai.ts`.
- Deployment shape: model routes are normal Express APIs, so they can be deployed with the rest of the backend.

### Gemini API (OpenAI-compatible) setup

You can point the same OpenAI-compatible client code at the Gemini OpenAI-compat endpoint:

- `OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`
- `OPENAI_MODEL=gemini-1.5-flash` (or another supported Gemini model for the OpenAI-compat API)
- `OPENAI_API_KEY=<your Gemini API key from AI Studio>`

If you see provider errors mentioning `v1main` or `models/...:generateContent`, you are likely using the native Gemini endpoint/model path instead of the OpenAI-compatible `/openai/chat/completions` endpoint.

## Auth Payloads

```json
{
  "name": "Acme Admin",
  "email": "admin@acme.test",
  "password": "Admin12345"
}
```

Send protected requests with:

```http
Authorization: Bearer <accessToken>
```
