# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (all services in parallel)
pnpm dev

# Individual services
pnpm api:dev          # Express API on port 3001
pnpm web:dev          # Next.js frontend on port 3000
pnpm telegram:dev     # Telegram scraper

# Build
pnpm build            # All apps
pnpm -F api build     # Single app (api | web | crawler | telegram-scraper)

# Code quality
pnpm lint
pnpm type-check
pnpm format

# Database
pnpm db:generate      # Regenerate Prisma client after schema changes
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed data
pnpm db:studio        # Open Prisma Studio

# Telegram session
pnpm telegram:generate-session
```

Run a single package's script: `pnpm -F <package-name> <script>` where package names are `api`, `web`, `crawler`, `telegram-scraper`, `database`, `shared`.

## Architecture

pnpm monorepo with four apps and two shared packages:

```
apps/
  web/              # Next.js 16 + React 19 frontend
  api/              # Express 5 REST API (port 3001)
  crawler/          # Puppeteer-based event scraper (cron-scheduled)
  telegram-scraper/ # Telegram channel listener + Claude AI event extraction
packages/
  database/         # Prisma client + PostgreSQL schema (single source of truth)
  shared/           # Zod schemas, TypeScript types, constants shared across apps
```

**Data flow**: Crawler and Telegram scraper discover events → write to the database → Express API serves them → Next.js frontend renders them.

### API (`apps/api/src/`)

Standard layered architecture: `routes/` → `controllers/` → `services/` → `packages/database`.

- Auth uses JWT (access token via `Authorization: Bearer` header)
- Middleware: `authenticate` (verifies JWT), `requireRole` (RBAC), `rateLimiter`, error handler
- File uploads go through Cloudinary via `services/cloudinary.service.ts`

### Frontend (`apps/web/src/`)

- `app/` — Next.js App Router pages
- `components/` — React components
- `hooks/` — custom React hooks
- `lib/` — API client and utilities
- All API calls go through `lib/api.ts` which wraps fetch with the base URL and auth headers

### Database (`packages/database/`)

Prisma schema defines all models. After any schema change, run `pnpm db:generate` to regenerate the client before any app code changes.

Key models: `User` (roles: USER, ORGANIZER, MODERATOR, SUPPORT, ADMIN), `Event` (status: PENDING, ACCEPTED, REJECTED), `Category`, `Comment` (threaded via `parentCommentId`), `Rating`, `CrawlerSource`, `TelegramSource`.

### Shared (`packages/shared/src/`)

Contains Zod validation schemas and TypeScript types consumed by both the API and frontend. Always update shared schemas here rather than duplicating validation logic.

## Environment Setup

Copy `.env.example` to `.env` at the repo root. Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — signing secret
- `NEXT_PUBLIC_API_URL` — consumed by the Next.js frontend
- `CLOUDINARY_*` — cloud name, API key, API secret
- `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION` — for the scraper

Start a local PostgreSQL instance with Docker: `docker-compose up -d`

## Key Conventions

- TypeScript strict mode is enabled everywhere — no `any` without justification.
- Prettier config: single quotes, semicolons, 80-char line width, 2-space indent, trailing commas.
- Event status gating: the frontend should only surface `ACCEPTED` events to public users; `PENDING` events are visible in the admin portal only.
- The Telegram scraper uses the Anthropic Claude SDK to extract structured event data from unstructured channel messages — see `apps/telegram-scraper/src/services/`.
