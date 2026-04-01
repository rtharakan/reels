# Tasks: Product Launch Readiness Overhaul

**Input**: Design documents from `/specs/002-launch-readiness-overhaul/`  
**Branch strategy**: Feature work on `002-launch-readiness-overhaul` → merge to `main` (web), `ios` (iOS), `android` (Android)  
**Platform targets**: Web (Next.js 14, deploys from `main`), iOS (SwiftUI, deploys from `ios`), Android (Kotlin/Compose, deploys from `android`)  
**All branches must be in sync**: identical features, pages, icons, titles, and translations

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (operates on different files, no dependency on incomplete tasks)
- **[Story]**: User story label — [US1]=Picker, [US2]=Navigation, [US3]=MoodReels, [US4]=Localization, [US5]=QA/Deploy
- File paths are relative to the repository root

---

## Phase 1: Setup (Branch Strategy & CI/CD)

**Purpose**: Establish the three-branch deployment model, verify that the baseline project builds and tests pass, and configure CI pipelines before any feature work begins.

- [ ] T001 Create `ios` branch from current `main` branch: `git checkout main && git pull && git checkout -b ios && git push -u origin ios`
- [ ] T002 Create `android` branch from current `main` branch: `git checkout main && git checkout -b android && git push -u origin android`; then return to `002-launch-readiness-overhaul` for all web implementation
- [ ] T003 [P] Verify web app builds cleanly: run `pnpm build` from repo root and resolve any pre-existing type errors or build failures before adding new features
- [ ] T004 [P] Verify existing test suite passes: run `pnpm test` from repo root and confirm all tests pass; document any pre-existing failures to distinguish from regressions
- [ ] T005 [P] Run `pnpm audit --audit-level=high` from repo root and fix all critical/high severity vulnerabilities across all `package.json` files before new code is added
- [ ] T006 Create `.github/workflows/ci.yml` for web CI pipeline: triggers on push to `main` and `002-launch-readiness-overhaul`; steps: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

**Git checkpoint**: `git add -A && git commit -m "chore: branch setup and CI pipeline" && git push origin 002-launch-readiness-overhaul`

---

## Phase 2: Foundational (Blocking Prerequisites — Web)

**Purpose**: Core web infrastructure that must be complete before any feature pages or routes can be built. Blocks all user story phases.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete on `002-launch-readiness-overhaul`.

### Prisma Schema (T007–T016)

- [ ] T007 Add new Prisma enums to `apps/web/prisma/schema.prisma`: `PickerPathway { FILM_FIRST FULLY_SPECIFIED }`, `PickerPlanStatus { VOTING CONFIRMED EXPIRED ARCHIVED }`, `VoteStatus { AVAILABLE UNAVAILABLE MAYBE }`, `MoodType { NOSTALGIC ADVENTUROUS HEARTBROKEN HYPE CHILL ROMANTIC MYSTERIOUS INSPIRED MELANCHOLIC COZY }` per data-model.md
- [ ] T008 Add `PickerPlan` model to `apps/web/prisma/schema.prisma` with all fields (`id`, `organizerId`, `filmTitle`, `filmTmdbId`, `filmPosterPath`, `filmYear`, `pathway`, `city`, `cinema`, `targetDate`, `status`, `confirmedShowtimeId`, `createdAt`, `expiresAt`), relations (`organizer`, `showtimes`, `participants`, `confirmedShowtime`), and indexes `[organizerId]`, `[status]`, `[expiresAt]`, `[status, expiresAt]` per data-model.md
- [ ] T009 [P] Add `PickerShowtime` model to `apps/web/prisma/schema.prisma` with all fields, relations to `PickerPlan` and `PickerVote[]`, and indexes `[planId]`, `[planId, date]` per data-model.md
- [ ] T010 [P] Add `PickerVote` model to `apps/web/prisma/schema.prisma` with unique constraint `@@unique([participantId, showtimeId])`, indexes `[participantId]`, `[showtimeId]`, `[showtimeId, status]` per data-model.md
- [ ] T011 [P] Add `PickerParticipant` model to `apps/web/prisma/schema.prisma` with unique constraint `@@unique([planId, userId])` (filtered: where userId is not null), indexes `[planId]`, `[userId]`, `[sessionToken]` per data-model.md
- [ ] T012 [P] Add `UserMood` model to `apps/web/prisma/schema.prisma` with indexes `[userId, isActive]`, `[mood, isActive]`, `[userId, selectedAt]` per data-model.md
- [ ] T013 [P] Add `MoodFilmSuggestion` model to `apps/web/prisma/schema.prisma` with indexes `[userId, mood]`, `[filmId]`, `[userId, createdAt]` per data-model.md
- [ ] T014 [P] Add `MoodFilmTag` model to `apps/web/prisma/schema.prisma` with unique constraint `@@unique([filmId, mood, taggedById])`, indexes `[filmId, mood]`, `[mood]`, `[taggedById]` per data-model.md
- [ ] T015 Add new relations to existing `User` model in `apps/web/prisma/schema.prisma`: `pickerPlans PickerPlan[]`, `pickerParticipations PickerParticipant[]`, `moods UserMood[]`, `moodSuggestions MoodFilmSuggestion[]`, `moodTags MoodFilmTag[]`; add to `Film` model: `moodSuggestions MoodFilmSuggestion[]`, `moodTags MoodFilmTag[]` per data-model.md Modified Entities section
- [ ] T016 From `apps/web/` run `pnpm db:generate` then `pnpm db:migrate --name 002_launch_readiness_overhaul` to apply the new schema to the database; verify migration file is created in `apps/web/prisma/migrations/`

### Shared Types (T017–T019)

- [ ] T017 [P] Create `packages/shared-types/src/picker.ts` exporting TypeScript types: `PickerPathway`, `PickerPlanStatus`, `VoteStatus`, `PickerPlan`, `PickerShowtime`, `PickerVote`, `PickerParticipant` — types mirror the Prisma model shapes from data-model.md (use string literals for enum values, not Prisma enums, to keep types platform-agnostic)
- [ ] T018 [P] Create `packages/shared-types/src/mood.ts` exporting TypeScript types: `MoodType`, `UserMood`, `MoodFilmSuggestion`, `MoodFilmTag` — types mirror Prisma model shapes from data-model.md
- [ ] T019 Update `packages/shared-types/src/index.ts` to add `export * from './picker'` and `export * from './mood'`

### i18n System (T020–T022)

- [ ] T020 Add `[i18n-missing]` server-side logging to the i18n accessor in `apps/web/src/lib/i18n/` — wrap the key lookup so that when a key resolves to `undefined`, it calls `console.error('[i18n-missing] key=', keyPath)` and falls back to the English value; see research.md Research Task 5 for implementation details
- [ ] T021 Add all new i18n keys for namespaces `picker`, `mood`, and `nav` with English values to `apps/web/src/lib/i18n/en.ts`; include: all Picker UI strings (create plan, vote, confirm, share, pathways, film search, showtime grid, summary card, guest join, my plans, expired/confirmed states), all Mood Reels strings (mood selector labels for all 10 moods, suggestions, match explanations, Mood Twins, beta badge, mood history), and updated nav labels (Match, Film Twins, Cinema Week, Buddy, Picker, Mood Reels)
- [ ] T022 Add all new i18n keys to `apps/web/src/lib/i18n/nl.ts` with Dutch translations: feature names per spec (Match, Film Tweelingen, Bioscoop Week, Buddy, Picker, Mood Reels), full Picker UI in Dutch, full Mood Reels UI in Dutch, all mood names and descriptions in Dutch, error messages and notifications in Dutch — every key in T021's English set must have a Dutch counterpart

