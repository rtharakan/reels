# Tasks: Reels — Film-Driven Social Matching Platform MVP

**Input**: Design documents from `/specs/001-reels-platform-mvp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in the feature specification — test tasks are omitted.

**Organization**: Tasks grouped by user story (6 stories: 3× P1, 2× P2, 1× P3). Each story can be implemented and tested independently after the Foundational phase completes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in every task description

## Path Conventions

- **Web app**: `apps/web/src/` (Next.js 14 App Router + tRPC + Prisma)
- **iOS app**: `apps/ios/Reels/` (SwiftUI)
- **Packages**: `packages/{name}/src/` (shared-types, matching-engine, letterboxd-scraper, ui)
- **Docs**: `docs/` (README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Turborepo monorepo, install dependencies, configure tooling, and create the project skeleton.

- [x] T001 Initialize Turborepo monorepo with pnpm workspaces in `package.json`, `pnpm-workspace.yaml`, and `turbo.json`
- [x] T002 Create root `tsconfig.base.json` with strict mode enabled and shared compiler options
- [x] T003 [P] Create `packages/shared-types/` package with `package.json`, `tsconfig.json`, and barrel export in `src/index.ts`
- [x] T004 [P] Create `packages/ui/` package with `package.json`, `tsconfig.json`, Tailwind CSS config, and barrel export in `src/index.ts`
- [x] T005 [P] Create `packages/matching-engine/` package with `package.json`, `tsconfig.json`, Vitest config, and barrel export in `src/index.ts`
- [x] T006 [P] Create `packages/letterboxd-scraper/` package with `package.json`, `tsconfig.json`, Vitest config, and barrel export in `src/index.ts`
- [x] T007 Initialize `apps/web/` Next.js 14 App Router project with `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, and `postcss.config.js`
- [ ] T008 [P] Create `apps/ios/Reels.xcodeproj` Xcode project with SwiftUI app entry point in `apps/ios/Reels/App/ReelsApp.swift`
- [x] T009 [P] Configure ESLint (flat config `eslint.config.mjs`) + Prettier at root with shared config and `.prettierrc`
- [x] T010 [P] Create `.env.example` with all documented env vars (DATABASE_URL, BETTER_AUTH_SECRET, OAuth keys, TMDB token, SMTP config)
- [x] T011 [P] Create `docs/README.md`, `docs/CONTRIBUTING.md` (include branch protection guidance: require 1 approval, status checks on main), `docs/CODE_OF_CONDUCT.md`, and `docs/LICENSE` (MIT)
- [x] T106 [P] Install commitlint (`@commitlint/cli`, `@commitlint/config-conventional`) and Husky; configure `commit-msg` hook to enforce Conventional Commits in `commitlint.config.js`
- [x] T107 [P] Create `.github/pull_request_template.md` with constitutional compliance checklist (accessibility, privacy, security, type safety, ethical UX, modularity, community standards)

