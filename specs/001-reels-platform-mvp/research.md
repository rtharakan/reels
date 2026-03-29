# Research: Reels — Film-Driven Social Matching Platform MVP

**Date**: 2026-03-29 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Authentication — BetterAuth + Next.js 14 + tRPC

**Decision**: BetterAuth with `magicLink`, `bearer`, `jwt`, and `nextCookies` plugins.

**Rationale**: BetterAuth confirms support for all required auth flows:
- **OAuth (Google, Apple)**: Native `socialProviders` config; callback URL `/api/auth/callback/{provider}`
- **Email magic links**: First-party `magicLink` plugin with configurable expiry
- **Bearer tokens for iOS**: `bearer` plugin emits `set-auth-token` header; iOS stores in Keychain, sends as `Authorization: Bearer <token>`
- **httpOnly cookies on web**: Default behavior; `nextCookies()` plugin fixes cookie-setting in server actions
- **Session management**: Configure `expiresIn` (7-day session) + `updateAge` (15-min refresh cadence)
- **Prisma adapter**: Built-in `prismaAdapter` manages User, Session, Account, Verification tables
- **tRPC integration**: Extract session in tRPC context via `auth.api.getSession({ headers: await headers() })`
- **App Router mount**: `/app/api/auth/[...all]/route.ts` exporting `toNextJsHandler(auth)` as GET/POST

**Alternatives considered**:
- NextAuth (Auth.js v5): Heavier; App Router edge runtime stability issues
- Clerk: Vendor lock-in + per-MAU cost; violates Principle VI
- Lucia Auth: Deprecated March 2025; maintainer recommended BetterAuth
- Custom JWT: Unnecessary complexity; BetterAuth plugins cover all needs

---

## 2. Letterboxd Scraping — Cheerio

**Decision**: Cheerio with `undici`/Node `fetch` for static HTML parsing of public watchlist pages.

**Rationale**:
- **URL structure**: `https://letterboxd.com/{username}/watchlist/page/{n}/`
- **Selectors**: `li.poster-container` within `ul.poster-list`; `div.film-poster` carries `data-film-slug` and `data-film-id`; film title in `img` `alt` attribute
- **Pagination**: Detect page count from `li.paginate-page` elements on first page; fetch remaining with 500ms–1s delay
- **robots.txt**: Watchlist pages (`/{username}/watchlist/`) are NOT blocked for generic user agents. Blocked paths are sorting/filtering views
- **User-Agent**: Honest identification — `Reels/1.0 (film-matching-app; contact@reels.app)`
- **Ethics**: Only scrape public profiles (private returns 404/redirect); user explicitly consents (FR-013); store only film identifiers, not Letterboxd proprietary data (ratings, reviews)

**Alternatives considered**:
- Puppeteer/Playwright: Overkill — pages are static HTML, no JS rendering needed
- Letterboxd RSS: No RSS feed for watchlists specifically
- Letterboxd private API: Would violate ToS
- Apify pre-built scrapers: External dependency and cost

---

## 3. Film Normalization — TMDB API v3

**Decision**: `GET /3/search/movie` with `query` (title) + `primary_release_year` (year) → canonical TMDB ID, poster, genres. Cache results in PostgreSQL `Film` table.

**Rationale**:
- **Search endpoint**: Returns `id`, `title`, `poster_path`, `genre_ids[]`, `release_date`
- **Poster URLs**: `https://image.tmdb.org/t/p/{size}{poster_path}` (w92 → original)
- **Rate limits**: Soft ~40 req/s; respect 429 with exponential backoff; use 5–10 concurrent requests
- **API key**: Bearer token in `Authorization` header; stored as `TMDB_API_READ_ACCESS_TOKEN` env var; never exposed to client
- **Attribution**: Must display "Powered by TMDB" logo on pages showing TMDB data
- **Films not found**: Retry without year; if still missing, store with `tmdbId: null`, flag as unresolved, use placeholder poster; track unmatched rate against SC-002 (90% target)

