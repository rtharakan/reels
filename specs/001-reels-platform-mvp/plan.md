# Implementation Plan: Reels — Film-Driven Social Matching Platform MVP

**Branch**: `001-reels-platform-mvp` | **Date**: 2026-03-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-reels-platform-mvp/spec.md`
**Revision**: 3 — addresses readiness checklist findings (75 items: spec gaps, contract conflicts, missing NFR/deployment/App Store requirements)", "oldString": "**Revision**: 2 — addresses analysis report findings (2 critical, 5 high, 2 low)

## Summary

Build a film-driven social matching platform MVP as a Turborepo monorepo with a Next.js web app, tRPC API layer, Prisma/PostgreSQL data store, Letterboxd watchlist scraper, taste-based matching engine (70% film overlap / 30% genre similarity), and a SwiftUI iOS app. Users import Letterboxd watchlists, browse a daily 10-card Discover feed, express interest, and receive mutual matches — with dual intent (Friends / Dating / Both).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, all web packages) · Swift 5.9+ (iOS)
**Primary Dependencies**: Next.js 14 (App Router) · tRPC v11 · Prisma ORM · BetterAuth · Tailwind CSS · Turborepo · SwiftUI · Cheerio (scraping) · TMDB API (film metadata)
**Storage**: PostgreSQL (Supabase-hosted) · Supabase Storage (profile photos, posters) · iOS SwiftData (offline cache)
**Testing**: Vitest (unit/integration, web) · Playwright (e2e, web) · XCTest (iOS) · axe-core (accessibility CI) · autocannon (load benchmarks)
**Target Platform**: Web (evergreen browsers) · iOS 17+ · Vercel (Node.js 20 LTS, production deployment)
**Project Type**: Monorepo — web-service + mobile-app
**Performance Goals**: Discover feed first card <2 s (SC-003) · onboarding flow <5 min (SC-001) · 90% watchlist import success (SC-002)
**Constraints**: 10 Discover cards/day per user · JWT access ≤15 min / refresh ≤7 days · polite scraping (robots.txt, rate-limited) · WCAG 2.1 AA · App Store 17+ rating
**Scale/Scope**: 10,000 registered users (SC-006) · ~8 screens web + ~8 screens iOS · 6 user stories (3× P1, 2× P2, 1× P3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Accessibility-First Design | ✅ PASS | FR-028–033 mandate WCAG 2.1 AA, keyboard nav, screen readers, 4.5:1 contrast, 44 pt touch targets, reduced-motion, alt text, semantic SwiftUI modifiers |
| II | Privacy by Design | ✅ PASS | FR-002 (plain-language privacy policy before data collection), FR-003 (GDPR deletion), NFR-011 (privacy policy + ToS pages), NFR-012 (GDPR data export), FR-011 (public data only), FR-013 (explicit user consent for scraping), encryption at rest/transit via Supabase, httpOnly cookies, Keychain storage. `privacyPolicyConsentedAt` timestamp provides audit trail. |
| III | Ethical UX — No Dark Patterns | ✅ PASS | FR-022 (10 cards/day finite feed), FR-023 (no nudge), FR-018 (transparent matching), FR-024/025 (block/report within 2 taps) |
| IV | Type-Safe End-to-End | ✅ PASS | TypeScript strict mode everywhere, tRPC for API contracts, Prisma as single source of truth for DB types, iOS Codable models mirroring tRPC shapes |
| V | Security by Default | ✅ PASS | OAuth 2.0 via BetterAuth (FR-001/004), FR-004a (JWT + rotating refresh tokens), NFR-001 (rate limiting with thresholds), NFR-002 (CSP headers), input validation at API boundaries, pnpm audit in CI, rate limiting on auth/scraping endpoints |
| VI | Modular & Open Architecture | ✅ PASS | Turborepo monorepo with /apps and /packages, independent builds/tests, no internal imports across package boundaries, vendor abstraction (Supabase behind service interfaces), MIT license |
| VII | Inclusive Community Standards | ✅ PASS | FR-009 (i18n readiness), FR-025/027 (report/moderation), CODE_OF_CONDUCT.md required, 17+ age rating, matching by film taste only — no demographic proxies |
| — | Dev Workflow: Conventional Commits | ✅ PASS | commitlint + Husky `commit-msg` hook enforces format; CI validates on PR |
| — | Dev Workflow: PR Reviews | ✅ PASS | PR template with constitutional compliance checklist; branch protection documented in CONTRIBUTING.md |

**Gate result: ALL PASS — proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-reels-platform-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (tRPC router contracts)
│   └── trpc-routers.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/
├── web/                         # Next.js 14 App Router (web client + API)
│   ├── src/
│   │   ├── app/                 # App Router pages & layouts
│   │   │   ├── (auth)/          # Auth routes (login, signup, magic-link)
│   │   │   ├── (main)/          # Authenticated routes
│   │   │   │   ├── discover/    # Discover feed page
│   │   │   │   ├── matches/     # Matches list + detail
│   │   │   │   └── profile/     # Profile view + edit + blocked users
│   │   │   ├── onboarding/      # Onboarding flow (privacy → profile → watchlist → top films)
│   │   │   └── layout.tsx
│   │   ├── components/          # Shared UI components
│   │   ├── lib/                 # Client utilities, hooks, providers
│   │   └── server/              # tRPC routers, server-side logic
│   │       ├── routers/         # tRPC route handlers
│   │       ├── services/        # Business logic (matching, scraping, import)
│   │       └── trpc.ts          # tRPC init + context
│   ├── prisma/
│   │   └── schema.prisma        # Single source of truth for DB types
│   ├── tests/
│   │   └── e2e/                 # Playwright + axe-core tests
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── ios/                         # SwiftUI iOS app
    ├── Reels/
    │   ├── App/                 # App entry, navigation, dependency injection
    │   ├── Features/
    │   │   ├── Auth/            # Sign-in, Apple Sign-In
    │   │   ├── Onboarding/      # Onboarding flow
    │   │   ├── Discover/        # Discover feed, card gestures
    │   │   ├── Matches/         # Matches list + detail
    │   │   ├── Profile/         # Profile view + edit
    │   │   └── Safety/          # Block, report
    │   ├── Core/
    │   │   ├── Networking/      # API client, JWT/Keychain management
    │   │   ├── Models/          # Codable models (mirror tRPC shapes)
    │   │   ├── Persistence/     # SwiftData offline cache
    │   │   └── Extensions/
    │   └── Resources/           # Assets, Localizable.strings, PrivacyInfo.xcprivacy
    ├── ReelsTests/
    └── Reels.xcodeproj

packages/
├── shared-types/                # Shared TypeScript types (exported for web)
│   ├── src/
│   │   ├── user.ts
│   │   ├── match.ts
│   │   ├── watchlist.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
├── matching-engine/             # Match scoring algorithm (70/30 weighting)
│   ├── src/
│   │   ├── overlap.ts           # Direct film overlap scorer (Jaccard)
│   │   ├── genre-similarity.ts  # Genre distribution cosine similarity
│   │   ├── score.ts             # Combined weighted score
│   │   └── index.ts
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
├── letterboxd-scraper/          # Letterboxd public watchlist scraper
│   ├── src/
│   │   ├── scraper.ts           # Cheerio-based HTML parser
│   │   ├── normalizer.ts        # TMDB API normalization
│   │   ├── robots.ts            # robots.txt compliance
│   │   └── index.ts
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
└── ui/                          # Shared UI primitives (web)
    ├── src/
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── input.tsx
    │   └── index.ts
    ├── tsconfig.json
    └── package.json

.github/
├── workflows/
│   └── ci.yml                   # TypeCheck, lint, audit, Vitest, Playwright, axe-core
└── pull_request_template.md     # Constitutional compliance checklist

docs/
├── README.md
├── CONTRIBUTING.md              # Includes branch protection guidance
├── CODE_OF_CONDUCT.md
└── LICENSE

turbo.json                       # Turborepo pipeline config
pnpm-workspace.yaml
package.json                     # Root — workspace scripts, shared devDeps
tsconfig.base.json               # Shared strict TS config
.env.example                     # Documented env vars (no real secrets)
commitlint.config.js             # Conventional Commits enforcement
```