**Checkpoint**: Monorepo builds with `pnpm build`; all packages resolve; `pnpm typecheck` passes with zero errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. This includes the database schema, authentication, tRPC setup, base UI components, and the Letterboxd scraper + matching engine packages.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T012 Define full Prisma schema with all entities (User, Film, WatchlistEntry, Interest, Match, Block, Report, MatchScore, SeenUser, DailyAllocation, DeviceToken) and enums (Intent, ReportReason, ReportStatus) in `apps/web/prisma/schema.prisma`. User onboarding fields (`age`, `location`, `intent`, `timezone`, `prompts`) MUST be nullable — BetterAuth creates the User at auth time before onboarding. Add `privacyPolicyConsentedAt: DateTime?` and `onboardingCompletedAt: DateTime?` fields. Add index on `onboardingCompletedAt`.
- [x] T013 Run `prisma db push` and `prisma generate` to create the database and generate the Prisma client
- [x] T014 [P] Define shared TypeScript types (UserProfile, PublicProfile, FilmPreview, Intent, DiscoverCard, MatchListItem, MatchDetail, ImportResult, etc.) in `packages/shared-types/src/user.ts`, `packages/shared-types/src/match.ts`, `packages/shared-types/src/watchlist.ts`
- [x] T015 [P] Configure BetterAuth with Prisma adapter, socialProviders (Google, Apple), magicLink plugin, bearer plugin, jwt plugin, and nextCookies plugin in `apps/web/src/lib/auth.ts`
- [x] T016 [P] Mount BetterAuth handler at `apps/web/src/app/api/auth/[...all]/route.ts` exporting toNextJsHandler as GET and POST
- [x] T017 Initialize tRPC with context that extracts BetterAuth session via `auth.api.getSession({ headers })` in `apps/web/src/server/trpc.ts`
- [x] T018 Create tRPC app router in `apps/web/src/server/routers/_app.ts`. Start with `user` and `watchlist` routers only (stub empty routers for others). Extend incrementally as new routers are built in later phases.
- [x] T019 [P] Create tRPC HTTP handler route at `apps/web/src/app/api/trpc/[trpc]/route.ts`
- [x] T020 [P] Create tRPC React client provider with queryClient in `apps/web/src/lib/trpc.ts` and wrap app in `apps/web/src/app/layout.tsx`
- [x] T021 [P] Implement robots.txt fetcher and compliance checker in `packages/letterboxd-scraper/src/robots.ts`
- [x] T022 Implement Cheerio-based Letterboxd watchlist HTML scraper with pagination, polite crawling (500ms delay, User-Agent header), and public-profile detection in `packages/letterboxd-scraper/src/scraper.ts`
- [x] T023 Implement TMDB API normalizer (search by title+year, extract tmdbId, posterPath, genreIds, handle 429 backoff, handle not-found) in `packages/letterboxd-scraper/src/normalizer.ts`
- [x] T024 [P] Implement Jaccard film overlap scorer in `packages/matching-engine/src/overlap.ts`
- [x] T025 [P] Implement cosine genre similarity scorer in `packages/matching-engine/src/genre-similarity.ts`
- [x] T026 Implement combined weighted score function (0.70 × filmOverlap + 0.30 × genreSimilarity) in `packages/matching-engine/src/score.ts`
- [x] T027 [P] Build shared UI primitives (Button, Card, Input, Avatar, Badge) with Tailwind CSS, dark mode default, 4.5:1 contrast ratios, keyboard focusability, and aria attributes in `packages/ui/src/`
- [x] T028 [P] Create root layout with dark theme, `<html lang="en">`, `prefers-reduced-motion` media query, and tRPC/auth providers in `apps/web/src/app/layout.tsx`
- [ ] T029 [P] Create iOS Core networking layer: APIClient with URLSession, tRPC wire format encoding, Bearer token header injection in `apps/ios/Reels/Core/Networking/APIClient.swift`
- [ ] T030 [P] Create iOS Keychain manager for JWT/bearer token storage in `apps/ios/Reels/Core/Networking/KeychainManager.swift`
- [ ] T031 [P] Create iOS Codable models mirroring tRPC response envelope and domain types (UserProfile, FilmPreview, DiscoverCard, MatchDetail, etc.) in `apps/ios/Reels/Core/Models/`
- [x] T108 [P] Configure email transport for magic link delivery: install Resend SDK (`resend` npm package), wire into BetterAuth `sendMagicLink` callback with HTML template in `apps/web/src/lib/email.ts`
- [ ] T109 [P] Create Supabase Storage bucket `profile-photos` (public read, max 5 MB, MIME types: jpeg/png/webp), configure CORS, implement signed-URL upload utility in `apps/web/src/server/services/storage.ts`

**Checkpoint**: Foundation ready — `pnpm typecheck` passes; Prisma schema applied; BetterAuth serves `/api/auth/get-session`; tRPC responds at `/api/trpc/`; scraper package exports `scrapeWatchlist()`; matching-engine exports `computeMatchScore()`; iOS app builds and APIClient compiles.

---

## Phase 3: User Story 1 — Sign Up & Onboarding (Priority: P1) 🎯 MVP

**Goal**: A new user creates an account (email magic link or OAuth), completes the onboarding flow (profile fields + Letterboxd watchlist import), and lands on the Discover feed.

**Independent Test**: Create an account, complete onboarding with a valid Letterboxd username, verify the imported watchlist appears on the user's profile with resolved film data.

### Implementation

