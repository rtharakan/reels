# Implementation Plan: Product Launch Readiness Overhaul

**Branch**: `002-launch-readiness-overhaul` | **Date**: 1 April 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-launch-readiness-overhaul/spec.md`

## Summary

The previous product launch failed due to incomplete features, performance issues, security flaws, and broken navigation. This plan resolves all blockers across five workstreams: (1) Picker — a new group cinema planning feature with shareable voting links, (2) Navigation — unified responsive header/nav across all pages, (3) Mood Reels — an Easter Egg beta feature for mood-based film discovery and social matching, (4) Dutch localization and feature naming/icon consistency, and (5) Cross-platform QA, security hardening, and deployment across web (main), iOS (ios), and Android (android) branches.

## Technical Context

**Language/Version**: TypeScript 5.7+ (web), Swift 5.9+ (iOS), Kotlin 2.0+ / Jetpack Compose (Android)
**Primary Dependencies**: Next.js 14.2, React 18.3, tRPC 11, Prisma 6.2, BetterAuth, TanStack Query 5, Tailwind CSS, Radix UI, lucide-react, Zod, superjson, Vitest, Playwright; iOS: SwiftUI; Android: Jetpack Compose + Material3
**Storage**: PostgreSQL (Prisma ORM), MongoDB Atlas Vector Search (Mood Reels AI layer only)
**Testing**: Vitest (unit/integration), Playwright (e2e), XCTest (iOS), JUnit + Compose Testing (Android)
**Target Platform**: Web (Vercel), iOS 16+ (App Store), Android 8+ (Play Store)
**Project Type**: Monorepo — web-service + mobile-apps (pnpm workspaces + Turborepo)
**Performance Goals**: Pages < 2s load on 10 Mbps; interactions < 300ms; Mood Reels suggestions < 3s
**Constraints**: WCAG 2.1 AA, OWASP Top 10 clean, no third-party error tracking at launch, Netherlands cinema scope
**Scale/Scope**: ~15 pages/features, 3 platforms, 2 languages (en/nl), ~50 i18n key namespaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility-First Design | ✅ PASS | All new features (Picker, Mood Reels) will include WCAG 2.1 AA compliance: keyboard nav, screen reader labels, 4.5:1 contrast, 44×44pt touch targets, prefers-reduced-motion respect |
| II | Privacy by Design | ✅ PASS | Picker guests: display name + session cookie only, no PII, data deleted on plan expiry. Mood data is user-owned and deletable. No new third-party data sharing |
| III | Ethical UX — No Dark Patterns | ✅ PASS | Mood Reels has finite suggestions (5–10), no infinite scroll. Picker has clear plan states. No manipulative notifications |
| IV | Type-Safe End-to-End | ✅ PASS | New tRPC routers for Picker and Mood. Prisma models as source of truth. Zod validation on all inputs. iOS Codable models mirror tRPC shapes |
| V | Security by Default | ✅ PASS | BetterAuth for auth, Zod input validation, authorization checks on all new endpoints, rate limiting on Picker link generation, pnpm audit in CI |
| VI | Modular & Open Architecture | ✅ PASS | New features in existing monorepo structure (apps/web, apps/ios, apps/android, packages/*). No new vendor lock-in. MIT license maintained |
| VII | Inclusive Community Standards | ✅ PASS | Full Dutch localization with i18n system. Missing key fallback + logging. Report/block accessible on Mood Twins. 17+ age rating maintained |

**Gate Result: ALL PASS** — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-launch-readiness-overhaul/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── trpc-routers.md  # New tRPC router contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── web/                            # Next.js 14 web app (deploys from main)
│   ├── prisma/
│   │   └── schema.prisma           # Add: PickerPlan, PickerShowtime, PickerVote, PickerParticipant, UserMood, MoodFilmSuggestion
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/layout.tsx   # Update: unified nav with all features + icons
│   │   │   ├── picker/             # NEW: Picker feature pages
│   │   │   │   ├── page.tsx        # Create plan (two pathways)
│   │   │   │   └── [planId]/       # Shareable plan page (voting, results, confirmed)
│   │   │   │       └── page.tsx
│   │   │   ├── mood/               # NEW: Mood Reels Easter Egg
│   │   │   │   └── page.tsx
│   │   │   └── ...existing pages
│   │   ├── components/
│   │   │   ├── public-header.tsx    # Update: add Picker, consistent icons
│   │   │   ├── nav-header.tsx       # NEW: unified nav component for all pages
│   │   │   ├── picker/             # NEW: Picker UI components
│   │   │   └── mood/              # NEW: Mood Reels UI components
│   │   ├── lib/
│   │   │   ├── i18n/
│   │   │   │   ├── en.ts           # Update: add picker, mood, nav keys
│   │   │   │   └── nl.ts           # Update: add picker, mood, nav keys (Dutch)
│   │   │   └── ...
│   │   └── server/
│   │       ├── routers/
│   │       │   ├── _app.ts         # Update: add picker, mood routers
│   │       │   ├── picker.ts       # NEW: Picker tRPC router
│   │       │   └── mood.ts         # NEW: Mood Reels tRPC router
│   │       └── services/
│   │           ├── explore-screenings.ts  # Reuse for Picker showtimes
│   │           └── mood-engine.ts         # NEW: mood-to-film matching service
│   └── tests/
│       └── ...
├── ios/                            # SwiftUI app (deploys from ios branch)
│   └── Reels/
│       ├── Features/
│       │   ├── Picker/             # NEW: Picker feature module
│       │   ├── Mood/               # NEW: Mood Reels feature module
│       │   └── ...existing features
│       └── Core/
│           ├── Localization/       # Update: full Dutch translations
│           └── Networking/         # Update: new API client methods
└── android/                        # Kotlin/Compose app (deploys from android branch)
    └── app/src/main/
        ├── java/.../              # Feature modules mirroring web/iOS
        └── res/
            ├── values/strings.xml          # English strings
            └── values-nl/strings.xml       # Dutch strings

packages/
├── letterboxd-scraper/             # Existing — no changes
├── matching-engine/                # Existing — no changes
├── shared-types/                   # Update: add Picker, Mood types
│   └── src/
│       ├── picker.ts              # NEW
│       └── mood.ts                # NEW
└── ui/                            # Existing — potential shared components
```