### Navigation Component (T023–T025)

- [ ] T023 Create unified `NavHeader` React client component in `apps/web/src/components/nav-header.tsx`; component accepts `isAuthenticated: boolean` prop; renders: (1) logo, (2) feature nav links with lucide-react icons per spec table — Heart icon + "Match" for `/explore`, Radar icon + "Film Twins" for `/scan`, Calendar icon + "Cinema Week" for `/plan`, Popcorn icon + "Buddy" for `/buddy`, Ticket icon + "Picker" for `/picker`, Sparkles icon + "Mood Reels" for `/mood`, (3) overflow dropdown overlay: `position: fixed`, `top: header-height`, `max-height: 80vh`, `overflow-y: auto`, `z-index: 50`, closes on outside click or ESC, (4) language toggle button (en/nl), (5) auth actions (Sign In / avatar + menu for authenticated users); mobile viewport < 768px: hide nav links, show hamburger icon that opens a slide-in overlay with 44×44pt touch targets and dismiss on outside tap; respect `prefers-reduced-motion`; fully accessible (ARIA roles, keyboard nav)
- [ ] T024 Update `apps/web/src/app/(main)/layout.tsx` to import and render `<NavHeader isAuthenticated={true} />` in place of any existing header markup, removing duplicated nav code
- [ ] T025 Update `apps/web/src/components/public-header.tsx` to render `<NavHeader isAuthenticated={false} />`, removing its existing standalone implementation; ensure public routes continue to show appropriate nav items

**Git checkpoint**: `git add -A && git commit -m "feat: foundational schema migration, shared types, i18n system, and NavHeader component" && git push origin 002-launch-readiness-overhaul`

**Checkpoint**: Foundation complete — all user story phases can now begin.

---

## Phase 3: US2 — Navigation Consistency (Priority: P1)

**Goal**: Every page in the product renders the same `NavHeader` with correct icons, titles, responsive dropdown overlay behaviour, and mobile menu. No page has a different header.

**Independent Test**: Visit every route on desktop (1280px) and mobile (375px) — header is identical on all routes, dropdown opens as fixed overlay without shifting content, mobile menu opens/scrolls/dismisses, language toggle updates all text without page reload.

- [ ] T026 [US2] Audit all page route files in `apps/web/src/app/` and confirm each uses `NavHeader` (authenticated pages via `(main)/layout.tsx`, public pages via `public-header.tsx`) — for any page with its own inline header, remove it and ensure the layout provides the header
- [ ] T027 [US2] Update all public page routes (`apps/web/src/app/about/`, `apps/web/src/app/help/`, `apps/web/src/app/privacy/`, `apps/web/src/app/terms/`) to render inside a layout that includes `<NavHeader isAuthenticated={false} />`; remove any per-page headers
- [ ] T028 [P] [US2] Update any remaining authenticated pages in `apps/web/src/app/(main)/` (`explore`, `scan`, `buddy`, `plan`, `profile`, `settings`, `matches`) that have inline header markup — ensure they rely solely on `(main)/layout.tsx` for the header; no duplicate headers
- [ ] T029 [US2] Implement mobile nav menu behaviour in `apps/web/src/components/nav-header.tsx` — hamburger button visible below 768px triggers slide-in overlay, all nav links visible and scrollable inside overlay, outside-tap and ESC dismissal, ARIA `aria-expanded` and `aria-controls` attributes, focus trap while open
- [ ] T030 [US2] Test dropdown overlay in `apps/web/src/components/nav-header.tsx` — verify `position: fixed` anchors to header top on scroll, `max-height: 80vh` enforced, internal `overflow-y: auto` with visible scrollbar when items overflow, `z-index: 50` above all page content; add/fix CSS if any of these behaviours are wrong
- [ ] T031 [US2] Implement language toggle in `NavHeader` — toggles between `en` and `nl` values in i18n context/state, all visible text updates immediately without page reload, active language highlighted in the toggle button; test by switching language with a form visible and verifying form values are preserved
- [ ] T032 [US2] Verify all feature icons in `apps/web/src/components/nav-header.tsx` exactly match the spec naming table: Heart=Match/Explore, Radar=Film Twins/Scan, Calendar=Cinema Week/Plan, Popcorn=Buddy, Ticket=Picker, Sparkles=Mood Reels; replace any incorrect or placeholder icons with the correct lucide-react imports
- [ ] T033 [US2] Run `pnpm lint && pnpm typecheck` from repo root — fix all TypeScript and ESLint errors in newly touched navigation files; confirm zero errors

**Git checkpoint**: `git add -A && git commit -m "feat(us2): unified NavHeader on all pages — responsive dropdown, mobile menu, language toggle" && git push origin 002-launch-readiness-overhaul`

---

## Phase 4: US1 — Group Cinema Trip Planning via Picker (Priority: P1) 🎯 MVP

**Goal**: Users can create a Picker cinema plan via two pathways, share a voting link, participants vote on showtimes, and the organizer confirms. Guests participate with display name + session cookie only. Auto-population from Filmladder.nl with manual fallback.

**Independent Test**: Open `/picker`, choose "Pick a Film", search for a film, select showtimes, create plan, copy share URL, open in incognito, join as guest "Alice", vote on showtimes, switch back to organizer, confirm a showtime — plan summary card appears. Repeat with Pathway B.

### Server Layer (T034–T044)