**Structure Decision**: Turborepo monorepo with two apps (`web`, `ios`) and four packages (`shared-types`, `matching-engine`, `letterboxd-scraper`, `ui`). This follows Constitution Principle VI (Modular & Open Architecture) — each package is independently buildable/testable, no cross-package internal imports, vendor choices abstracted behind service interfaces.

## Complexity Tracking

No constitution violations to justify — all principles pass.

## Analysis Fixes Applied

This revision addresses the following findings from the cross-artifact analysis:

### Critical (C1, C2) — Data model nullability and consent tracking

**Problem**: BetterAuth creates the User record at authentication — before onboarding. Fields like `age`, `location`, `intent`, and `prompts` were marked NOT NULL in the data model, which would cause insertion failures. Additionally, no `privacyPolicyConsentedAt` or `onboardingCompletedAt` fields existed, meaning consent audit trails and onboarding status checks had no backing.

**Fix**: Made `age`, `location`, `bio`, `intent`, `letterboxdUsername`, `prompts`, `topFilmIds`, and `timezone` nullable on the User entity. Added `onboardingCompletedAt: DateTime?` and `privacyPolicyConsentedAt: DateTime?` fields. Auth middleware checks `onboardingCompletedAt` to route incomplete users back to onboarding. Consent timestamp satisfies GDPR audit requirements.

### High (H1) — Missing performance benchmarks

**Problem**: SC-003 (Discover <2 s) and SC-006 (10,000 users) had no verification tasks.

**Fix**: Added research section 9 (Performance Strategy) covering indexing plan and benchmark approach. Added tasks T103 (API response benchmark for `discover.getFeed`) and T104 (query plan analysis at 10K scale) to Phase 9.