- [x] T032 [P] [US1] Create auth pages (login, signup, magic-link-sent) with email input form and OAuth buttons in `apps/web/src/app/(auth)/login/page.tsx` and `apps/web/src/app/(auth)/signup/page.tsx`
- [x] T033 [P] [US1] Create onboarding multi-step form layout with progress indicator in `apps/web/src/app/onboarding/layout.tsx`
- [x] T034 [US1] Implement onboarding step 1: Privacy policy consent gate in `apps/web/src/app/onboarding/privacy/page.tsx`
- [x] T035 [US1] Implement onboarding step 2: Profile fields (name, age, location, bio, intent selector, prompts) with Zod validation in `apps/web/src/app/onboarding/profile/page.tsx`
- [x] T036 [US1] Implement onboarding step 3: Letterboxd username input with import trigger, loading state, error handling (invalid/private username, Letterboxd unreachable), import summary, and **skip/retry option** (user can complete onboarding without importing — watchlist can be imported later from profile) in `apps/web/src/app/onboarding/watchlist/page.tsx`
- [x] T037 [US1] Implement onboarding step 4: Top 4 film selector (auto-populated from imported watchlist) in `apps/web/src/app/onboarding/top-films/page.tsx`
- [x] T038 [US1] Implement `user.completeOnboarding` tRPC mutation with Zod input validation (OnboardingInput schema) in `apps/web/src/server/routers/user.ts`. Accept nullable `letterboxdUsername` (user may skip watchlist import). Set `onboardingCompletedAt` and `privacyPolicyConsentedAt` timestamps on the existing User record (created by BetterAuth at auth time).
- [x] T039 [US1] Implement `watchlist.import` tRPC mutation: call letterboxd-scraper, run TMDB normalization, upsert Film records, create WatchlistEntry records, return ImportResult in `apps/web/src/server/routers/watchlist.ts`
- [x] T040 [US1] Implement watchlist import service orchestrating scraper → normalizer → Prisma upserts with rate limiting in `apps/web/src/server/services/watchlist-import.ts`
- [x] T041 [US1] Implement match score recomputation trigger: after watchlist import, compute MatchScore for new user vs all existing eligible users using matching-engine package in `apps/web/src/server/services/match-score.ts`
- [x] T042 [US1] Implement `user.me` tRPC query returning full UserProfile with watchlistCount and topFilms in `apps/web/src/server/routers/user.ts`
- [x] T043 [US1] Add auth middleware redirect: unauthenticated → login, authenticated with `onboardingCompletedAt === null` → onboarding, onboarded → discover in `apps/web/src/middleware.ts`
- [ ] T044 [US1] Add keyboard navigation, screen reader labels, and accessible error messages to all onboarding forms

**Checkpoint**: User Story 1 fully functional — a user can sign up, complete onboarding, import watchlist, and be redirected to Discover. Watchlist films are resolved via TMDB and stored in the database.

---

## Phase 4: User Story 2 — Discover & Express Interest (Priority: P1)

**Goal**: An authenticated user opens the Discover feed and sees a card-based interface showing up to 10 candidate users per day, ranked by match score. They can express interest or skip. The feed ends when cards are exhausted.

**Independent Test**: Log in with an imported watchlist, verify the Discover feed shows cards ranked by overlap score with shared films displayed, express interest and confirm it is recorded, reach "all caught up" end-state.

### Implementation

- [x] T045 [US2] Implement `discover.getFeed` tRPC query: select top unseen/unblocked/intent-compatible candidates from MatchScore, enforce 10-card daily limit via DailyAllocation with timezone-aware midnight reset, return DiscoverFeed in `apps/web/src/server/routers/discover.ts`
- [x] T046 [US2] Implement Discover feed service with the candidate selection query (exclude SeenUser, Block bidirectional, soft-deleted, intent-incompatible, <5 films) in `apps/web/src/server/services/discover-feed.ts`
- [x] T047 [US2] Implement `discover.expressInterest` tRPC mutation: create Interest record, check reciprocal, insert SeenUser, increment DailyAllocation, return InterestResult in `apps/web/src/server/routers/discover.ts`
- [x] T048 [US2] Implement `discover.skip` tRPC mutation: insert SeenUser, increment DailyAllocation in `apps/web/src/server/routers/discover.ts`
- [ ] T049 [P] [US2] Build DiscoverCard UI component displaying profile preview, shared film count, shared film posters (with alt text), intent badge, and overflow menu in `apps/web/src/components/discover-card.tsx`
- [x] T050 [US2] Build Discover feed page with card stack, interest/skip action buttons, keyboard shortcuts (→ skip, ← interest), and "You're all caught up" empty state in `apps/web/src/app/(main)/discover/page.tsx`
- [x] T051 [US2] Implement `user.getById` tRPC query returning PublicProfile for detailed profile view from Discover card tap in `apps/web/src/server/routers/user.ts`
- [ ] T052 [US2] Build user profile detail modal/page showing bio, prompts, top films, shared films, and intent from Discover card tap in `apps/web/src/components/profile-detail.tsx`
- [ ] T053 [US2] Add reduced-motion support: card transitions degrade to instant swap when `prefers-reduced-motion: reduce` is active
- [ ] T054 [US2] Add keyboard navigation for card actions and screen reader announcements for card transitions