- [ ] T034 [US1] Create `apps/web/src/server/routers/picker.ts` — file skeleton with tRPC `router({...})` export containing stubs for all required procedures: `create`, `get`, `join`, `vote`, `confirm`, `searchFilms`, `getShowtimes`, `myPlans`; import Zod, Prisma client, and `protectedProcedure`/`publicProcedure` from existing tRPC setup
- [ ] T035 [US1] Implement `picker.searchFilms` in `apps/web/src/server/routers/picker.ts` — `publicProcedure.query`, input `{ query: z.string().min(1).max(200) }`, fetch from TMDB `/3/search/movie?query=...&api_key=${process.env.TMDB_API_KEY}`, return `results: Array<{ tmdbId, title, year, posterPath, overview }>` (top 10 results); add 10-minute in-memory cache by query string to avoid TMDB rate limits
- [ ] T036 [US1] Implement `picker.getShowtimes` in `apps/web/src/server/routers/picker.ts` — `publicProcedure.query`, input `{ filmTitle, city?, cinema?, date? }`, reuse `apps/web/src/server/services/explore-screenings.ts` filtering by the provided parameters, return `{ showtimes: Array<{ cinemaName, cinemaCity, date, time, ticketUrl }>, source: 'filmladder' | 'manual' }`; source is `'filmladder'` when scraper returns results, `'manual'` (empty array) when no results found
- [ ] T037 [US1] Implement `picker.create` in `apps/web/src/server/routers/picker.ts` — `protectedProcedure.mutation`, full Zod input schema per `contracts/trpc-routers.md`, create `PickerPlan` with `expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)`, create all `PickerShowtime` records, create organizer `PickerParticipant` with `isOrganizer: true`, return `{ planId, shareUrl: \`${process.env.NEXT_PUBLIC_BASE_URL}/picker/\${planId}\`, expiresAt }`; apply rate limit 5 plans/minute/user using a simple in-memory counter per userId (or the existing rate-limit middleware)
- [ ] T038 [US1] Implement `picker.join` in `apps/web/src/server/routers/picker.ts` — `publicProcedure.mutation`, input `{ planId, displayName, guestSessionToken? }`, validate plan exists and is not EXPIRED/ARCHIVED, for authenticated users upsert on `[planId, userId]`, for guests create `PickerParticipant` with `sessionToken = cuid()`, return `{ participantId, sessionToken }`; sanitize `displayName` to alphanumeric + spaces + basic punctuation, max 50 chars
- [ ] T039 [US1] Implement `picker.vote` in `apps/web/src/server/routers/picker.ts` — `publicProcedure.mutation`, input `{ participantId, votes: Array<{ showtimeId, status }> }`, validate plan is in `VOTING` status, validate `participantId` belongs to the plan (cross-check plan ownership), upsert each `PickerVote` on `[participantId, showtimeId]`; return `{ success: true, updatedCount }`; apply rate limit 30 votes/minute/session
- [ ] T040 [US1] Implement `picker.confirm` in `apps/web/src/server/routers/picker.ts` — `protectedProcedure.mutation`, input `{ planId, showtimeId }`, verify `ctx.session.userId === plan.organizerId` (return 403 otherwise), update `PickerPlan.status = 'CONFIRMED'` and set `confirmedShowtimeId`, trigger notification to all `PickerParticipant` records with `userId` using the existing notification service; return `{ success: true, confirmedShowtime }`
- [ ] T041 [US1] Implement `picker.get` in `apps/web/src/server/routers/picker.ts` — `publicProcedure.query`, input `{ planId: z.string().cuid() }`, return full plan shape per `contracts/trpc-routers.md` including showtimes with per-showtime vote tallies (`voteCount: { available, unavailable, maybe }`), participants list, confirmed showtime, and `currentParticipantId` (determined by matching `ctx.session?.userId` or request cookie `reels-picker-guest` session token against `PickerParticipant` records)
- [ ] T042 [US1] Implement `picker.myPlans` in `apps/web/src/server/routers/picker.ts` — `protectedProcedure.query`, find all `PickerPlan` records where `organizerId = userId` OR a `PickerParticipant` exists with `userId = currentUser.id`, return array of plan summaries per `contracts/trpc-routers.md`
- [ ] T043 [US1] Register `pickerRouter` in `apps/web/src/server/routers/_app.ts` — add `import { pickerRouter } from './picker'` and `picker: pickerRouter` to the app router object per `contracts/trpc-routers.md` Updated App Router section
- [ ] T044 [US1] Create `apps/web/src/server/services/picker-cleanup.ts` with `cleanupExpiredPlans()` function: find `PickerPlan` records where `status = 'VOTING' AND expiresAt < new Date()`, delete guest `PickerParticipant` records (`userId IS NULL`) and their `PickerVote` records, set `status = 'ARCHIVED'`; create `apps/web/src/app/api/cron/picker-cleanup/route.ts` as a `GET` handler secured by `Authorization: Bearer ${process.env.CRON_SECRET}` that calls `cleanupExpiredPlans()`

### UI Layer (T045–T054)

- [ ] T045 [P] [US1] Create `apps/web/src/app/(main)/picker/page.tsx` — Picker landing page with two-pathway selection: "Pick a Film" card (film search → showtime selection flow) and "I Know What I Want" card (date + film + cinema → filtered showtimes flow); show "My Plans" section below for authenticated users using `picker.myPlans` with status badges; fully responsive; i18n strings from `picker` namespace
- [ ] T046 [US1] Create `apps/web/src/components/picker/film-search.tsx` — film search input with 300ms debounce calling `picker.searchFilms` via tRPC, renders results as cards with Next.js `<Image>` poster (TMDB poster URL), title, year, and brief overview; keyboard navigable (arrow keys select, Enter confirms); loading skeleton while fetching; empty state for no results; WCAG 2.1 AA (ARIA listbox role)
- [ ] T047 [US1] Create `apps/web/src/components/picker/showtime-selector.tsx` — displays `picker.getShowtimes` results grouped by cinema then date, each showtime as a selectable row (checkbox); shows "No showtimes found — enter manually" fallback with an add-showtime form (cinemaName, cinemaCity, date, time, ticketUrl) that appends manual entries to the selection; organizer submits selected+manual showtimes to create the plan
- [ ] T048 [US1] Create `apps/web/src/components/picker/voting-grid.tsx` — table with showtimes as rows (cinemaName + date + time) and participant names as column headers; each cell has a three-way toggle: Available (✓ green) / Unavailable (✗ red) / Maybe (? amber); shows vote tally per row as coloured pips; calls `picker.vote` on cell change; disabled when plan is CONFIRMED or EXPIRED; ARIA `role="grid"`, keyboard navigable (arrow keys + space to toggle); mobile: rows collapse into card view
- [ ] T049 [US1] Create `apps/web/src/components/picker/plan-summary-card.tsx` — card displayed when plan status is CONFIRMED: film poster, title, year, confirmed cinema name and city, confirmed date and time, ticket URL link (if present), participant list as avatars, share button that copies plan URL to clipboard; i18n strings from `picker` namespace
- [ ] T050 [US1] Create `apps/web/src/app/(main)/picker/[planId]/page.tsx` — plan detail page; server-fetches plan via `picker.get` using `planId` param; renders: (1) if plan is EXPIRED/ARCHIVED: expiry message + "Create New Plan" CTA, (2) if viewer is not yet a participant: `GuestJoinForm` + film/showtime overview, (3) if participant and plan is VOTING: film header + `VotingGrid` + organizer-only "Confirm" button, (4) if plan is CONFIRMED: `PlanSummaryCard`; page is public (no auth wall) per FR-004
- [ ] T051 [US1] Create `apps/web/src/components/picker/guest-join-form.tsx` — form with display name `<input>` (max 50 chars, sanitized label) and "Join Plan" submit button; on submit calls `picker.join` mutation, on success stores returned `sessionToken` in cookie `reels-picker-guest` (js-cookie or Set-Cookie header, 7-day expiry, sameSite=lax); on re-visit reads existing cookie and auto-recognises guest participant by matching `guestSessionToken`
- [ ] T052 [US1] Wire the multi-step Picker creation flow in `apps/web/src/app/(main)/picker/page.tsx` using React state: Pathway A steps: (1) film search → (2) showtime selection → (3) plan created + share URL displayed; Pathway B steps: (1) date/film/cinema inputs → (2) filtered showtimes → (3) plan created + share URL; handle loading, error, and success states for each step; after plan creation navigate to `/picker/[planId]`
- [ ] T053 [US1] Add Picker to the `NavHeader` feature link list in `apps/web/src/components/nav-header.tsx` if not already present — Ticket icon, label from `nav.picker` i18n key (en: "Picker", nl: "Picker"), href `/picker`, active highlight when on `/picker` routes
- [ ] T054 [US1] Add `loading.tsx` skeleton file at `apps/web/src/app/(main)/picker/loading.tsx` and `apps/web/src/app/(main)/picker/[planId]/loading.tsx` — skeleton cards for the plan creation form and voting grid while server data loads