### High (H2) — SeenUser re-eligibility exception

**Problem**: FR-022a allows previously seen users to reappear "after the other user re-imports a significantly changed watchlist" but SeenUser is permanent with no pruning logic.

**Fix**: Defined "significantly changed" as ≥30% new films (films added that were not in the previous import). On re-import with ≥30% new films, the system prunes SeenUser entries where the re-importing user is the `seenUserId`, allowing them to reappear in other users' feeds. Added research section 10 and task T105.

### High (H3) — Orphaned `user.updateIntent` contract

**Problem**: The tRPC contracts defined `user.updateIntent` as a standalone mutation, but no task implemented it, and intent changes were already handled by `user.updateProfile`.

**Fix**: Removed `user.updateIntent` from the contracts. Intent changes flow through `user.updateProfile` via `UpdateProfileInput.intent`.

### High (H4) — No commitlint or Husky

**Problem**: Constitution mandates Conventional Commits, but no tooling enforced it.

**Fix**: Added `commitlint.config.js` and Husky `commit-msg` hook to Phase 1 setup (task T106). CI also validates commit message format.

### High (H5) — No PR template or branch protection

**Problem**: Constitution mandates PR reviews with constitutional compliance self-check, but no template or documentation existed.

**Fix**: Added `.github/pull_request_template.md` with a constitutional compliance checklist (task T107). Branch protection guidance added to CONTRIBUTING.md in T011.

### Low (L1) — No onboarding timing validation

**Problem**: SC-001 (onboarding <5 minutes) had no benchmark.

**Fix**: Added timing assertion to the Playwright e2e tests — the onboarding flow must complete in <5 min wall clock (folded into T097 scope).

### Low (L2) — ESLint config format

**Problem**: T009 referenced `.eslintrc.cjs` (legacy format), but ESLint v9+ uses flat config.

**Fix**: Updated T009 to use `eslint.config.mjs` (flat config format).

### Additional medium-severity fixes applied

- **M3 (T018 stub routers)**: T018 now creates an `_app.ts` with incrementally merged routers. Phase 2 starts with `user` + `watchlist` stubs; later phases extend.
- **M4 (email transport)**: Added task T108 to configure Resend email transport and wire into BetterAuth `sendMagicLink`.
- **M5 (storage bucket)**: Added task T109 to create Supabase Storage bucket with CORS, file size limits, and signed URL utility.
- **M6 (watchlist skip path)**: T036 allows skipping or retrying. T038 accepts null `letterboxdUsername`.
- **M7 (terminology)**: Standardized on "match score" everywhere. The `MatchScore.totalScore` field name is kept internally as the computed composite; all user-facing and contract-level references use "match score."

## Constitution Re-Check (Post Phase 1 Design)

| # | Principle | Status | Post-Design Evidence |
|---|-----------|--------|---------------------|
| I | Accessibility-First Design | ✅ PASS | axe-core Playwright integration in CI; SwiftUI `performAccessibilityAudit()` in XCTest; alt text on all Film/User images; reduced-motion media queries; 44 pt touch targets in iOS layout |
| II | Privacy by Design | ✅ PASS | Prisma schema: `privacyPolicyConsentedAt` records GDPR consent; nullable onboarding fields prevent premature data collection; soft-delete with 30-day hard-delete cascade; TMDB API key server-side only; Keychain for iOS tokens; scraper stores only film IDs |
| III | Ethical UX — No Dark Patterns | ✅ PASS | DailyAllocation table enforces 10-card limit server-side; SeenUser table is permanent with controlled re-eligibility (≥30% watchlist change); DiscoverFeed type includes `isAllCaughtUp` flag; no nudge in UI |
| IV | Type-Safe End-to-End | ✅ PASS | All tRPC contracts typed; Prisma auto-generates TS types; iOS Codable models mirror tRPC response shapes; `shared-types` package; `strict: true` in all tsconfig |
| V | Security by Default | ✅ PASS | BetterAuth with `bearer`/`jwt` plugins; all mutations require auth context; input validated via Zod at tRPC router level; `pnpm audit` in CI; rate limiting on auth + watchlist.import endpoints |
| VI | Modular & Open Architecture | ✅ PASS | 4 independent packages + 2 apps; each has own tsconfig/package.json; no cross-package internal imports; vendor abstraction via service interfaces; MIT license in `/docs/LICENSE` |
| VII | Inclusive Community Standards | ✅ PASS | i18n: no hard-coded strings — all text extractable; moderation: Report entity with status workflow; CODE_OF_CONDUCT.md in `/docs/`; matching by film taste only |
| — | Dev Workflow: Conventional Commits | ✅ PASS | commitlint + Husky enforce at commit time; CI validates on PR |
| — | Dev Workflow: PR Reviews | ✅ PASS | `.github/pull_request_template.md` includes constitutional compliance checklist |

**Post-design gate result: ALL PASS.**