**Checkpoint**: User Story 2 fully functional — Discover feed loads <2s (SC-003), shows ranked cards, interest/skip are recorded, feed ends at 10 cards or pool exhaustion. Works independently of US3–US6.

---

## Phase 5: User Story 3 — Mutual Match (Priority: P1)

**Goal**: When two users express mutual interest, a Match is created. Both users can see it in their Matches list with shared film data and a "why you matched" explanation.

**Independent Test**: Have two test users express mutual interest, verify a Match record is created, verify both see it in their Matches list with shared films and genre overlap.

### Implementation

- [x] T055 [US3] Implement mutual match creation logic: on reciprocal Interest detection, create Match with canonical user ordering, populate sharedFilmIds, compute genre overlap in `apps/web/src/server/services/match-creation.ts`
- [x] T056 [US3] Implement `match.list` tRPC query returning all matches for current user with otherUser preview, sharedFilmCount, score in `apps/web/src/server/routers/match.ts`
- [x] T057 [US3] Implement `match.getById` tRPC query returning full MatchDetail with otherUser PublicProfile, sharedFilms, genreOverlap breakdown in `apps/web/src/server/routers/match.ts`
- [x] T058 [P] [US3] Build Matches list page showing match cards with other user's name, photo, shared film count, and match date in `apps/web/src/app/(main)/matches/page.tsx`
- [x] T059 [US3] Build Match detail page showing "Why you matched" section: shared films grid, genre overlap chart, match score, and other user's full profile in `apps/web/src/app/(main)/matches/[matchId]/page.tsx`
- [ ] T060 [US3] Add accessible live region announcement when a new match is created (triggered by InterestResult.isMatch) on the Discover feed
- [ ] T061 [US3] Wire match notification: when a match is created, update Matches list badge/count in the navigation bar in `apps/web/src/components/nav-bar.tsx`

**Checkpoint**: User Story 3 fully functional — mutual matches appear in both users' Matches lists with full "why you matched" transparency. Works independently of US4–US6.

---

## Phase 6: User Story 4 — Profile Management (Priority: P2)

**Goal**: An authenticated user can view and edit all profile fields, re-import their watchlist, and delete their account with full data removal.

**Independent Test**: Edit each profile field and verify persistence, trigger watchlist re-import and verify updates, delete account and verify all data is removed.

### Implementation

- [x] T062 [P] [US4] Build profile view page displaying all user fields, watchlist count, top films, prompts, and intent in `apps/web/src/app/(main)/profile/page.tsx`
- [x] T063 [US4] Build profile edit form with inline editing for name, age, location, bio, intent, prompts, top films, and profile photos in `apps/web/src/app/(main)/profile/edit/page.tsx`
- [x] T064 [US4] Implement `user.updateProfile` tRPC mutation with Zod validation (UpdateProfileInput schema) and Prisma update in `apps/web/src/server/routers/user.ts`
- [ ] T065 [US4] Implement profile photo upload: client-side resize/compress, upload to Supabase Storage/R2, store URL in user.profilePhotos in `apps/web/src/server/services/photo-upload.ts`
- [x] T066 [US4] Build watchlist re-import UI with trigger button, loading state, and updated import summary on profile page in `apps/web/src/app/(main)/profile/page.tsx`
- [x] T067 [US4] Implement `user.deleteAccount` tRPC mutation: soft-delete user (set `deletedAt`), cascade to remove from MatchScores, SeenUser exclusions, and DailyAllocations in `apps/web/src/server/routers/user.ts`
- [ ] T068 [US4] Build account deletion confirmation dialog with clear warning text and double-confirmation in `apps/web/src/components/delete-account-dialog.tsx`
- [x] T069 [US4] Implement `watchlist.getMyWatchlist` tRPC query with cursor-based pagination in `apps/web/src/server/routers/watchlist.ts`

**Checkpoint**: User Story 4 fully functional — all profile fields editable, watchlist re-importable, account deletion removes user from all feeds. Works independently of US5–US6.

---

## Phase 7: User Story 5 — Safety: Block & Report (Priority: P2)

**Goal**: A user can block or report another user within two taps from any profile view or Discover card. Blocking removes the other user from all feeds and match lists.

**Independent Test**: Block a user and verify they vanish from Discover and Matches. Report a user and verify the report is recorded with status PENDING.

### Implementation