**Structure Decision**: Extends existing monorepo structure. No new packages required. New features are implemented as new page routes + tRPC routers within `apps/web`, with corresponding feature modules in `apps/ios` and `apps/android`. Shared types added to `packages/shared-types`.

## Complexity Tracking

> No constitution violations — no entries needed.

## Constitution Re-Check (Post Phase 1 Design)

*Re-evaluated after data model, contracts, and research are complete.*

| # | Principle | Status | Post-Design Notes |
|---|-----------|--------|-------------------|
| I | Accessibility-First | ✅ PASS | Picker voting grid: keyboard-navigable cells, ARIA grid role. Mood selector: labeled buttons with color + icon (not color-only). All new components follow WCAG 2.1 AA |
| II | Privacy by Design | ✅ PASS | Guest data model confirmed: no PII beyond display name. Session cookie is httpOnly/Secure. Data deleted on plan expiry. MongoDB Atlas data is mood tags (not personal) |
| III | Ethical UX | ✅ PASS | Picker has clear states (voting/confirmed/expired). Mood Reels shows finite suggestions (5–10). No infinite scroll or FOMO patterns. "Mood Twins" is opt-in viewing |
| IV | Type-Safe End-to-End | ✅ PASS | All tRPC inputs use Zod schemas. Prisma models generate TypeScript types. i18n uses typed TypeScript objects. iOS Codable models mirror tRPC shapes per contracts |
| V | Security by Default | ✅ PASS | Rate limits defined per endpoint. Input validation via Zod. Guest session tokens are secure cookies. Plan IDs use cuid() (enumeration-resistant). CSP updated for Atlas |
| VI | Modular Architecture | ✅ PASS | No new packages added. Features are new routes + routers within existing structure. Voyage-4-nano is Apache 2.0. MongoDB Atlas is abstracted behind service interface |
| VII | Inclusive Community | ✅ PASS | All new i18n keys defined for both en/nl. Feature naming table enforced. Mood Twins inherit existing report/block from Discover. 17+ rating maintained |

**Post-Design Gate Result: ALL PASS** — Ready for task generation.