**Alternatives considered**:
- OMDb API: 1,000/day free limit; paid plan for posters
- IMDb datasets: Bulk TSV, no search API
- Wikidata/DBpedia: Incomplete, complex SPARQL
- Letterboxd TMDB links: Scraping individual film pages too expensive (1 req/film)

---

## 4. Match Scoring — 70% Film Overlap / 30% Genre Similarity

**Decision**: Jaccard similarity for film overlap (70%) + cosine similarity on genre frequency vectors (30%). Pre-compute and cache in `MatchScore` table.

**Rationale**:
- **Film overlap**: `|A ∩ B| / |A ∪ B|` — normalizes for watchlist size (range 0–1)
- **Genre similarity**: Cosine similarity on genre count vectors across ~19 TMDB genres (range 0–1)
- **Combined**: `matchScore = 0.70 × filmOverlap + 0.30 × genreSimilarity`
- **Performance (10K users)**: Incremental recomputation — when User A's watchlist changes, recompute A vs. all (~10K ops, <1 second). Store top 200 scores per user. Composite index `(userId, score DESC)` for fast Discover feed reads
- **Transparency (FR-018)**: Both components are interpretable — "You share 8 films" and "Similar genre taste (both love horror/drama)" are user-facing

**Alternatives considered**:
- Raw intersection count: Biases toward large watchlists
- TF-IDF weighted film vectors: Adds complexity with minimal MVP benefit
- Collaborative filtering: Requires rating data + large user base
- MinHash/LSH: Needed at 50K+ users; exact Jaccard fast enough at 10K
- ML embeddings: Over-engineered, not explainable

---

## 5. Database Schema — Prisma + PostgreSQL

**Decision**: Explicit join tables, canonical ordering for bidirectional matches, soft-delete with `deletedAt` timestamp, composite + partial indexes.

**Rationale**:
- **Bidirectional matches**: Single `Match` table with `userAId` (lexicographically smaller) + `userBId` (larger). Prevents duplicates; lookup with `WHERE userAId = ? OR userBId = ?`
- **Interest**: Explicit `Interest(fromUserId, toUserId)`. Reciprocal check triggers Match creation
- **Block/Report**: Separate tables with bidirectional exclusion in Discover query
- **MatchScore**: Pre-computed table with `@@index([userId, totalScore(sort: Desc)])` for fast ordered Discover reads
- **GDPR deletion**: Soft-delete (`deletedAt` timestamp) → 30-day grace period → scheduled hard-delete via cascading deletes
- **SeenUser**: Permanent record of which users were shown — prevents re-showing skipped candidates
- **DailyAllocation**: Tracks cards allocated today per user; reset implicit via timezone-aware date check

**Alternatives considered**:
- Implicit Prisma many-to-many: No extra fields on join tables
- Graph DB (Neo4j): Operational complexity; PostgreSQL handles 10K users
- Hard-delete only: No recovery window for accidental deletion

---

## 6. iOS Client — SwiftUI + URLSession + Keychain

**Decision**: Vanilla URLSession API client calling tRPC HTTP endpoints; Codable structs mirroring tRPC shapes; Keychain for JWT storage; SwiftData/CoreData for offline caching; APNs for push.

**Rationale**:
- **tRPC consumption**: Queries → `GET /api/trpc/{router}.{procedure}?input={json}`, Mutations → `POST /api/trpc/{router}.{procedure}` with JSON body
- **Codable models**: Mirror `TRPCResponse<T>` envelope + domain models. Maintain in `/ios/Reels/Core/Models/`; CI validation against TypeScript types
- **Keychain**: Store bearer token as `com.reels.app.auth-token` via `Security.framework` or `KeychainAccess` package. Never UserDefaults
- **Offline cache**: SwiftData (iOS 17+) caching Discover cards, matches, profile. Show cached data immediately → refresh from API. Cards expire at midnight
- **Push**: APNs directly (not Firebase). Register device token → send to server → server uses `apns2` npm package on match creation

**Alternatives considered**:
- OpenAPI codegen: tRPC doesn't emit OpenAPI spec without extra adapters
- GraphQL/Apollo: Would require rewriting entire API layer
- Firebase Cloud Messaging: Unnecessary Google dependency for iOS-only push
- Realm: Extra dependency; SwiftData is Apple-native and zero-dependency