- [x] T070 [US5] Implement `safety.block` tRPC mutation: create Block record, delete existing Match/Interest between users, bidirectional Discover exclusion in `apps/web/src/server/routers/safety.ts`
- [x] T071 [US5] Implement `safety.unblock` tRPC mutation: remove Block record in `apps/web/src/server/routers/safety.ts`
- [x] T072 [US5] Implement `safety.report` tRPC mutation: create Report record with reason/description, validate input, return reportId in `apps/web/src/server/routers/safety.ts`
- [x] T073 [US5] Implement `safety.getBlockedUsers` tRPC query returning list of blocked users in `apps/web/src/server/routers/safety.ts`
- [ ] T074 [P] [US5] Build overflow menu component with "Block" and "Report" options accessible within two taps, usable from Discover cards and profile views in `apps/web/src/components/user-overflow-menu.tsx`
- [ ] T075 [US5] Build Report dialog with reason selector (SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, FAKE_PROFILE, OTHER), optional description, and submit confirmation in `apps/web/src/components/report-dialog.tsx`
- [x] T076 [US5] Build Blocked Users management page listing blocked users with unblock option in `apps/web/src/app/(main)/profile/blocked/page.tsx`
- [ ] T077 [US5] Integrate overflow menu into DiscoverCard component and ProfileDetail component ensuring ≤2 taps to block/report (FR-024, FR-025)

**Checkpoint**: User Story 5 fully functional — block removes user from all surfaces bidirectionally, report is recorded for moderation. Satisfies SC-005 (≤2 taps).

---

## Phase 8: User Story 6 — iOS Native Experience (Priority: P3)

**Goal**: An iOS user downloads the app, signs in (including Apple Sign-In), and accesses all features with native gestures, push notifications for matches, and offline caching.

**Independent Test**: Install the iOS app, sign in with Apple, import watchlist, browse Discover with swipe gestures, receive push notification for a match, go offline and verify cached data is accessible.

### Implementation

- [ ] T078 [P] [US6] Create iOS navigation structure with TabView (Discover, Matches, Profile) and authentication gate in `apps/ios/Reels/App/ContentView.swift` and `apps/ios/Reels/App/AppNavigation.swift`
- [ ] T079 [US6] Implement Apple Sign-In flow using AuthenticationServices, send credential to BetterAuth `/api/auth/sign-in/social`, store bearer token in Keychain in `apps/ios/Reels/Features/Auth/SignInView.swift`
- [ ] T080 [US6] Implement iOS onboarding flow mirroring web: privacy consent → profile fields → Letterboxd import → top films in `apps/ios/Reels/Features/Onboarding/OnboardingView.swift`
- [ ] T081 [US6] Build Discover feed with native swipe gestures (right = interest, left = skip) using SwiftUI drag gesture with 44pt touch targets in `apps/ios/Reels/Features/Discover/DiscoverView.swift`
- [ ] T082 [US6] Build DiscoverCard SwiftUI view with profile preview, shared films, accessibility labels and hints on all interactive elements in `apps/ios/Reels/Features/Discover/DiscoverCardView.swift`
- [ ] T083 [US6] Implement reduced-motion check: disable swipe animations when `UIAccessibility.isReduceMotionEnabled` via `@Environment(\.accessibilityReduceMotion)` in Discover views
- [ ] T084 [US6] Build Matches list and detail views with shared films, "why you matched" section, and VoiceOver support in `apps/ios/Reels/Features/Matches/MatchesListView.swift` and `apps/ios/Reels/Features/Matches/MatchDetailView.swift`
- [ ] T085 [US6] Build Profile view and edit screens with all editable fields and re-import trigger in `apps/ios/Reels/Features/Profile/ProfileView.swift` and `apps/ios/Reels/Features/Profile/EditProfileView.swift`
- [ ] T086 [US6] Implement block/report from overflow menu within 2 taps on profile and Discover views in `apps/ios/Reels/Features/Safety/BlockReportSheet.swift`
- [x] T087 [US6] Implement `device.registerPush` and `device.unregisterPush` tRPC mutations on the server in `apps/web/src/server/routers/device.ts`
- [ ] T088 [US6] Implement server-side APNs push notification on match creation using `apns2` npm package in `apps/web/src/server/services/push-notification.ts`
- [ ] T089 [US6] Register for remote notifications on app launch, send device token to server via `device.registerPush` in `apps/ios/Reels/App/ReelsApp.swift`
- [ ] T090 [US6] Implement CoreData/SwiftData offline cache layer for Discover cards, Matches, and Profile in `apps/ios/Reels/Core/Persistence/CacheManager.swift`
- [ ] T091 [US6] Create `PrivacyInfo.xcprivacy` manifest, configure permission prompts (push notifications), and ensure account deletion is accessible per App Store guidelines in `apps/ios/Reels/Resources/`
- [ ] T092 [US6] Add Dynamic Type support using system fonts (`.body`, `.title`, etc.) that scale with user's text size preference in all iOS views
- [ ] T093 [US6] Add `Localizable.strings` with all user-facing text extracted for i18n readiness in `apps/ios/Reels/Resources/`

