# Quickstart: Reels MVP

**Date**: 2026-03-29 | **Plan**: [plan.md](plan.md)

---

## Prerequisites

- **Node.js** 20 LTS
- **pnpm** ≥ 9.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Xcode** 15+ with iOS 17 SDK (for iOS development)
- **Docker** (for local PostgreSQL)
- **TMDB API key** (free at https://www.themoviedb.org/settings/api)
- **Supabase project** (or local PostgreSQL)

---

## 1. Clone & Install

```bash
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install
```

---

## 2. Environment Setup

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/reels?schema=public"

# BetterAuth
BETTER_AUTH_SECRET="your-random-256-bit-secret"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - Apple
APPLE_CLIENT_ID="your-apple-service-id"
APPLE_CLIENT_SECRET="your-apple-private-key"

# TMDB
TMDB_API_READ_ACCESS_TOKEN="your-tmdb-read-access-token"

# Email (magic link)
SMTP_HOST="smtp.resend.com"
SMTP_PORT=465
SMTP_USER="resend"
SMTP_PASS="your-resend-api-key"
SMTP_FROM="noreply@reels.app"
```

---

## 3. Database

```bash
# Start local PostgreSQL (if using Docker)
docker run --name reels-db -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=user -e POSTGRES_DB=reels -p 5432:5432 -d postgres:16

# Push Prisma schema
pnpm --filter web db:push

# Generate Prisma client
pnpm --filter web db:generate
```

---

## 4. Run Development Servers

```bash
# Run all packages in dev mode (Turborepo)
pnpm dev
```

This starts:
- **Web app**: http://localhost:3000
- **Prisma Studio** (optional): `pnpm --filter web db:studio` → http://localhost:5555

---

## 5. iOS Development

```bash
# Open in Xcode
open apps/ios/Reels.xcodeproj
```

- Set scheme to "Reels" → iPhone 16 Simulator
- Update `APIClient.baseURL` to point to your local dev server (e.g., `http://192.168.x.x:3000`)
- Build & Run (⌘R)

---

## 6. Run Tests

```bash
# All tests (Turborepo)
pnpm test

# Unit/integration tests (web)
pnpm --filter web test

# E2E tests (web)
pnpm --filter web test:e2e

# Package tests
pnpm --filter matching-engine test
pnpm --filter letterboxd-scraper test

# iOS tests
xcodebuild test -project apps/ios/Reels.xcodeproj -scheme Reels -destination "platform=iOS Simulator,name=iPhone 16"
```

---

## 7. Lint & Type Check

```bash
# TypeScript type check (all packages)
pnpm typecheck

# ESLint
pnpm lint

# Prettier
pnpm format:check

# Dependency audit
pnpm audit
```

---

## 8. Key Scripts (package.json)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all packages in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | `tsc --noEmit` across all packages |
| `pnpm lint` | ESLint all packages |
| `pnpm format` | Prettier format all files |
| `pnpm format:check` | Prettier check (CI) |
| `pnpm --filter web db:push` | Push Prisma schema to DB |
| `pnpm --filter web db:generate` | Generate Prisma client |
| `pnpm --filter web db:studio` | Open Prisma Studio |

---

## Architecture Overview

```
Browser/iOS ──→ Next.js App Router ──→ tRPC Routers ──→ Services ──→ PostgreSQL
                                                           │
                                           ┌───────────────┼───────────────┐
                                           ▼               ▼               ▼
                                    Letterboxd       TMDB API       Matching
                                    Scraper          (normalize)    Engine
                                    (Cheerio)                       (70/30)
```