---

## 7. Daily Discover Feed — 10 Cards/Day, Midnight Local Reset

**Decision**: Server-side allocation query selecting top 10 unseen, unblocked, intent-compatible candidates by pre-computed score. Midnight reset determined by user's stored IANA timezone.

**Rationale**:
- **Feed query**: Select from `MatchScore` WHERE candidate is not in `SeenUser`, not in `Block` (bidirectional), not soft-deleted, intent-compatible, has ≥5 films, ordered by `totalScore DESC`, limited to `10 - todayCardCount`
- **Allocation tracking**: `DailyAllocation(userId, allocatedAt, cardCount)` — check if cards remain today
- **SeenUser**: Permanent — skipped/seen users never reappear (anti-dark-pattern)
- **Midnight reset**: Stored IANA timezone on User → `SELECT NOW() AT TIME ZONE :userTimezone` for date boundary. No cron job needed — implicit reset when local date changes
- **PostgreSQL timezone**: All timestamps as `TIMESTAMPTZ`; `AT TIME ZONE` clause for user-local date boundary
- **Performance**: Single indexed read from MatchScore + subquery exclusions; <50ms at 10K users with proper indexes

**Alternatives considered**:
- Client-side midnight detection: Insecure — clock manipulation
- UTC midnight for all: Unfair across timezones
- Cron pre-generation: Infrastructure complexity; lazy generation equally fast with pre-computed scores
- Redis daily counters: Extra dependency; PostgreSQL sufficient at MVP scale

---

## 8. Accessibility — WCAG 2.1 AA (Web + iOS)

**Decision**: Semantic HTML + `@axe-core/playwright` in CI (web), SwiftUI semantic accessibility modifiers + `performAccessibilityAudit()` in XCTest (iOS). Zero-tolerance CI policy for AA violations.

**Rationale**:

**Web**:
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<button>`, `<label>`, `<form>`, `<html lang="en">`
- Keyboard navigation: All interactive elements focusable; custom components get `tabIndex`, `onKeyDown`, focus trapping
- Color contrast: Minimum 4.5:1 normal text, 3:1 large text — verified by axe-core
- Reduced motion: `@media (prefers-reduced-motion: reduce)` — card swipe degrades to instant transition
- Alt text: Film posters → `"{title} poster"`, user photos → `"{name}'s profile photo"`
- axe-core CI: `@axe-core/playwright` with `withTags(['wcag2a', 'wcag2aa'])` — fails build on violations

**iOS**:
- Semantic modifiers: `accessibilityLabel`, `accessibilityHint`, `accessibilityAddTraits` on all interactive elements
- VoiceOver: Cards read film count + user name; swipe gestures have button alternatives
- Dynamic Type: System fonts that scale with user preference
- Reduced motion: `@Environment(\.accessibilityReduceMotion)` — disable card swipe animations
- Touch targets: Minimum 44×44pt (Apple HIG + WCAG 2.5.5)
- XCTest: `performAccessibilityAudit()` (Xcode 15+) in CI via `xcodebuild test`

**Alternatives considered**:
- WAVE extension: Manual, not CI-enforceable
- WCAG 2.2 AAA: Impractical to enforce fully (e.g., sign language)
- React Aria: Heavy dependency for MVP; semantic HTML + axe-core sufficient
- Accessibility overlays: Widely criticized; don't fix underlying issues

---

## 9. Performance Strategy — SC-003 and SC-006

**Decision**: Composite PostgreSQL indexes on hot paths + pre-computed MatchScore table + autocannon load benchmarks in CI.

**Rationale**:

**Indexing plan** (critical for Discover feed <2 s at 10K users):
- `MatchScore(userId, totalScore DESC)` — ordered Discover feed reads without sort at query time
- `SeenUser(userId, seenUserId)` — unique constraint doubles as a fast exclusion lookup
- `Block(blockerId)` + `Block(blockedUserId)` — bidirectional block exclusion
- `DailyAllocation(userId, allocatedDate)` — unique per user-day
- `User(deletedAt)` — soft-delete filter on all queries
- `User(onboardingCompletedAt)` — auth middleware routing

**Query plan at 10K users**:
- MatchScore table: ~100M rows worst case (10K × 10K), but only top 200 per user stored → ~2M rows
- Discover query: 1 indexed read from MatchScore + 3 subquery exclusions (SeenUser, Block×2) — target <50 ms
- Use `EXPLAIN ANALYZE` on seeded 10K-user database to validate

**Benchmarking approach**:
- autocannon: 100 concurrent connections, 30s duration against `discover.getFeed`
- Target: p95 <2 s (SC-003), p99 <3 s
- Run against a seeded database with 10K users and realistic MatchScore distribution

**Alternatives considered**:
- k6 (Grafana): More features but heavier; autocannon is lighter for CI
- pgbench: Too low-level; we need HTTP-level benchmarks
- Manual `curl` timing: Not repeatable in CI

---

## 10. SeenUser Re-Eligibility — FR-022a Exception

**Decision**: When a user re-imports their watchlist and ≥30% of the resolved films are new (not in the previous import), prune all SeenUser entries where that user is the `seenUserId`. This allows the re-importing user to reappear in other users' Discover feeds.

**Rationale**:
- FR-022a states: "Previously seen/skipped users MUST NOT reappear unless re-imported into the eligible pool (e.g., after the other user re-imports a significantly changed watchlist)."
- "Significantly changed" is defined as ≥30% new films. This threshold is high enough to prevent gaming (casual re-imports don't reset visibility) but low enough to catch genuine taste evolution.
- Implementation: during `watchlist.import`, compare the new set of resolved film IDs against the previous set. If `|new - old| / |new| >= 0.30`, execute `DELETE FROM SeenUser WHERE seenUserId = :userId`.
- MatchScores are also recomputed on re-import, so the re-appearing user gets fresh rankings.

**Alternatives considered**:
- No re-eligibility (permanent SeenUser): Simpler but contradicts spec
- Time-based expiry (e.g., 90 days): Not tied to watchlist change; spec explicitly links to re-import
- Any watchlist change triggers re-eligibility: Too easy to game (add/remove 1 film)
- 50% threshold: Too high; a user adding 20 films to a 40-film watchlist wouldn't qualify

---

## 11. Email Transport — Magic Link Delivery

**Decision**: Resend as the email delivery service, integrated via BetterAuth's `sendMagicLink` callback.

**Rationale**:
- BetterAuth's `magicLink` plugin requires a `sendMagicLink(email, url, token)` callback to deliver magic link emails
- Resend offers a simple HTTP API, generous free tier (100 emails/day, 3,000/month), and excellent deliverability
- Configuration: `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=465`, API key as `SMTP_PASS`
- Alternatively, use Resend's REST SDK (`resend` npm package) for simpler integration
- Template: plain HTML email with magic link button, platform branding, and expiry notice

**Alternatives considered**:
- SendGrid: More complex setup; free tier requires domain verification first
- AWS SES: Overkill for MVP; sandbox mode restrictions
- Nodemailer + Gmail SMTP: Rate-limited; reliability concerns for production
- Postmark: Excellent but more expensive at scale

---

## 12. Object Storage — Profile Photos

**Decision**: Supabase Storage with signed upload URLs for profile photos.

**Rationale**:
- Supabase Storage provides S3-compatible object storage integrated with the Supabase project already used for PostgreSQL
- Bucket configuration: `profile-photos`, public read, max 5 MB per file, allowed MIME types `image/jpeg`, `image/png`, `image/webp`
- Upload flow: client requests a signed upload URL from the server → uploads directly to storage → server stores the resulting public URL in `User.profilePhotos`
- CORS: allow origin `http://localhost:3000` (dev) and production domain
- Cost: included in Supabase free tier (1 GB storage, 2 GB bandwidth/month)

**Alternatives considered**:
- Cloudflare R2: Cheaper egress but requires separate account and S3 client setup
- AWS S3: More complex IAM setup; not needed at MVP scale
- Direct base64 in database: Anti-pattern; bloats DB, no CDN
- Uploadthing: Vendor lock-in; simpler but less control