**Checkpoint**: User Story 6 fully functional — iOS app achieves feature parity with web, Apple Sign-In works, push notifications arrive, offline caching shows cached data. Satisfies SC-010 prep for App Store submission.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Quality, performance, documentation, and accessibility hardening across all stories.

- [ ] T094 [P] Add rate limiting middleware to auth endpoints (10 req/min per IP), `watchlist.import` (5 req/hr per user), and `discover.expressInterest`/`discover.skip` (30 req/min per user) in `apps/web/src/server/middleware/rate-limit.ts` (NFR-001)
- [ ] T095 [P] Add TMDB "Powered by TMDB" attribution logo to pages displaying poster images in `apps/web/src/components/tmdb-attribution.tsx` (NFR-003)
- [ ] T096 [P] Implement scheduled hard-delete job: purge soft-deleted users older than 30 days with cascading data removal in `apps/web/src/server/services/gdpr-cleanup.ts` (NFR-009)
- [ ] T097 [P] Add Playwright axe-core accessibility tests for all key pages (login, onboarding, discover, matches, profile) in `apps/web/tests/e2e/accessibility.spec.ts`. Include onboarding flow timing assertion: full flow must complete in <5 min wall clock (SC-001).
- [ ] T098 [P] Add `pnpm audit` step to CI pipeline in `.github/workflows/ci.yml`
- [ ] T099 [P] Configure GitHub Actions CI: typecheck, lint, format check, commitlint, audit, Vitest, Playwright e2e, axe-core accessibility in `.github/workflows/ci.yml`
- [ ] T100 Run quickstart.md validation: verify all steps in `specs/001-reels-platform-mvp/quickstart.md` execute successfully from a clean clone (DEP-006)
- [ ] T101 [P] Add `prefers-reduced-motion` tests verifying animations are disabled when the flag is active
- [ ] T102 Final review: verify all user-facing strings are extractable (no hard-coded text), all images have alt text, all interactive elements have aria labels
- [ ] T103 [P] Add API response time benchmark for `discover.getFeed` using autocannon (100 concurrent, 30 s) against a 10K-user seeded database; p95 must be <2 s (SC-003) in `apps/web/tests/bench/discover-bench.ts`
- [ ] T104 [P] Generate and review `EXPLAIN ANALYZE` query plans for Discover feed query, MatchScore lookups, and SeenUser exclusions at 10K-user scale; document optimization notes in `specs/001-reels-platform-mvp/research.md` appendix (SC-006)
- [ ] T105 Implement SeenUser re-eligibility on watchlist re-import: when ≥30% of resolved films are new (not in previous import), prune SeenUser entries where the re-importing user is the `seenUserId` in `apps/web/src/server/services/watchlist-import.ts` (FR-022a)
- [ ] T110 [P] Add structured JSON logging middleware (timestamp, level, requestId, userId, action) in `apps/web/src/server/middleware/logger.ts` (NFR-004)
- [ ] T111 [P] Integrate error tracking (Sentry) with alert threshold configuration (≥10 errors/min) in `apps/web/src/lib/sentry.ts` and `apps/web/src/app/layout.tsx` (NFR-005)
- [x] T112 [P] Add Content-Security-Policy and security headers via Next.js `next.config.ts` `headers()` function (NFR-002)
- [ ] T113 [P] Add lightweight analytics event emitter for `onboarding.completed`, `discover.interest`, `discover.skip`, `match.created`, `session.started` — privacy-respecting (no PII), first-party endpoint in `apps/web/src/lib/analytics.ts` (NFR-006)
- [ ] T114 [P] Switch Prisma production workflow from `db push` to `prisma migrate dev` / `prisma migrate deploy`; create initial migration file in `apps/web/prisma/migrations/` (NFR-008)

---

## Phase 10: Ship Readiness

**Purpose**: Legal documents, deployment pipeline, App Store preparation, and final pre-launch gates.

