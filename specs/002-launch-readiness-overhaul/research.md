# Research: Product Launch Readiness Overhaul

**Feature**: 002-launch-readiness-overhaul  
**Date**: 1 April 2026  
**Status**: Complete — all unknowns resolved

---

## Research Task 1: Picker Feature — Showtime Data Sourcing

**Unknown**: How to source cinema showtimes for the Picker feature's two pathways.

**Decision**: Reuse the existing `explore-screenings.ts` Filmladder.nl scraper service.

**Rationale**:
- The service already exists at `apps/web/src/server/services/explore-screenings.ts`
- Supports 18 Dutch cities with structured `ExploreScreening` data (filmTitle, cinemaName, cinemaCity, date, time, ticketUrl)
- Already used by the Plan and Buddy features via `/api/screenings` route
- Provides the exact data shape needed for Picker showtime options
- Manual entry fallback covers edge cases where auto-population returns no results

**Alternatives Considered**:
- **Google Places / dedicated cinema API**: Rejected — unnecessary complexity, paid tier, not better data for NL cinemas
- **Build new scraper**: Rejected — Filmladder already covers the Netherlands comprehensively

**Implementation Notes**:
- Picker Pathway A ("Pick a Film"): Search TMDB for film, then query Filmladder screenings filtered by film title + city
- Picker Pathway B ("I Know What I Want"): Query Filmladder filtered by date + film + cinema
- Existing `/api/screenings` route can be directly reused or wrapped in a tRPC procedure
- Showtime data is ephemeral — no need to persist screening data; fetch on-demand

---

## Research Task 2: Mood Reels — Mood-to-Film Matching Architecture

**Unknown**: How to implement mood-based film recommendations with both community and AI layers.

**Decision**: Two-layer architecture — community mood tags (default) + Voyage-4-nano semantic embeddings (beta/experimental).

**Rationale**:
- **Layer 1 (Community Tags)**: Users tag films with moods. Simple Prisma model (`MoodFilmTag`) with mood enum + film reference. Fast, no external dependencies. Provides the baseline recommendation source.
- **Layer 2 (AI/Embeddings)**: Voyage-4-nano (Apache 2.0) via `sentence-transformers` Python library generates 1024-dimension embeddings for film plot descriptions. Stored in MongoDB Atlas Vector Search. Mood queries are embedded and matched via cosine similarity against film plot embeddings.

**Alternatives Considered**:
- **OpenAI embeddings**: Rejected — proprietary, paid, vendor lock-in (violates Principle VI)
- **Community tags only**: Viable for MVP but spec requires AI layer for enhanced matching
- **TMDB keywords/genre mapping**: Too coarse for nuanced mood matching ("nostalgic" vs "melancholic")

**Implementation Notes**:
- Community tags are the primary source; AI layer is additive and labelled "beta"
- For MVP launch, community tags may be seeded by the development team to bootstrap the system
- MongoDB Atlas Vector Search index: dimension 1024, similarity cosine, field `plotEmbedding`
- Film plot descriptions sourced from TMDB API (already configured in `next.config.mjs` CSP)
- AI layer can be disabled via environment variable if MongoDB Atlas is not configured
- `sentence-transformers` runs server-side; consider a small Python microservice or Node.js `@xenova/transformers` for in-process embedding (avoids Python dependency)

**Refined Decision**: Use `@xenova/transformers` (Transformers.js, Apache 2.0) to run Voyage-4-nano embeddings in Node.js, avoiding a Python dependency. This keeps the stack TypeScript-only and aligns with Principle IV (Type-Safe End-to-End). Fallback: if the model is too large for serverless, use a pre-computed embedding table updated via cron job.

---

## Research Task 3: Picker — Guest Participation & Session Management

**Unknown**: How to identify and manage guest participants without requiring account creation.

**Decision**: Display name + browser session cookie. No PII collected.

**Rationale**:
- Guests enter a display name when first accessing a shared Picker link
- A session cookie (secure, httpOnly, sameSite=lax) identifies the guest for the plan's lifetime
- Guest votes are linked to the session token, not to any user account
- All guest data (votes, participant record) is deleted when the plan expires (7 days for unconfirmed plans)
- No GDPR consent flow required since no personal data is collected beyond a self-chosen display name

**Alternatives Considered**:
- **Require sign-up**: Rejected — friction kills viral sharing, which is the Picker's core value proposition
- **Anonymous UUIDs without display name**: Rejected — participants need to be identifiable in the voting grid
- **Email-based guest identification**: Rejected — collects PII, triggers GDPR obligations

**Implementation Notes**:
- Use BetterAuth's session management for logged-in users; standalone cookie for guests
- Guest cookie name: `reels-picker-guest` with plan-scoped session token
- Cookie expiry: 7 days (matches plan expiry)
- On plan expiry cron: delete all `PickerParticipant` records where `userId IS NULL` and associated `PickerVote` records

---

## Research Task 4: Navigation — Unified Component Architecture

**Unknown**: How to unify navigation across public and authenticated pages without duplication.

**Decision**: Single `NavHeader` component with authentication-aware rendering.

**Rationale**:
- Currently two separate components: `PublicHeader` (public pages) and inline header in `(main)/layout.tsx` (authenticated pages)
- Some pages (explore, scan, plan, buddy) can be accessed both publicly and when authenticated, leading to inconsistency
- Solution: One `NavHeader` component that accepts an `isAuthenticated` prop (or reads session context) and renders the appropriate nav items

**Alternatives Considered**:
- **Keep two components, synchronize styling**: Rejected — maintenance burden, source of future inconsistency
- **Server component header**: Rejected — needs client interactivity (dropdown, mobile menu, language toggle)