**Git checkpoint**: `git add -A && git commit -m "feat(us1): Picker cinema planning — tRPC router, film search, showtime voting grid, guest join, plan confirmation" && git push origin 002-launch-readiness-overhaul`

---

## Phase 5: US3 — Mood Reels Easter Egg (Priority: P1)

**Goal**: Users select from 10 moods, receive 5–10 personalised film suggestions (community tags + optional AI layer) within 3 seconds, and see Mood Twins — other users in the same mood. Feature is prominently labelled "Beta — Easter Egg".

**Independent Test**: Navigate to `/mood`, select "CHILL", verify 5–10 film suggestions appear with mood-match explanations and match-strength indicators within 3 seconds, scroll down to see Mood Twins section with correct empty state or populated results, verify "Beta — Easter Egg" badge is visible.

### Server Layer (T055–T062)

- [ ] T055 [US3] Create `apps/web/src/server/services/mood-engine.ts` — implement `getMoodSuggestions(userId: string, mood: MoodType): Promise<MoodFilmSuggestion[]>`: (1) Community layer: query `MoodFilmTag` grouped by `filmId` WHERE `mood = X`, join with user's watchlist and liked genres to compute taste overlap score, rank by `tagCount × tasteOverlap`, take top 10; (2) AI layer: only if `process.env.MONGODB_ATLAS_URI` is set — use pre-defined mood embedding vectors (hard-coded 1024-dim normalized float arrays per mood, derived from Voyage-4-nano offline) to query MongoDB Atlas Vector Search (`$vectorSearch` on `plotEmbedding` field), merge results with community layer, deduplicate by filmId; (3) For each suggestion create a `MoodFilmSuggestion` record with `matchExplanation` (template: "This film matches your [mood] vibe because [reason]") and `matchStrength` (0.0–1.0); wrap total execution in `Promise.race([logic, timeout(3000)])` — timeout returns community layer only
- [ ] T056 [US3] Add `getMoodTwins(userId: string, mood: MoodType)` function to `apps/web/src/server/services/mood-engine.ts` — query `UserMood` WHERE `mood = X AND isActive = true AND userId != currentUser`, join with the matching-engine's existing watchlist overlap logic to compute `sharedFilmCount`, return top 10 users as `Array<{ userId, displayName, image, sharedFilmCount, mood }>`; users who have blocked or been blocked by `userId` are excluded via existing safety checks
- [ ] T057 [US3] Create `apps/web/src/server/routers/mood.ts` — file skeleton with `router({...})` export containing stubs for all procedures: `setMood`, `getSuggestions`, `getHistory`, `tagFilm`, `expressInterest`; import mood-engine service, Zod, Prisma, `onboardedProcedure`
- [ ] T058 [US3] Implement `mood.setMood` in `apps/web/src/server/routers/mood.ts` — `onboardedProcedure.mutation`, input `{ mood: MoodTypeEnum }`, set previous active `UserMood.isActive = false` in a Prisma transaction, insert new `UserMood` with `isActive: true`, call `getMoodSuggestions` and `getMoodTwins`, return `{ moodId, suggestions, moodTwins }` per `contracts/trpc-routers.md`; apply rate limit 10 changes/minute/user
- [ ] T059 [US3] Implement `mood.getSuggestions` in `apps/web/src/server/routers/mood.ts` — `onboardedProcedure.query`, no input (uses current active mood), find user's active `UserMood`, call `getMoodSuggestions` + `getMoodTwins`, return same shape as `setMood`; return empty arrays gracefully if no active mood
- [ ] T060 [US3] Implement `mood.getHistory` in `apps/web/src/server/routers/mood.ts` — `onboardedProcedure.query`, no input, return all `UserMood` records for user ordered by `selectedAt` desc plus `currentMood` field per `contracts/trpc-routers.md`
- [ ] T061 [US3] Implement `mood.tagFilm` in `apps/web/src/server/routers/mood.ts` — `onboardedProcedure.mutation`, input `{ filmId, mood }`, upsert `MoodFilmTag` on `[filmId, mood, taggedById]`, return `{ success: true, tagId }`; implement `mood.expressInterest` by delegating to the existing `discover.expressInterest` logic (re-export or call the underlying service function), return same match status response
- [ ] T062 [US3] Register `moodRouter` in `apps/web/src/server/routers/_app.ts` — add `import { moodRouter } from './mood'` and `mood: moodRouter`; also add seed data for community mood tags in `apps/web/prisma/seed.ts` — create `MoodFilmTag` entries for ~20 well-known films (5 per mood for the 10 most common moods) to bootstrap the community recommendation layer for day-one launch

### UI Layer (T063–T070)

- [ ] T063 [P] [US3] Create `apps/web/src/app/(main)/mood/page.tsx` — Mood Reels landing page; renders in order: (1) "Beta — Easter Egg" badge (amber label, prominent at top), (2) `MoodSelector` grid, (3) on mood selected: `FilmSuggestionCards` list, (4) `MoodTwinsSection`; if user has an active mood, pre-select it and show existing suggestions; if returning user, show "Your mood history" link to `/mood/history`; page protected by `onboarded` session check; all text from `mood` i18n namespace
- [ ] T064 [US3] Create `apps/web/src/components/mood/mood-selector.tsx` — visual grid of 10 mood options; each cell: unique background colour (amber/green/rose/orange/blue/pink/purple/gold/slate/brown per data-model.md), emoji icon, mood name from i18n; selected mood has ring highlight; hover/focus states; 44×44pt minimum touch target; `prefers-reduced-motion` toggles the entrance animation; keyboard navigable (arrow keys + Enter); WCAG 2.1 AA contrast on all colour/text combinations; triggers `mood.setMood` mutation on selection
- [ ] T065 [US3] Create `apps/web/src/components/mood/film-suggestion-card.tsx` — card displaying: Next.js `<Image>` film poster, title, year, `matchExplanation` text, `matchStrength` as a horizontal filled bar (0.0–1.0 maps to 0–100% fill), `source` badge ("community" or "ai beta"); loading skeleton variant; accessible (alt text on poster, ARIA label on strength bar)
- [ ] T066 [US3] Create `apps/web/src/components/mood/mood-twins-section.tsx` — "Mood Twins" section header, grid of user avatar cards (avatar image or initials fallback, displayName, "X films in common" caption, "Connect" button that calls `mood.expressInterest`); empty state message from i18n: "You're the first one in this mood today — check back later"; clicking "Connect" follows existing Discover interest/match confirmation flow
- [ ] T067 [US3] Create `apps/web/src/components/mood/mood-history.tsx` — timeline list of `mood.getHistory` results; each row: mood colour dot, mood name, formatted date; "Currently active" badge on most recent item; "Update mood" button links back to mood selector; used on `/mood/history` page
- [ ] T068 [US3] Wire `mood.setMood` mutation in `apps/web/src/app/(main)/mood/page.tsx` — on mood cell click: show loading skeleton on suggestions area, call `setMood`, on success render returned suggestions and moodTwins; handle timeout (>3s): show toast "AI matching is taking longer — showing community suggestions" and render community-only results; handle error state with retry button
- [ ] T069 [US3] Add "What's your vibe today?" dashboard prompt in `apps/web/src/app/(main)/page.tsx` (or the authenticated dashboard layout) — subtle CTA card shown when the current user has no active mood today (check `UserMood.isActive`); card contains mood icon, prompt text from i18n, and "Set your mood" link to `/mood`; hidden once mood is set for the day
- [ ] T070 [US3] Add Mood Reels to `NavHeader` in `apps/web/src/components/nav-header.tsx` if not already included — Sparkles icon, label from `nav.mood` i18n key (en: "Mood Reels", nl: "Mood Reels"), href `/mood`, active highlight on `/mood` routes; create `apps/web/src/app/(main)/mood/loading.tsx` skeleton for the mood page