- [x] T115 [P] Draft and deploy privacy policy at `/privacy` and terms of service at `/terms` — plain language, GDPR-compliant, referencing data collected per PrivacyInfo.xcprivacy (NFR-011, FR-002)
- [ ] T116 [P] Create `vercel.json` configuration (if needed) and verify `apps/web` deploys to Vercel with environment variables (DEP-001)
- [ ] T117 [P] Configure CD: Vercel auto-deploy staging on `main` merge, manual production promotion via Vercel environment (DEP-003)
- [ ] T118 [P] Create `.env.staging` and `.env.production` templates with all required secrets documented; verify secrets are set in Vercel Environment Variables (DEP-004)
- [x] T119 [P] Implement GDPR data export endpoint `user.exportData` tRPC query returning JSON of all user data (profile, watchlist, matches, interests) in `apps/web/src/server/routers/user.ts` (NFR-012)
- [ ] T120 [P] Prepare App Store Connect metadata: description, keywords, category, screenshots (6.7" + 6.1"), age rating questionnaire (17+, dating intent) (IOS-001)
- [ ] T121 [P] Finalize `PrivacyInfo.xcprivacy` with all collected data types and privacy nutrition labels (IOS-002)
- [ ] T122 [P] Configure Apple Developer certificates, provisioning profiles, App ID, and push notification entitlement (IOS-003)
- [ ] T123 [P] Configure TestFlight internal testing; run full end-to-end pass before App Store submission (IOS-005)
- [ ] T124 Verify iOS account deletion is accessible from within the app (Settings → Delete Account) per Apple requirements (IOS-004)
- [ ] T125 Final pre-ship gate: all CI checks green, quickstart validated (T100), staging deploy verified, privacy/terms pages live, all P1+P2 user stories passing e2e tests

**Checkpoint**: All artifacts verified — web deployed to staging, iOS on TestFlight, legal docs live, analytics wired, monitoring active. Ready for production promotion and App Store submission.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **Phase 3 (US1 — Onboarding)**: Depends on Phase 2 — no dependencies on other stories
- **Phase 4 (US2 — Discover)**: Depends on Phase 2 + partially on T041 (match scores exist) — can start in parallel with US1 if test data is seeded
- **Phase 5 (US3 — Match)**: Depends on Phase 2 + T047 (express interest mutation) — recommended after US2
- **Phase 6 (US4 — Profile)**: Depends on Phase 2 — independent of US2/US3
- **Phase 7 (US5 — Safety)**: Depends on Phase 2 — independent, but integrates with Discover (US2) and Profile (US4) UI
- **Phase 8 (US6 — iOS)**: Depends on Phase 2 + all web API routers from US1–US5 — start after web is functional
- **Phase 9 (Polish)**: Depends on desired user stories being complete
- **Phase 10 (Ship Readiness)**: Depends on Phase 9; legal/deployment tasks can start in parallel with Phase 9

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ──── BLOCKS ALL ────┐
    │                                       │
    ├──▶ Phase 3: US1 (Sign Up) ◄── MVP    │
    │        │                              │
    │        ▼ (match scores populated)     │
    ├──▶ Phase 4: US2 (Discover)            │
    │        │                              │
    │        ▼ (express interest exists)    │
    ├──▶ Phase 5: US3 (Match)              │
    │                                       │
    ├──▶ Phase 6: US4 (Profile) ◄─ parallel │
    │                                       │
    ├──▶ Phase 7: US5 (Safety) ◄── parallel │
    │                                       │
    │    [Web APIs complete]                │
    │        │                              │
    │        ▼                              │
    └──▶ Phase 8: US6 (iOS)                │
                                            │
         Phase 9 (Polish) ◄─────────────────┘
                │
                ▼
         Phase 10 (Ship Readiness)
```

### Within Each User Story

1. Server-side (tRPC routers + services) before client-side (pages + components)
2. Core CRUD before integration logic
3. UI before accessibility refinements
4. Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**: T003, T004, T005, T006 (all packages) can run in parallel. T008, T009, T010, T011, T106, T107 can run in parallel.

**Phase 2**: T014, T015, T016, T108, T109 can run in parallel. T021, T024, T025, T027, T028, T029, T030, T031 can run in parallel (all different packages/files).

**Phase 3 (US1)**: T032, T033 can run in parallel (different files).

**Phase 4 (US2)**: T049 can run in parallel with server-side tasks.

**Phase 6 (US4)**: T062 can start while server mutations are being built.

**Phase 7 (US5)**: T074 can start while server mutations are being built.

**Phase 8 (US6)**: T078 can start while other iOS views are being built.

**Phase 9**: T094–T099, T101, T103, T104, T110–T114 can all run in parallel (different files).

**Phase 10**: T115–T123 can all run in parallel (different files/domains).

---

## Parallel Execution Example: Phase 2

```
# Batch 1 — All independent package/file tasks:
T014: shared-types/src/ (types)
T015: apps/web/src/lib/auth.ts (BetterAuth)
T016: apps/web/src/app/api/auth/[...all]/route.ts
T021: packages/letterboxd-scraper/src/robots.ts
T024: packages/matching-engine/src/overlap.ts
T025: packages/matching-engine/src/genre-similarity.ts
T027: packages/ui/src/ (all primitives)
T028: apps/web/src/app/layout.tsx
T029: apps/ios/Reels/Core/Networking/APIClient.swift
T030: apps/ios/Reels/Core/Networking/KeychainManager.swift
T031: apps/ios/Reels/Core/Models/
T108: apps/web/src/lib/email.ts (Resend email transport)
T109: apps/web/src/server/services/storage.ts (Supabase Storage)

