# Quickstart: Product Launch Readiness Overhaul

**Feature**: 002-launch-readiness-overhaul  
**Date**: 1 April 2026

---

## Prerequisites

- Node.js ≥ 20
- pnpm 10.17+
- PostgreSQL (local or cloud — `DATABASE_URL` env var)
- MongoDB Atlas account (optional — for Mood Reels AI layer)
- TMDB API key (`TMDB_API_KEY` env var)
- Xcode 15+ (iOS development)
- Android Studio Hedgehog+ (Android development)

## Setup

```bash
# Clone and install
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install

# Environment
cp apps/web/.env.example apps/web/.env
# Fill in: DATABASE_URL, TMDB_API_KEY, BETTER_AUTH_SECRET, etc.

# Database
cd apps/web
pnpm db:generate
pnpm db:migrate
pnpm db:seed
cd ../..

# Run web app
pnpm dev
# Web app at http://localhost:3000
```

## Branch Workflow

```bash
# Web development (source of truth)
git checkout main
# Implement features here first

# iOS development
git checkout ios
git merge main  # Get latest schema/types/API contracts

# Android development  
git checkout android
git merge main  # Get latest schema/types/API contracts
```

## Key Development Commands

```bash
# Full build (all packages)
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test                              # All unit/integration tests
cd apps/web && pnpm test:e2e           # Playwright e2e tests

# Database operations
cd apps/web
pnpm db:migrate                        # Run migrations
pnpm db:studio                         # Open Prisma Studio
pnpm db:seed                           # Seed data

# Security audit
pnpm audit
```

## New Feature Development Order

Implementation should follow this dependency order:

1. **Prisma Schema** — Add new models (PickerPlan, PickerShowtime, PickerVote, PickerParticipant, UserMood, MoodFilmSuggestion, MoodFilmTag) → run `pnpm db:migrate`
2. **Shared Types** — Add Picker and Mood types to `packages/shared-types/src/`
3. **Navigation** — Unify `NavHeader` component before adding new feature pages
4. **i18n Keys** — Add all new translation keys to `en.ts` and `nl.ts` (ensures type safety before UI work)
5. **tRPC Routers** — Implement `picker.ts` and `mood.ts` server routers
6. **Picker UI** — Create Picker pages (`/picker`, `/picker/[planId]`)
7. **Mood Reels UI** — Create Mood Reels page (`/mood`)
8. **Tests** — Unit tests for routers, integration tests for flows, e2e for navigation
9. **iOS Port** — Mirror web features in SwiftUI on `ios` branch
10. **Android Port** — Mirror web features in Compose on `android` branch
11. **QA & Security** — Full audit, performance testing, visual regression
12. **Deploy** — Web from main, iOS from ios, Android from android

## File Locations (Quick Reference)

| Artifact | Path |
|----------|------|
| Prisma Schema | `apps/web/prisma/schema.prisma` |
| tRPC App Router | `apps/web/src/server/routers/_app.ts` |
| Picker Router | `apps/web/src/server/routers/picker.ts` (NEW) |
| Mood Router | `apps/web/src/server/routers/mood.ts` (NEW) |
| Picker Page | `apps/web/src/app/picker/page.tsx` (NEW) |
| Picker Plan Page | `apps/web/src/app/picker/[planId]/page.tsx` (NEW) |
| Mood Page | `apps/web/src/app/mood/page.tsx` (NEW) |
| Nav Header | `apps/web/src/components/nav-header.tsx` (NEW) |
| Public Header | `apps/web/src/components/public-header.tsx` (UPDATE) |
| Auth Layout | `apps/web/src/app/(main)/layout.tsx` (UPDATE) |
| English i18n | `apps/web/src/lib/i18n/en.ts` (UPDATE) |
| Dutch i18n | `apps/web/src/lib/i18n/nl.ts` (UPDATE) |
| Showtime Service | `apps/web/src/server/services/explore-screenings.ts` (REUSE) |
| Mood Engine | `apps/web/src/server/services/mood-engine.ts` (NEW) |
| iOS Features | `apps/ios/Reels/Features/Picker/`, `apps/ios/Reels/Features/Mood/` (NEW) |
| Android Features | `apps/android/app/src/main/java/.../picker/`, `.../mood/` (NEW) |
| Spec | `specs/002-launch-readiness-overhaul/spec.md` |
| Plan | `specs/002-launch-readiness-overhaul/plan.md` |
| Data Model | `specs/002-launch-readiness-overhaul/data-model.md` |
| Contracts | `specs/002-launch-readiness-overhaul/contracts/trpc-routers.md` |

## Environment Variables (New)

| Variable | Purpose | Required |
|----------|---------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string (Mood Reels AI layer) | Optional |
| `MOOD_AI_ENABLED` | Enable AI embedding layer (`true`/`false`) | Optional, default `false` |

All other environment variables remain unchanged from the existing `.env.example`.