**Implementation Notes**:
- `NavHeader` renders: logo, feature links with designated icons, dropdown for overflow items, language toggle, theme toggle, auth actions
- Dropdown overlay: `position: fixed`, `max-height: 80vh`, `overflow-y: auto`, `z-index: 50`
- Mobile menu (< 768px): slide-in overlay, touch-friendly 44×44pt targets, dismiss on outside tap
- Feature icon/title mapping per spec: Heart=Match(Explore), Radar=Film Twins(Scan), Calendar=Cinema Week(Plan), Popcorn=Buddy, Ticket=Picker, Sparkles=Mood Reels
- Bottom tab bar (authenticated only) updated to include Picker and Mood Reels in the "more" overflow

---

## Research Task 5: Dutch Localization — Complete Translation Strategy

**Unknown**: Strategy for achieving 100% Dutch coverage including new features.

**Decision**: Extend existing `lib/i18n/` system with new namespaces for Picker and Mood Reels.

**Rationale**:
- Existing i18n system uses typed TypeScript objects (`en.ts` / `nl.ts`) with `Translations` type
- Adding new keys to the `Translations` type ensures compile-time completeness checking
- Missing key fallback already partially exists; needs server-side `[i18n-missing]` logging

**Alternatives Considered**:
- **i18next / react-intl**: Rejected — existing system works, no need to introduce new dependency
- **JSON translation files**: Rejected — TypeScript objects provide type safety (Principle IV)

**Implementation Notes**:
- New namespaces: `picker`, `mood`, `nav` (for updated navigation labels)
- Updated feature labels per spec naming table: `common.explore` → "Match", `common.scan` → "Film Twins" (en) / "Film Tweelingen" (nl), `common.plan` → "Cinema Week" (en) / "Bioscoop Week" (nl)
- Missing key logging: wrap the `t` accessor in the i18n context to log `[i18n-missing] key={keyPath}` to `console.error` when a key resolves to `undefined`, falling back to English
- iOS: Extend `LanguageManager.swift` and `.strings` / `.stringsdict` files
- Android: `values/strings.xml` (en) and `values-nl/strings.xml` (nl)

---

## Research Task 6: Cross-Platform Sync — Branch Strategy

**Unknown**: How to maintain feature parity across main, iOS, and Android branches.

**Decision**: Web app on `main` is the source of truth. iOS and Android branches track main and implement native equivalents.

**Rationale**:
- The spec is clear: main = web, ios = iOS, android = Android
- All API contracts (tRPC routers) are defined on main and consumed by mobile apps
- Feature parity is validated by a checklist comparing routes, features, translations, and icons across all three

**Alternatives Considered**:
- **Single branch with platform conditionals**: Rejected — would complicate CI/CD and platform-specific build configs
- **Separate repositories**: Rejected — monorepo is established and enables shared type definitions

**Implementation Notes**:
- Development workflow: implement web features on `main` first, then port to iOS/Android branches
- iOS branch: `git merge main` before starting iOS implementation to get latest schema/types
- Android branch: same merge strategy
- Feature parity audit: automated script comparing route list, i18n key count, and feature flags

---

## Research Task 7: Security Hardening & Performance

**Unknown**: Specific security and performance measures needed for launch.

**Decision**: OWASP Top 10 audit checklist + Lighthouse performance testing.

**Rationale**:
- Existing security headers in `next.config.mjs` are comprehensive (CSP, HSTS, X-Frame-Options, etc.)
- BetterAuth handles auth securely with OAuth 2.0
- Zod validation exists on tRPC procedures
- Need to add: rate limiting on new endpoints, Picker link brute-force protection, input sanitization audit

**Implementation Notes**:
- **Rate limiting**: Apply to Picker plan creation (5/min/user), vote submission (30/min/session), mood selection (10/min/user)
- **Input sanitization**: Zod schemas for all new tRPC inputs; display names sanitized (alphanumeric + spaces, max 50 chars)
- **Picker link security**: Plan IDs use `cuid()` (22-char random), making enumeration infeasible. Optional: add a secondary access token for extra protection.
- **Performance**: Lazy-load Mood Reels AI layer; prefetch showtime data on Picker page mount; optimize images via Next.js `<Image>` with AVIF/WebP
- **Dependency audit**: `pnpm audit` in CI, resolve all critical/high before merge
- **CSP update**: Add MongoDB Atlas connection string to `connect-src` if using Atlas Vector Search

---

## Research Task 8: Voyage-4-nano Embedding — Feasibility for Serverless

**Unknown**: Can Voyage-4-nano run in Vercel serverless functions?

**Decision**: Pre-compute embeddings offline; store in MongoDB Atlas. Query-time embedding uses a lightweight model or pre-defined mood vectors.

**Rationale**:
- Voyage-4-nano model is ~500MB+ — too large for Vercel serverless cold starts (50MB function limit)
- Pre-computing film plot embeddings via a local/CI script and storing in MongoDB Atlas is the practical approach
- At query time, mood queries can use pre-defined mood embedding vectors (8 moods = 8 vectors, pre-computed once) for cosine similarity search in Atlas

**Alternatives Considered**:
- **Run model in serverless**: Rejected — exceeds Vercel function size limits
- **External embedding API**: Rejected — adds vendor dependency (Principle VI)
- **Skip AI layer entirely at launch**: Viable fallback; community tags provide recommendations without AI

**Implementation Notes**:
- Batch script: `scripts/embed-films.ts` — fetches TMDB plot descriptions, generates embeddings via local `sentence-transformers`, uploads to MongoDB Atlas
- Mood vectors: hand-crafted + refined semantic vectors for each of the 8+ moods
- Atlas Vector Search query: `{ $vectorSearch: { queryVector: moodVector, path: "plotEmbedding", numCandidates: 50, limit: 10 } }`
- Graceful degradation: if Atlas is unavailable, fall back to community tags only