**Git checkpoint**: `git add -A && git commit -m "feat(us3): Mood Reels Easter Egg — mood engine, community+AI suggestions, Mood Twins, mood history" && git push origin 002-launch-readiness-overhaul`

---

## Phase 6: US4 — Dutch Localization & Feature Icon/Naming Consistency (Priority: P1)

**Goal**: 100% of user-facing text in English and Dutch with no fallback-to-English occurrences on shipped pages. All feature icons and titles consistent per spec table across web, iOS, and Android.

**Independent Test**: Switch language to Dutch on web — navigate every page and verify zero English strings appear. On iOS simulator and Android emulator, check every nav item icon and title matches the spec table.

- [ ] T071 [US4] Run TypeScript compile (`pnpm typecheck`) after all previous tasks — fix any i18n type errors where a UI component references a missing key in `en.ts` or `nl.ts`; identify any remaining UI strings hardcoded in English (not going through the i18n function) in `apps/web/src/` and move them to `en.ts`/`nl.ts`
- [ ] T072 [US4] Audit every key in `apps/web/src/lib/i18n/en.ts` against `apps/web/src/lib/i18n/nl.ts` — every English key must have a corresponding Dutch translation; add missing Dutch translations paying particular attention to: error messages, form validation messages, notification copy, onboarding steps, Settings page, Buddy feature, Scan/Film Twins result page, and all edge-case empty states
- [ ] T073 [US4] Update all feature name references in `apps/web/src/` that hardcode old names — ensure navigation labels, `<title>` tags, `<h1>` headings, and `aria-label` attributes use i18n keys that resolve to: "Match" (Explore), "Film Twins" (Scan), "Cinema Week" (Plan), "Buddy", "Picker", "Mood Reels" in English and their Dutch equivalents; do not rename route paths (keep `/explore`, `/scan`, `/plan`)
- [ ] T074 [P] [US4] Update iOS localisation files: add all new Picker, Mood Reels, and updated nav-label translation keys to `apps/ios/Reels/Core/Localization/en.lproj/Localizable.strings` and `apps/ios/Reels/Core/Localization/nl.lproj/Localizable.strings`; follow existing key naming convention (e.g., `feature.picker.createPlan`, `feature.mood.selectMood`); ensure Dutch strings match `nl.ts` values
- [ ] T075 [P] [US4] Update Android localisation files: add all new Picker, Mood Reels, and updated nav-label strings to `apps/android/app/src/main/res/values/strings.xml` (English) and create/update `apps/android/app/src/main/res/values-nl/strings.xml` (Dutch); ensure all strings match the spec naming table and Dutch values match `nl.ts`
- [ ] T076 [US4] Verify language toggle in `apps/web/src/components/nav-header.tsx` updates all visible text immediately — test by: (1) loading any page in English, (2) filling in a form field, (3) clicking the language toggle to Dutch, (4) verifying all labels/buttons/headings changed to Dutch and the form field value is unchanged; fix any text that doesn't update
- [ ] T077 [US4] Final icon verification sweep in `apps/web/src/components/nav-header.tsx` — visually confirm each nav item uses the exact icon from the spec table: `Heart` for Match, `Radar` for Film Twins, `Calendar` for Cinema Week, `Popcorn` for Buddy, `Ticket` for Picker, `Sparkles` for Mood Reels (all from `lucide-react`); replace any incorrect icons
- [ ] T078 [US4] Update `apps/ios/Reels/App/AppNavigation.swift` and tab bar — set SF Symbols icons per spec table: `heart.fill` for Match, `dot.radiowaves.left.and.right` for Film Twins, `calendar` for Cinema Week, `popcorn.fill` for Buddy, `ticket.fill` for Picker, `sparkles` for Mood Reels; set title strings from `Localizable.strings` keys; ensure tab bar shows correct titles in both en and nl
- [ ] T079 [US4] Update Android bottom navigation composable — set Material Icons per spec table: `Icons.Filled.Favorite` for Match, `Icons.Filled.RadioButtonChecked` (or best available Radar equivalent) for Film Twins, `Icons.Filled.CalendarMonth` for Cinema Week, `Icons.Filled.LocalBar` for Buddy, `Icons.Filled.ConfirmationNumber` for Picker, `Icons.Filled.AutoAwesome` for Mood Reels; set label strings from `strings.xml` resources

**Git checkpoint (web)**: `git add -A && git commit -m "feat(us4): 100% Dutch localization, feature icon/naming consistency across web" && git push origin 002-launch-readiness-overhaul`

---

## Phase 7: US5 — iOS Native Port (Priority: P1)

**Purpose**: Mirror all web features (Picker, Mood Reels, navigation, localization) in SwiftUI on the `ios` branch. iOS app must have feature parity with the web app.

**Note**: Switch to `ios` branch for T080–T092. Merge feature branch before starting.