# Batch 2 — Sequential tasks depending on Batch 1:
T017: apps/web/src/server/trpc.ts (depends on T015)
T022: packages/letterboxd-scraper/src/scraper.ts (depends on T021)
T023: packages/letterboxd-scraper/src/normalizer.ts
T026: packages/matching-engine/src/score.ts (depends on T024, T025)

# Batch 3:
T018: apps/web/src/server/routers/_app.ts (depends on T017)
T019: apps/web/src/app/api/trpc/[trpc]/route.ts (depends on T017)
T020: apps/web/src/lib/trpc.ts (depends on T017)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Sign Up & Onboarding)
4. **STOP and VALIDATE**: Test end-to-end onboarding flow
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Sign Up & Onboarding) → Test → Deploy (MVP!)
3. US2 (Discover) → Test → Deploy
4. US3 (Match) → Test → Deploy
5. US4 (Profile) + US5 (Safety) → Test → Deploy (can parallel)
6. US6 (iOS) → Test → Submit to App Store
7. Polish → Final QA
8. Ship Readiness → Deploy staging → TestFlight → Production promote → App Store submit

### Suggested MVP Scope

**Minimum shippable product**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US3) = a web app where users can sign up, import watchlists, discover matches, and receive mutual matches. This covers all three P1 stories.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [US#] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Foundational phase
- Stop at any checkpoint to validate the story independently
- All user-facing text must be extractable (no hard-coded strings) — verify per FR-009
- All images must have meaningful alt text — verify per FR-031
- All interactive elements must be keyboard accessible — verify per FR-029
- Total tasks: 125 (T001–T109 original + T110–T125 added in revision 3: logging, monitoring, CSP, analytics, migrations, legal, deployment, GDPR export, App Store prep)

---

## Commit & Push Strategy

All commits MUST follow Conventional Commits format (enforced by commitlint + Husky).

### Commit cadence

- **One commit per task or logical group** — do not batch unrelated changes
- **Push after each phase checkpoint** — ensures remote is always up to date
- **Push after each user story completion** — enables independent review

### Commit message conventions

| Scope | Prefix | Example |
|-------|--------|---------|
| Setup / infrastructure | `chore:` | `chore: initialize turborepo with pnpm workspaces` |
| Database schema | `feat(db):` | `feat(db): define prisma schema with nullable onboarding fields` |
| tRPC routers | `feat(api):` | `feat(api): implement discover.getFeed with daily allocation` |
| UI components | `feat(ui):` | `feat(ui): build discover card with shared films and a11y` |
| Pages / views | `feat(web):` | `feat(web): implement onboarding privacy consent gate` |
| iOS | `feat(ios):` | `feat(ios): implement apple sign-in flow` |
| Bug fixes | `fix:` | `fix: handle letterboxd 404 for private profiles` |
| Documentation | `docs:` | `docs: add contributing guide with branch protection` |
| Tests | `test:` | `test: add axe-core accessibility tests for onboarding` |
| CI / tooling | `ci:` | `ci: configure github actions with typecheck and audit` |
| Refactoring | `refactor:` | `refactor: extract match score computation to service` |

### Push schedule

```
Phase 1 complete  → git push (branch: 001-reels-platform-mvp)
Phase 2 complete  → git push
Phase 3 complete  → git push (MVP checkpoint — tag: v0.1.0-alpha)
Phase 4 complete  → git push
Phase 5 complete  → git push (P1 stories complete — tag: v0.1.0-beta)
Phase 6 complete  → git push
Phase 7 complete  → git push
Phase 8 complete  → git push
Phase 9 complete  → git push (release candidate — tag: v0.1.0-rc.1)
```

### Documentation checkpoints

After each phase, ensure:
1. `quickstart.md` remains accurate (update if new env vars or steps added)
2. `README.md` reflects current project state
3. Any new env vars are documented in `.env.example`
4. Phase checkpoint in tasks.md is verified before moving on
