# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development (runs all apps except email dev server)
pnpm dev

# Focused development
pnpm dev:app    # App + Auth + MailDev + Prisma Studio
pnpm dev:auth   # Auth + MailDev + Prisma Studio
pnpm dev:web    # Web marketing site only
pnpm dev:email  # Email template preview server

# Database
pnpm dev:setup  # Docker up + migrate + seed
pnpm dev:nuke   # Tear down Docker volumes
pnpm --filter @propsto/data db-migrate  # Create new migration
pnpm --filter @propsto/data db-studio   # Open Prisma Studio

# Build & Checks
pnpm build      # Build all apps/packages
pnpm health     # Lint + type-check workspace
pnpm lint
pnpm type-check
pnpm format     # Prettier with sorted imports

# Testing
pnpm test       # Vitest unit/integration tests
pnpm setup:e2e  # Install Playwright browsers (one-time)
pnpm e2e        # Run Playwright E2E suites
```

## Architecture Overview

### Monorepo Structure (Turborepo + pnpm)

**Apps** (Next.js 16 + React 19):

- `apps/app` - Main authenticated product experience (port 3000)
- `apps/auth` - Auth.js identity/onboarding flows (port 3002)
- `apps/web` - Marketing site (port 3001)
- `apps/docs` - GitBook-backed documentation

**Packages**:

- `@propsto/data` - Prisma schema, migrations, database client, and repository layer
- `@propsto/constants` - Environment validation via `@t3-oss/env-core`, exports `constServer` and `constClient`
- `@propsto/email` - React Email templates, Resend/Nodemailer transport, MailDev for local dev
- `@propsto/ui` - Design system using shadcn/ui + Atomic Design (atoms/molecules)
- `@propsto/config` - Shared ESLint configs and TypeScript configs
- `@propsto/logger` - Structured logging helpers

**E2E Testing**:

- `e2e/app` - Playwright tests for authenticated app
- `e2e/auth` - Playwright tests for sign-in/onboarding

### Key Patterns

**Database Access**:

- Prisma Client is instantiated only in `packages/data/db.ts`
- Repository functions live in `packages/data/repos/*.ts` and export typed operations
- ESLint enforces that `@prisma/client` imports are restricted to `db.ts` and `db` imports are restricted to repo files

**Environment Variables**:

- Defined and validated in `packages/constants/server.ts` (server) and `client.ts` (client)
- All env vars must pass Zod validation before app starts
- Key vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `PROPSTO_ENV`, `EMAIL_FROM`

**UI Components**:

- Atoms: Basic shadcn/ui primitives (`packages/ui/atoms/`)
- Molecules: Composed components (`packages/ui/molecules/`)
- Tailwind CSS 4 with config in `packages/ui/tailwind.config.ts`

**Auth**:

- Auth.js (next-auth beta) with Prisma adapter
- Supports email/password + Google OAuth
- Auth routes handled in `apps/auth`, shared session across subdomains via `PROPSTO_HOST`

### Local Development Domains

After running `sudo pnpm setup:hosts`:

- `http://app.propsto.local:3000` - Product app
- `http://auth.propsto.local:3002` - Auth app
- `http://propsto.local:3001` - Marketing site
- `http://0.0.0.0:1080` - MailDev inbox
- `http://localhost:5555` - Prisma Studio

## ESLint Custom Rules

The `restrict-import` local rule enforces:

1. `PrismaClient` can only be imported in `packages/data/db.ts`
2. `db` from `@propsto/data` can only be imported in `packages/data/repos/**/*.ts`

## Testing Approach

- Unit/integration tests use Vitest
- E2E tests use Playwright with `start-server-and-test` to spin up apps
- E2E runs against built apps (`pnpm build` required first)