- [ ] T080 [US5] Switch to `ios` branch and merge latest web changes: `git checkout ios && git merge 002-launch-readiness-overhaul --no-ff -m "merge: web features for iOS port" && git push origin ios`; resolve any merge conflicts (Swift files should not conflict with TypeScript/Prisma changes)
- [ ] T081 [US5] Create directory structure `apps/ios/Reels/Features/Picker/` with files: `PickerView.swift` (SwiftUI view), `PickerPlanView.swift` (plan detail and voting), `PickerViewModel.swift` (ObservableObject), `PickerModels.swift` (Codable structs mirroring tRPC response shapes), `PickerAPI.swift` (URLSession calls per `contracts/trpc-routers.md` iOS API Client Extensions)
- [ ] T082 [US5] Implement `PickerAPI.swift` — `URLSession`-based API calls: `createPlan`, `getPlan`, `joinPlan`, `vote`, `confirmPlan`, `searchFilms`, `getShowtimes`; all methods async/await; use `JSONDecoder` with `Codable` response types from `PickerModels.swift`; include auth token in headers for protected endpoints; store/read guest session token from `UserDefaults` (keyed by planId)
- [ ] T083 [US5] Implement `PickerViewModel.swift` — `@MainActor ObservableObject` with `@Published` properties for: `plans: [PickerPlanSummary]`, `currentPlan: PlanDetail?`, `filmSearchResults: [FilmSearchResult]`, `showtimes: [Showtime]`, `isLoading: Bool`, `error: String?`; implement async methods calling `PickerAPI`; film search with 300ms debounce
- [ ] T084 [US5] Implement `PickerView.swift` — two-pathway SwiftUI landing: "Pick a Film" card and "I Know What I Want" card; below: "My Plans" list using `List` with status badges (`Voting`/`Confirmed`/`Expired`); navigation to `PickerPlanView`; uses localised strings from `Localizable.strings`
- [ ] T085 [US5] Implement `PickerPlanView.swift` — shows plan detail; guest join flow: `TextField` for display name + "Join" button; voting grid using `LazyVGrid` with 3-state toggle chip per cell (Available/Unavailable/Maybe with colour coding); real-time vote tallies per showtime row; organizer-only "Confirm Showtime" sheet; confirmed state renders summary card with film poster (`AsyncImage`), cinema, date, time, "Buy Tickets" link; expired state renders expiry card + "New Plan" button
- [ ] T086 [US5] Create directory `apps/ios/Reels/Features/Mood/` with files: `MoodReelsView.swift`, `MoodSelectorView.swift`, `MoodSuggestionsView.swift`, `MoodTwinsView.swift`, `MoodViewModel.swift`, `MoodModels.swift`, `MoodAPI.swift`
- [ ] T087 [US5] Implement `MoodAPI.swift` and `MoodViewModel.swift` — API calls for `setMood`, `getSuggestions`, `getHistory`, `tagFilm`, `expressInterest`; `MoodViewModel` is `@MainActor ObservableObject` with published `suggestions`, `moodTwins`, `history`, loading/error states; implement 3-second timeout with graceful fallback to community suggestions
- [ ] T088 [US5] Implement `MoodReelsView.swift` — "Beta — Easter Egg" `Label` badge at top; `MoodSelectorView` grid (10 moods with colour backgrounds via `Color` and SF Symbols); on selection show `MoodSuggestionsView` (10 film cards with `AsyncImage` poster, title, match explanation `Text`, match strength `ProgressView`); `MoodTwinsView` section with avatar grid and "Connect" button; mood history link; all text from `Localizable.strings`
- [ ] T089 [US5] Update `apps/ios/Reels/App/AppNavigation.swift` — add navigation destinations for Picker (`/picker`) and Mood Reels (`/mood`); update tab bar / navigation structure to include all 6 features with correct SF Symbols icons and localised titles per spec table; verify existing features (Match, Film Twins, Cinema Week, Buddy) still navigate correctly
- [ ] T090 [US5] Update `apps/ios/Reels/Core/Networking/` API client — add any shared URL building, auth header injection, or error decoding utilities needed by both `PickerAPI.swift` and `MoodAPI.swift`; ensure guest session cookie handling for Picker guest flows uses `HTTPCookieStorage` correctly
- [ ] T091 [US5] Build iOS app: `cd apps/ios && xcodebuild -scheme Reels -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.0' build 2>&1 | tail -20` — fix all compiler errors and warnings; verify all existing features still launch and navigate correctly after navigation update
- [ ] T092 [US5] Commit iOS changes: `git add -A && git commit -m "feat(ios): Picker, Mood Reels, updated navigation, localization parity — iOS native port" && git push origin ios`

---

## Phase 8: US5 — Android Native Port (Priority: P1)

**Purpose**: Mirror all web features in Kotlin/Jetpack Compose on the `android` branch. Android app must have feature parity with web and iOS.

**Note**: Switch to `android` branch for T093–T105. Merge feature branch before starting.

- [ ] T093 [US5] Switch to `android` branch and merge latest web changes: `git checkout android && git merge 002-launch-readiness-overhaul --no-ff -m "merge: web features for Android port" && git push origin android`; resolve any merge conflicts
- [ ] T094 [US5] Create Kotlin package structure for Picker feature in `apps/android/app/src/main/java/`: `...features.picker` package with files: `PickerScreen.kt`, `PickerPlanScreen.kt`, `PickerViewModel.kt`, `PickerRepository.kt`, `PickerModels.kt` (data classes mirroring tRPC response shapes, using `@Serializable`)
- [ ] T095 [US5] Create Kotlin package structure for Mood Reels in `apps/android/app/src/main/java/`: `...features.mood` package with files: `MoodReelsScreen.kt`, `MoodSelectorComponent.kt`, `MoodSuggestionsComponent.kt`, `MoodTwinsComponent.kt`, `MoodViewModel.kt`, `MoodRepository.kt`, `MoodModels.kt`
- [ ] T096 [US5] Implement `PickerRepository.kt` — Retrofit interface + implementation with suspend functions: `createPlan`, `getPlan`, `joinPlan`, `vote`, `confirmPlan`, `searchFilms`, `getShowtimes`, `myPlans`; use existing DI (Hilt) `@Module` to provide the Retrofit instance; map `PickerModels.kt` data classes; store guest session token in `SharedPreferences` keyed by planId
- [ ] T097 [US5] Implement `PickerViewModel.kt` — Hilt `@HiltViewModel`, `StateFlow` for `UiState` (Loading / Success / Error) holding plan detail, film search results, showtimes; implement `searchFilms` with `debounce(300)` using `Flow`; all suspend function calls in `viewModelScope`
- [ ] T098 [US5] Implement `PickerScreen.kt` in Jetpack Compose — two-pathway landing using `Card` composables; below: `LazyColumn` "My Plans" list with `FilterChip` status badges; navigation to `PickerPlanScreen`; Material3 theming; all strings from `stringResource(R.string.picker_*)` 
- [ ] T099 [US5] Implement `PickerPlanScreen.kt` in Jetpack Compose — guest join `AlertDialog` with `OutlinedTextField` for display name; voting grid using `LazyVerticalGrid` with state-coloured `FilterChip` (Available=green/Unavailable=red/Maybe=amber) per cell; vote tallies as `LinearProgressIndicator` per row; organizer "Confirm" `FloatingActionButton` with showtime selection `BottomSheet`; confirmed state: summary `Card` with `AsyncImage` poster (Coil), cinema/date/time, "Buy Tickets" `TextButton`; expired state
- [ ] T100 [US5] Implement `MoodRepository.kt` — Retrofit calls to `mood.setMood`, `mood.getSuggestions`, `mood.getHistory`, `mood.tagFilm`, `mood.expressInterest`; inject via Hilt; 3-second timeout on `setMood` using `withTimeout(3000L)` in Kotlin coroutines
- [ ] T101 [US5] Implement `MoodViewModel.kt` — Hilt `@HiltViewModel`, `StateFlow<MoodUiState>` with suggestions, moodTwins, history, activeMood, isLoading; timeout handling that falls back to community suggestions gracefully
- [ ] T102 [US5] Implement `MoodReelsScreen.kt` in Jetpack Compose — "Beta — Easter Egg" `SuggestionChip` at top; `MoodSelectorComponent` as `LazyVerticalGrid` of 10 `Card` composables (coloured backgrounds, `Icon` + mood name `Text`); on selection: `MoodSuggestionsComponent` as `LazyColumn` of film cards (`AsyncImage`, title, match explanation, `LinearProgressIndicator` for strength, source `Chip`); `MoodTwinsComponent` as `LazyRow` of user avatar cards with "Connect" `OutlinedButton`; all strings from `stringResource`
- [ ] T103 [US5] Update Android main navigation in `apps/android/app/src/main/java/` — add `PickerScreen` and `MoodReelsScreen` destinations to the `NavHost`; update `BottomNavigationBar` composable to include all 6 items with Material Icons per spec table and string labels from `R.string.*`; verify all existing screens navigate correctly
- [ ] T104 [US5] Build Android app: `cd apps/android && ./gradlew assembleDebug 2>&1 | tail -30` — fix all Kotlin compile errors; run a quick smoke test on emulator to verify Picker and Mood Reels screens launch
- [ ] T105 [US5] Commit Android changes: `git add -A && git commit -m "feat(android): Picker, Mood Reels, updated navigation, localization parity — Android native port" && git push origin android`

---

## Phase 9: US5 — Cross-Platform QA & Deployment (Priority: P1)

**Purpose**: Validate the full product across all three platforms, run the security audit, verify performance, sync branches, and deploy.

### Security (T106–T108)

- [ ] T106 [US5] Run `pnpm audit --audit-level=high` from repo root — resolve ALL critical and high severity findings; for unavoidable moderate findings, document justification in `apps/web/package.json` comments; confirm clean run before proceeding
- [ ] T107 [P] [US5] OWASP Top 10 manual audit of all new tRPC endpoints in `apps/web/src/server/routers/picker.ts` and `mood.ts` — verify: (A01) `picker.confirm` checks `organizerId === caller.userId`; (A01) `picker.vote` validates `participantId` ownership; (A02) guest cookies are `httpOnly: true, secure: true, sameSite: 'lax'`; (A03) all inputs use Zod schemas with `.max()` and regex constraints; (A04) rate limits present on `create`, `vote`, `setMood`; (A05) no secrets in source code; (A07) `onboardedProcedure` blocks unauthenticated access to protected mood endpoints; document findings and fix any issues
- [ ] T108 [US5] Verify `apps/web/next.config.mjs` CSP headers — if MongoDB Atlas is configured, add Atlas connection endpoint to `connect-src`; verify `frame-ancestors 'none'` is set; verify no `unsafe-eval` in script-src for production; update `Content-Security-Policy` header accordingly

### Automated Tests (T109–T114)

- [ ] T109 [US5] Write Vitest unit tests in `apps/web/tests/routers/picker.test.ts` — cover all `picker.*` procedures: create plan (Pathway A + B), join as authenticated user, join as guest (sets sessionToken), vote upsert (idempotent), vote rejected when plan is CONFIRMED, confirm by organizer succeeds, confirm by non-organizer returns 403, `cleanupExpiredPlans` deletes guest data; mock Prisma client; target 100% branch coverage on router logic
- [ ] T110 [US5] Write Vitest unit tests in `apps/web/tests/routers/mood.test.ts` — cover all `mood.*` procedures: setMood deactivates previous mood, getSuggestions returns both community and AI results, getMoodTwins excludes blocked users, getHistory returns ordered results, tagFilm upserts correctly, expressInterest delegates to discover; mock mood-engine service and Prisma
- [ ] T111 [P] [US5] Write Playwright e2e tests in `apps/web/tests/e2e/picker.spec.ts` — cover full happy path: create plan via Pathway A (film search → showtimes → share), create plan via Pathway B (date/film/cinema → showtimes → share), guest join via shared link (display name form), voting on showtimes, organizer confirms showtime, summary card renders with correct data; also test expired plan state and empty-participant state
- [ ] T112 [P] [US5] Write Playwright e2e tests in `apps/web/tests/e2e/mood.spec.ts` — cover: select each of 3 moods and verify suggestions list appears within 3 seconds, verify "Beta — Easter Egg" badge always visible, verify Mood Twins section renders (populated or empty state), verify mood history updates after selection, verify "What's your vibe today?" prompt appears on dashboard
- [ ] T113 [P] [US5] Write Playwright e2e tests in `apps/web/tests/e2e/navigation.spec.ts` — cover: visit all 9 authenticated routes and verify NavHeader is present with correct icon/title on each; visit all 4 public routes and verify NavHeader renders with auth options; test dropdown opens as overlay at 1280px without pushing content; test mobile menu at 375px viewport opens, scrolls, and dismisses; test language toggle updates text on screen
- [ ] T114 [US5] Run full test suite: `pnpm test && cd apps/web && pnpm test:e2e` — all tests must pass at 100%; fix every failing test before proceeding to performance or deployment

### Performance (T115–T116)

- [ ] T115 [P] [US5] Run Lighthouse CI on all new and key existing pages: `/`, `/picker`, `/picker/[planId]`, `/mood`, `/explore`, `/matches` — target LCP < 2s and TTI < 3s on simulated Fast 3G in Lighthouse; fix any pages failing by: lazy-loading below-the-fold components, adding `loading.tsx` skeletons, optimising images with Next.js `<Image>` (`priority` prop for above-fold images), removing render-blocking resources
- [ ] T116 [US5] Verify all interactive elements respond within 300ms — test `picker.vote` mutation latency, mood selector tap-to-suggestions latency, nav dropdown open latency; if any exceed 300ms, add optimistic UI updates (optimistic vote state for voting grid, instant mood highlight before suggestion load)

### Branch Sync & Merge (T117–T121)

- [ ] T117 [US5] On `002-launch-readiness-overhaul`: run `pnpm build && pnpm test` one final time — confirm zero build errors, zero test failures, zero TypeScript errors; confirm `pnpm audit` is clean
- [ ] T118 [US5] Merge feature branch into `main`: `git checkout main && git pull origin main && git merge 002-launch-readiness-overhaul --no-ff -m "merge: 002 launch readiness overhaul — Picker, Mood Reels, navigation, localization, QA" && git push origin main`
- [ ] T119 [US5] Sync `ios` branch with `main`: `git checkout ios && git merge main --no-ff -m "merge: sync ios with main post-002 launch readiness" && git push origin ios`; verify iOS build still passes after merge
- [ ] T120 [US5] Sync `android` branch with `main`: `git checkout android && git merge main --no-ff -m "merge: sync android with main post-002 launch readiness" && git push origin android`; verify Android build (`./gradlew assembleDebug`) still passes after merge
- [ ] T121 [US5] Feature parity verification: open `main`, `ios`, and `android` branches and confirm each has: (1) Picker feature screens, (2) Mood Reels screens, (3) updated nav with 6 features and correct icons, (4) Dutch + English strings present, (5) all page routes/screens match across platforms; document any discrepancy and resolve before deployment

### Deployment (T122–T125)

- [ ] T122 [US5] Deploy web app from `main` to Vercel — verify `apps/web/vercel.json` env vars are set (`DATABASE_URL`, `TMDB_API_KEY`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_BASE_URL`, `CRON_SECRET`, optionally `MONGODB_ATLAS_URI`); trigger deployment via `git push origin main` (Vercel auto-deploy); monitor build logs; confirm deployed app loads at production URL and `/picker` and `/mood` routes are accessible
- [ ] T123 [US5] Prepare iOS Release build from `ios` branch: `cd apps/ios && xcodebuild -scheme Reels -configuration Release -archivePath ./build/Reels.xcarchive archive -allowProvisioningUpdates`; fix any release-only build errors; verify archive succeeds; export IPA for App Store submission (or TestFlight)
- [ ] T124 [US5] Prepare Android Release build from `android` branch: `cd apps/android && ./gradlew bundleRelease`; fix any release-only build errors; verify `.aab` is produced in `app/build/outputs/bundle/release/`; ready for Play Store submission
- [ ] T125 [US5] Final smoke test on all three platforms post-deployment: (1) Web production URL: create a Picker plan, vote, confirm; select a mood in Mood Reels; switch language to Dutch — all features functional; (2) iOS Release build on simulator: navigate all 6 features — no crashes; (3) Android Release build on emulator: navigate all 6 features — no crashes

**Git checkpoint (all branches)**: `git push origin main ios android` — all three branches in final state.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T126 [P] Update `apps/web/public/manifest.json` to include `/picker` and `/mood` in the PWA `shortcuts` array so users can launch these from their home screen; verify `start_url` and `scope` are correct
- [ ] T127 [P] Verify `robots.txt` at `apps/web/public/robots.txt` — `/picker` and `/mood` routes should be indexed (not disallowed), `/api/` and `/api/cron/` should be disallowed; update if needed
- [ ] T128 Update `apps/web/prisma/seed.ts` to include a sample `PickerPlan` (in VOTING state with 3 showtimes and 2 participants) for demo/staging environments so the Picker feature is immediately demonstrable after `pnpm db:seed`
- [ ] T129 Verify `[i18n-missing]` logging works in production: deploy a page with a temporarily missing Dutch key, confirm Vercel function logs show `[i18n-missing] key=` entry, revert the test key; confirm logging infrastructure is operational
- [ ] T130 [P] Clean up all temporary files created during T026–T125 (any audit markdown files, temporary test scripts); run `pnpm lint` and `pnpm typecheck` on the final state of all three branches to confirm zero errors
- [ ] T131 Final security sign-off: `pnpm audit` clean, confirm OWASP checklist from T107 is fully resolved, confirm no API keys or secrets are committed to any branch; verify `.gitignore` excludes `.env*` files

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| Phase 1 (Setup) | Nothing | Phase 2 |
| Phase 2 (Foundational) | Phase 1 | All US phases |
| Phase 3 (US2 Nav) | Phase 2 (NavHeader created) | — |
| Phase 4 (US1 Picker) | Phase 2 (schema migrated, types, i18n) | — |
| Phase 5 (US3 Mood) | Phase 2 (schema migrated, types, i18n) | — |
| Phase 6 (US4 Localization) | Phases 3–5 (all i18n keys finalised) | Phases 7–8 |
| Phase 7 (iOS) | Phase 6 (web feature-complete) | Phase 9 (sync) |
| Phase 8 (Android) | Phase 6; parallel with Phase 7 | Phase 9 (sync) |
| Phase 9 (QA & Deploy) | All prior phases | Final Phase |
| Final Phase | Phase 9 | — |

### User Story Dependencies

| Story | Independent Test | Can Start After |
|-------|-----------------|-----------------|
| US2 Navigation | All routes have identical NavHeader on desktop + mobile | Phase 2 complete |
| US1 Picker | Create plan → share → guest vote → organizer confirms | Phase 2 complete |
| US3 Mood Reels | Select mood → suggestions in <3s → Mood Twins visible | Phase 2 complete |
| US4 Localization | Switch to Dutch → zero English fallback on any page | US1 + US2 + US3 i18n keys finalised |
| US5 iOS | All 6 features work on iOS simulator, nav icons correct | Phase 6 complete |
| US5 Android | All 6 features work on Android emulator, nav icons correct | Phase 6 complete |
| US5 QA/Deploy | 100% tests pass, security clean, all 3 branches deployed | All above complete |

### Parallel Opportunities

**Phase 2** — after T007–T015 Prisma models are written, T008–T015 can be batched into a single file edit; T017 and T018 (shared types) are fully parallel; T021 and T022 (i18n en/nl) are fully parallel

**Phase 4 (US1)** — T034–T044 (server layer) unblocks T045–T054 (UI layer); within UI layer T045, T046, T047, T048, T049 are all parallel; T035 and T036 within server layer are parallel

**Phase 5 (US3)** — T055 and T056 extend same service file (sequential); T063, T064, T065, T066, T067 (UI components) are all parallel after T057–T062 (server)

**Phases 7 and 8 (iOS + Android)** — fully parallel with each other after Phase 6

**Phase 9 (QA)** — T109, T110 (unit tests) parallel; T111, T112, T113 (e2e) parallel; T115 (Lighthouse) parallel with tests; T123, T124 (mobile builds) parallel with T122 (web deploy)

---

## Parallel Example: User Story 1 (Picker)

```bash
# After Phase 2 complete on 002-launch-readiness-overhaul:

# Stream A: Server layer (T034–T044)
#   T034: Create picker.ts skeleton
#   T035+T036: searchFilms + getShowtimes (parallel)
#   T037–T044: remaining procedures (sequential, depends on T034)

# Stream B: UI components (T045–T051, parallel after T034 exists)
#   T045: picker/page.tsx
#   T046: film-search.tsx
#   T047: showtime-selector.tsx
#   T048: voting-grid.tsx
#   T049: plan-summary-card.tsx

# Stream C: Mood Reels (fully parallel with all of Stream A+B)
#   T055–T070: All Mood Reels tasks
```

---

## Implementation Strategy

**MVP Scope** (minimum to ship Picker working end-to-end on web): T001–T016, T023–T025, T034–T054, T117–T118

**Full Launch Scope**: T001–T131 — all three platforms deployed

**Recommended Sequence for a Single Engineer**:
1. Phase 1 + 2 — foundation, ~1 day
2. Phase 3 US2 — nav unification, ~0.5 day  
3. Phase 4 US1 — Picker feature, ~2 days
4. Phase 5 US3 — Mood Reels, ~1.5 days
5. Phase 6 US4 — localization pass, ~0.5 day
6. Phase 7 iOS — native port, ~2 days
7. Phase 8 Android — native port, ~2 days (parallel with Phase 7 if pair programming)
8. Phase 9 — QA + deploy, ~1 day

**Total**: ~8–10 working days for a single senior engineer at full focus.

**Branch commit rhythm**: Commit after every phase checkpoint. Push after every phase. Never accumulate more than a half-day of uncommitted work.
