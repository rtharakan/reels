# Feature Specification: Reels — Film-Driven Social Matching Platform MVP

**Feature Branch**: `001-reels-platform-mvp`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Reels film-driven social matching platform MVP — monorepo with web and iOS apps, Letterboxd watchlist import, taste-based matching engine, and discover feed"

## Clarifications

### Session 2026-03-29

- Q: What is the primary matching intent of Reels? → A: Both — user chooses intent per profile (friend or date mode).
- Q: What is the minimum number of watchlist films required for matching? → A: 5 films.
- Q: What session/token strategy should the platform use? → A: Short-lived JWT access tokens (15 min) + refresh tokens (7 days); httpOnly cookies on web, Keychain on iOS.
- Q: What should the match score weight distribution be? → A: 70% direct film overlap / 30% genre similarity.
- Q: How many Discover cards per session, and when does the feed reset? → A: 10 cards per day, resets at midnight local time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign Up & Onboarding (Priority: P1)

A new user visits the Reels landing page, creates an account using email or social login (Google, Apple), and is guided through an onboarding flow. During onboarding they provide their Letterboxd username, a display name, age, location, a short bio, three conversation prompts, and optionally select their top 4 films. The system imports their public Letterboxd watchlist automatically.

**Why this priority**: Without account creation and watchlist import, no other feature can function. This is the absolute foundation of the platform.

**Independent Test**: Can be fully tested by creating an account, completing onboarding, and verifying the imported watchlist appears on the user's profile.

**Acceptance Scenarios**:

1. **Given** a visitor on the landing page, **When** they tap "Sign Up" and authenticate via email magic link, **Then** an account is created and they are directed to the onboarding flow.
2. **Given** a user in onboarding, **When** they enter a valid public Letterboxd username, **Then** the system scrapes their public watchlist, normalizes films via a film metadata service, and displays the imported list for confirmation.
3. **Given** a user in onboarding, **When** they enter an invalid or private Letterboxd username, **Then** the system displays a specific inline error: "Username not found" or "This profile is private — please make it public on Letterboxd and try again". The user can retry or skip the import step.
4. **Given** a user in onboarding, **When** they complete all required profile fields (name, age, location, bio, Letterboxd username, at least one prompt), **Then** their profile is saved and they are directed to the Discover feed.
5. **Given** a user in onboarding, **When** they have not accepted the privacy policy, **Then** the system prevents progression until consent is given.

---

### User Story 2 — Discover & Express Interest (Priority: P1)

An authenticated user opens the Discover feed and sees a card-based interface showing other users with whom they share overlapping films. Each card displays the other user's profile preview, shared film count, and a selection of shared film posters. The user can express interest or skip. The feed has a finite end per session.

**Why this priority**: The discover mechanism is the core value proposition — connecting users through shared film taste. Without it, there is no matching.

**Independent Test**: Can be fully tested by logging in with an imported watchlist and verifying that the Discover feed surfaces other users ranked by film overlap, and that expressing interest is recorded.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an imported watchlist, **When** they open Discover, **Then** they see cards of other users ranked by overlap score (shared films, genre similarity).
2. **Given** a user viewing a Discover card, **When** they express interest, **Then** the system records the interest and shows the next card.
3. **Given** a user viewing a Discover card, **When** they skip, **Then** the card is dismissed and the next card appears.
4. **Given** a user who has reviewed all available matches in a session, **When** they reach the end of the feed, **Then** the system displays a clear "You're all caught up" message with no nudge to continue.
5. **Given** a user viewing any Discover card, **When** they tap the other user's profile, **Then** they see a detailed profile view including shared films, bio, prompts, and top 4 films.

---

### User Story 3 — Mutual Match (Priority: P1)

When two users have both expressed interest in each other, a match is created. Both users are notified and can see the match in their Matches list. The match detail view highlights overlapping films and shared taste signals.

**Why this priority**: Mutual matching is the outcome users are seeking. Without it, expressed interest has no payoff.

**Independent Test**: Can be fully tested by having two test users express mutual interest and verifying that both see the match in their Matches list with shared film data.

**Acceptance Scenarios**:

1. **Given** User A has expressed interest in User B, **When** User B also expresses interest in User A, **Then** a match is created and both users are notified.
2. **Given** a match exists between two users, **When** either user opens their Matches list, **Then** they see the match with a preview showing shared films and the other user's name and photo.
3. **Given** a user views a match detail, **When** the page loads, **Then** they see an explanation of why they matched (number of shared films, genre overlap, specific shared titles).

---

### User Story 4 — Profile Management (Priority: P2)

An authenticated user can view and edit their profile at any time. They can update their bio, prompts, top 4 films, photos, and re-import their watchlist. They can also delete their account entirely.

**Why this priority**: Profile management is essential for retention and regulatory compliance (account deletion), but users can function on the platform without editing their profile initially.

**Independent Test**: Can be fully tested by editing each profile field and verifying changes persist, and by deleting an account and verifying all data is removed.

**Acceptance Scenarios**:

1. **Given** an authenticated user on their profile page, **When** they edit their bio and save, **Then** the updated bio is displayed on their profile.
2. **Given** an authenticated user, **When** they trigger a watchlist re-import, **Then** the system re-scrapes their public Letterboxd watchlist and updates their stored list.
3. **Given** an authenticated user, **When** they request account deletion, **Then** the system deletes all their data (profile, watchlist, matches, interest history) and confirms deletion.

---

### User Story 5 — Safety: Block & Report (Priority: P2)

A user can block or report another user from any profile view or Discover card. Blocking removes the other user from their feed and match list. Reporting flags the user for moderation review.

**Why this priority**: User safety is a constitutional mandate. Block and report must be accessible within two taps of any user profile.

**Independent Test**: Can be fully tested by blocking a user and verifying they no longer appear in Discover or Matches, and by submitting a report and verifying it is recorded.

**Acceptance Scenarios**:

1. **Given** a user viewing another user's profile or Discover card, **When** they tap the overflow menu, **Then** they see "Block" and "Report" options within two taps.
2. **Given** a user who blocks another user, **When** they return to Discover or Matches, **Then** the blocked user no longer appears anywhere.
3. **Given** a user who reports another user, **When** they select a reason and submit, **Then** the report is recorded for moderation review and the reporting user receives confirmation.

---

### User Story 6 — iOS Native Experience (Priority: P3)

A user downloads the Reels iOS app, logs in (including Apple Sign-In), and accesses the same features as the web app with native gestures, push notifications, and offline caching of previously loaded data.

**Why this priority**: The iOS app is Phase 2. Web must be functional first, but the iOS experience extends reach to mobile-first users.

**Independent Test**: Can be fully tested by installing the iOS app, signing in, importing a watchlist, discovering matches, and verifying push notifications arrive for new matches.

**Acceptance Scenarios**:

1. **Given** a user on iOS, **When** they sign in with Apple Sign-In, **Then** they are authenticated and directed to onboarding (new user) or Discover (returning user).
2. **Given** an iOS user with previously loaded data, **When** they lose network connectivity, **Then** they can still browse their profile, matches, and cached Discover cards.
3. **Given** a match occurs, **When** the iOS user has push notifications enabled, **Then** they receive a push notification about the new match.

---

### Edge Cases

- What happens when a user's Letterboxd watchlist is empty or has fewer than 5 resolved films? → The system displays a message explaining that at least 5 films are needed for matching and encourages the user to add films on Letterboxd, then re-import. The user can still complete onboarding but will not appear in the Discover feed until the threshold is met.
- What happens when a new user has zero overlap with any existing user? → The Discover feed shows a message explaining no matches were found yet and suggests checking back as more users join.
- What happens when Letterboxd is temporarily unreachable during import? → The system displays a clear error, invites the user to retry, and does not block account creation — the watchlist can be imported later.
- How does the system handle duplicate accounts (same Letterboxd username)? → Each Letterboxd username can only be linked to one Reels account at a time.
- What happens when a user changes their Letterboxd username? → The user can update their linked Letterboxd username in profile settings and re-import.
- What happens when a film from a watchlist is not found in the film metadata service? → The film is flagged as unresolved and excluded from matching; the user is not shown an error for individual films, but an import summary notes how many films were successfully resolved.
- What happens when two users express interest in each other simultaneously (race condition)? → The reciprocal Interest check is performed within a database transaction. If both writes succeed, exactly one Match is created (the second `expressInterest` call detects the existing Interest and triggers match creation). Duplicate Match creation is prevented by the canonical user ordering unique constraint.
- What happens when a user deletes their account while another user has them in their Discover feed or pending Interest? → Soft-deleted users are excluded from Discover queries. Any pending Interest records pointing to a deleted user are ignored. If a card was already fetched client-side before deletion, expressing interest on it returns a `NOT_FOUND` error and the card is dismissed.
- What happens when a user blocks someone they have already matched with? → The existing Match and all Interest records between the two users are deleted. The blocked user vanishes from the blocker's Matches list immediately.
- What is the re-import behavior? → Re-import performs an upsert: new films are added, existing films are kept, and films no longer on the Letterboxd watchlist are removed from the user's WatchlistEntry records. Match scores are recomputed after re-import.
- What happens when TMDB API is unreachable during watchlist import? → The system imports all films it can resolve and marks the rest as unresolved. The import completes as a partial success — the ImportResult shows `totalResolved` vs. `totalUnresolved`. The user can re-import later to retry unresolved films.
- What happens when a user's Letterboxd profile changes from public to private after initial import? → Re-import attempts will fail with a clear error ("profile is private or not found"). The user's existing watchlist data is preserved; they remain matchable if they have ≥5 resolved films.
- What should the Matches list show when a user has no matches yet? → An empty state message: "No matches yet — keep discovering!" with no nudge or promotional content.
- What happens when a user closes the browser mid-onboarding and returns later? → The auth middleware detects `onboardingCompletedAt === null` and redirects back to onboarding. Any partially submitted data is NOT persisted — the user restarts onboarding from step 1 (privacy consent). This avoids storing profile data before consent.
- What happens when a user taps interest/skip twice rapidly (duplicate action)? → The Interest unique constraint (`fromUserId, toUserId`) and the SeenUser unique constraint prevent duplicates. The second request returns success idempotently.
- How is the "Both" intent displayed on Discover cards? → Users with intent "Both" show a badge reading "Open to friends & dating". "Friends" shows "Looking for friends". "Dating" shows "Looking to date".

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Accounts**

- **FR-001**: System MUST support account creation via OAuth (Google, Apple) and email magic links.
- **FR-002**: System MUST present the privacy policy in plain language during onboarding before any data collection beyond authentication.
- **FR-003**: Users MUST be able to delete their account and all associated data at any time (GDPR compliance).
- **FR-004**: System MUST support Apple Sign-In on the iOS app.
- **FR-004a**: Authentication sessions MUST use short-lived JWT access tokens (≤15 min expiry) paired with refresh tokens (≤7 days expiry). Access tokens MUST be stored in httpOnly secure cookies on web (with `sameSite=lax`, `secure=true`, `path=/`) and in the iOS Keychain on mobile. Refresh tokens MUST be rotated on each use. When an access token expires mid-action, the client MUST silently refresh using the refresh token and retry the request; if the refresh token is also expired, the user MUST be redirected to login.
- **FR-004b**: Email magic links MUST expire after 10 minutes. The magic link email MUST include Reels branding, a clear call-to-action button, a plain-text fallback, and a note that the link expires.

**Profile**

- **FR-005**: Users MUST provide a display name (1–50 chars), age (≥17), location (free-text city/region, 1–100 chars), bio (1–500 chars), at least one conversation prompt (each answer 1–300 chars, max 3 prompts), and optionally a Letterboxd username during onboarding. Letterboxd username may be skipped — the user can import their watchlist later from profile settings. Users who skip will not appear in the Discover feed until they import ≥5 resolved films.
- **FR-006**: Users MUST be able to select up to 4 "top films" for their profile (auto-populated from their watchlist or manually chosen). If the user has fewer than 4 resolved films, the selector MUST allow choosing from whatever is available; the remaining slots stay empty.
- **FR-007**: Users MUST be able to upload up to 6 profile photos. Accepted formats: JPEG, PNG, WebP. Maximum file size: 5 MB per image. Images exceeding the size or format constraints MUST be rejected with a clear inline error message explaining the limit. The client SHOULD resize/compress images before upload.
- **FR-008**: Users MUST be able to edit all profile fields after onboarding.
- **FR-008a**: Users MUST select a matching intent during onboarding: "Friends", "Dating", or "Both". This intent is displayed on their profile and can be changed at any time.
- **FR-008b**: The Discover feed MUST only surface users whose matching intent is compatible (e.g., a "Friends"-only user is never shown to a "Dating"-only user; "Both" is compatible with either).
- **FR-009**: User-facing text throughout the platform MUST be extractable for future localization (i18n readiness).

**Watchlist Import**

- **FR-010**: System MUST import a user's public Letterboxd watchlist given their Letterboxd username.
- **FR-011**: Scraping MUST be limited to publicly available data only; the system MUST NOT attempt to bypass login walls or access private profiles.
- **FR-012**: Scraped film data MUST be normalized through a canonical film metadata service (title, year, poster, unique ID).
- **FR-013**: Users MUST explicitly initiate watchlist import (no background scraping without user action).
- **FR-014**: Users MUST be able to re-import their watchlist at any time to pick up changes.
- **FR-015**: Scraping MUST respect `robots.txt` directives and implement polite crawling: minimum 500 ms delay between requests, identifiable User-Agent header (e.g., `Reels/1.0`), and no more than 2 concurrent scrape sessions.

**Matching**

- **FR-015a**: A user MUST have at least 5 resolved films in their watchlist to be eligible for matching and to appear in the Discover feed.
- **FR-016**: System MUST compute a match score between users based on overlapping films in their watchlists. The match score MUST weight direct film overlap at 70% and genre similarity at 30%.
- **FR-017**: Match scoring MUST also factor in genre similarity across watchlists. Genre similarity is computed as the cosine similarity between each user's aggregate genre distribution vector (each dimension = count of resolved films in that TMDB genre across the user's full watchlist). All TMDB genres carry equal weight.
- **FR-018**: Matching algorithm MUST be transparent — the match detail view MUST display: the number of shared films, a grid of shared film posters with titles, the top shared genres with counts, and the overall match score as a percentage.
- **FR-019**: A match is created only when both users have expressed mutual interest.

**Discover Feed**

- **FR-020**: System MUST present a card-based Discover feed showing potential matches ranked by overlap score.
- **FR-021**: Each Discover card MUST display the other user's profile preview (name, age, location, first profile photo, intent badge), shared film count, and up to 4 shared film posters. The detailed profile view (accessible by tapping the card) MUST display bio, conversation prompts, top 4 films, all shared films, and intent.
- **FR-022**: The Discover feed MUST have a finite end per session — no infinite scroll. A session serves a maximum of 10 Discover cards per day.
- **FR-022a**: The daily Discover card allocation MUST reset at midnight in the user's local time zone (based on the IANA timezone stored in the user's profile; DST transitions use the wall-clock midnight). If a user changes their timezone mid-day, the current day's allocation is not reset — the new timezone takes effect the following day. Previously seen/skipped users MUST NOT reappear unless the other user re-imports a watchlist with ≥30% new resolved films (films not present in their previous import), at which point their SeenUser entries are pruned and they become re-eligible.
- **FR-023**: Users MUST NOT be nudged to continue once they have reviewed available matches.

**Safety & Moderation**

- **FR-024**: Users MUST be able to block another user within two taps from any profile or Discover card. The trigger is a visible overflow menu icon (ellipsis "⋯") on each Discover card and profile view; tapping it reveals "Block" and "Report" options.
- **FR-025**: Users MUST be able to report another user with a reason, within two taps from any profile or Discover card.
- **FR-026**: Blocking a user MUST remove them from the blocker's Discover feed, match list, and all future interactions. Any existing Match and Interest records between the two users MUST be deleted upon blocking.
- **FR-027**: Reports MUST be recorded and flagged for moderation review.

**Accessibility**

- **FR-028**: All user-facing features MUST meet WCAG 2.1 Level AA compliance (web).
- **FR-029**: Web UI MUST support keyboard navigation, screen readers, and minimum 4.5:1 color contrast for normal text.
- **FR-030**: Motion and animation MUST respect the user's reduced-motion preferences on both web and iOS.
- **FR-031**: All images (film posters, avatars) MUST have meaningful alt text.
- **FR-032**: Touch targets on iOS MUST be at minimum 44×44 points.
- **FR-033**: iOS app MUST use semantic accessibility modifiers on all interactive elements.

**iOS-Specific**

- **FR-034**: iOS app MUST support native gestures for Discover card interactions.
- **FR-035**: iOS app MUST support push notifications for new matches.
- **FR-036**: iOS app MUST cache previously loaded data for offline browsing.
- **FR-037**: iOS app MUST include a privacy manifest, proper permission prompts, and account deletion to meet App Store requirements.

### Key Entities

- **User**: A person with a Reels account. Key attributes: name, email, age, location, bio, conversation prompts (up to 3), profile photos, linked Letterboxd username, top 4 films, matching intent ("Friends", "Dating", or "Both"). A user has one watchlist and can have many matches.
- **Watchlist Item**: A single film in a user's imported watchlist. Key attributes: canonical film ID, title, year, poster image. Belongs to one user.
- **Match**: A connection between two users who have expressed mutual interest. Key attributes: the two matched users, creation timestamp, shared films that contributed to the match.
- **Interest**: A record that one user has expressed interest in another via the Discover feed. Key attributes: the expressing user, the target user, timestamp. When reciprocal, triggers a Match.
- **Report**: A user-submitted safety report about another user. Key attributes: reporting user, reported user, reason, timestamp, moderation status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full sign-up and onboarding flow (account creation through watchlist import confirmation) in under 5 minutes. Measured via Playwright e2e test using the happy path: email magic link → privacy consent → profile fields → Letterboxd import (mocked at 3 s) → top films selection.
- **SC-002**: 90% of users with public Letterboxd watchlists (≥10 films) have their films successfully imported and resolved on the first attempt. Measured against a reference set of 50 diverse public Letterboxd profiles.
- **SC-003**: The Discover feed loads and displays the first match card within 2 seconds of navigation. Measured via autocannon benchmark: 100 concurrent requests, 30 s duration, against a 10,000-user seeded database; p95 response time ≤2 s. Warm start (server already running), standard network.
- **SC-004**: Users can understand why they were matched with another user (shared films, genre overlap percentage, and specific shared titles are visible on every match detail page).
- **SC-005**: Block and report actions are reachable within 2 taps from any user profile or Discover card.
- **SC-006**: The platform supports at least 10,000 registered users without degradation. Validated by running `EXPLAIN ANALYZE` on Discover feed, MatchScore lookup, and SeenUser exclusion queries against a 10K-user seeded database; all queries ≤100 ms p95.
- **SC-007**: 7-day retention rate exceeds 40% among users who complete onboarding. This is a post-launch metric — requires analytics event tracking (see NFR-006). Not gated for MVP ship; tracked in a post-launch dashboard.
- **SC-008**: Match rate (percentage of users who receive at least one mutual match within their first week) exceeds 25%. Post-launch metric — requires analytics event tracking (see NFR-006). Not gated for MVP ship.
- **SC-009**: All web pages score 90+ on axe-core accessibility audits (run via Playwright in CI). This is the authoritative tool; Lighthouse accessibility scores are informational only.
- **SC-010**: iOS app achieves App Store approval on the first submission.

## Assumptions

- Users have a public Letterboxd profile with at least some films in their watchlist. Users with private profiles or empty watchlists will receive guidance but cannot be matched until they make data available.
- Letterboxd does not currently offer a public API; the system will scrape public pages. If Letterboxd introduces an official API or explicitly prohibits scraping, the project will migrate within 30 days per the constitution's Data Ethics policy. Letterboxd's `robots.txt` has been reviewed and does not currently disallow scraping of public user watchlist pages.
- The canonical film metadata service (e.g., TMDB) provides sufficient coverage to resolve the vast majority of films found on Letterboxd watchlists. TMDB free-tier API limits (approximately 40 requests/10 s) are sufficient for import volumes at the 10K-user scale; poster images SHOULD be cached via CDN to reduce redundant API calls.
- The web application is the primary platform for Phase 1 (MVP). The iOS app (Phase 2) achieves full feature parity with the web.
- The "Date Engine" (suggesting in-theater screenings for matched users) is Phase 3 and explicitly out of scope for this specification.
- Chat between matched users is out of scope for MVP. Matches are surfaced but real-time messaging is deferred. The match detail UI MUST NOT include a chat input or any "coming soon" messaging placeholder that could confuse users.
- No paid features or monetization for the initial release.
- Dark mode is the default visual theme, consistent with the film-first aesthetic described in UX principles.
- The target audience is 20–35 year old, culturally engaged, urban Letterboxd users. The platform enforces a 17+ age rating for App Store compliance. The 17+ age requirement MUST be enforced during onboarding validation (`age ≥ 17`) and documented in the App Store age rating questionnaire.
- Short-lived JWT access tokens (15 min) with rotating refresh tokens (7 days) are used for session management. Web stores tokens in httpOnly secure cookies; iOS stores them in the Keychain.
- Performance targets follow standard web and mobile app expectations unless a specific metric is called out in Success Criteria.

## Non-Functional Requirements

**Security & Infrastructure**

- **NFR-001**: All API endpoints behind authentication MUST enforce rate limiting. Auth endpoints: 10 requests/minute per IP. `watchlist.import`: 5 requests/hour per user. `discover.expressInterest` / `discover.skip`: 30 requests/minute per user.
- **NFR-002**: The Next.js web app MUST set Content-Security-Policy headers: `default-src 'self'`; `img-src 'self' image.tmdb.org *.supabase.co`; `script-src 'self'`; `style-src 'self' 'unsafe-inline'` (for Tailwind). CORS MUST allow only the production domain origin.
- **NFR-003**: TMDB poster images MUST be served through a CDN or cached proxy to comply with TMDB attribution requirements ("Powered by TMDB" logo on pages displaying posters) and reduce direct API load.

**Observability**

- **NFR-004**: The server MUST emit structured JSON logs (timestamp, level, requestId, userId, action) for all API requests and errors. Log levels: `info` for normal requests, `warn` for validation failures and rate limits, `error` for unhandled exceptions and downstream failures (TMDB, Letterboxd, Supabase).
- **NFR-005**: Unhandled server errors MUST be captured and reported via an error tracking service (e.g., Sentry). Alerts MUST be configured for error rate spikes (≥10 errors/minute).

**Analytics**

- **NFR-006**: The platform MUST emit lightweight analytics events for post-launch metrics (SC-007, SC-008): `onboarding.completed`, `discover.interest`, `discover.skip`, `match.created`, `session.started`. Events MUST be privacy-respecting (no PII in payloads) and sent to a first-party analytics endpoint or privacy-friendly service (e.g., Plausible, PostHog self-hosted). This is required before measuring retention and match rate.

**Data & Operations**

- **NFR-007**: Database backups MUST be enabled via Supabase's automatic daily backups. Point-in-time recovery SHOULD be available for the production database.
- **NFR-008**: Prisma schema migrations in production MUST use `prisma migrate deploy` (not `db push`). Rollback procedures: maintain a manual rollback SQL script for each migration. Feature flags are not required for MVP but SHOULD be considered for incremental rollout of iOS features.
- **NFR-009**: Soft-deleted users MUST be hard-deleted (with cascading removal of all related data) after 30 days via a scheduled cleanup job. This implements GDPR right to erasure.
- **NFR-010**: Match score recomputation after watchlist import MUST run asynchronously (queued background job) to avoid blocking the import response. At MVP scale (≤10K users), a simple in-process async task is sufficient; a dedicated job queue (e.g., BullMQ) is not required until scale demands it.

**Legal & Compliance**

- **NFR-011**: A plain-language privacy policy and terms of service MUST be drafted and hosted at `/privacy` and `/terms` before public launch. The onboarding consent gate (FR-002) MUST link to these pages.
- **NFR-012**: GDPR right of access (data export): users MUST be able to request a machine-readable export (JSON) of all their personal data (profile, watchlist, matches, interests) in addition to deletion (FR-003). This MAY be implemented as a manual request flow for MVP (email to support) with a self-service endpoint planned for post-MVP.

## Deployment & Operations

- **DEP-001**: The Next.js web app MUST be deployable to Vercel (primary) or any Node.js 20 LTS Linux host. Vercel is the default deployment target for MVP. The `apps/web` package MUST include a `vercel.json` configuration if needed.
- **DEP-002**: CI pipeline (GitHub Actions) MUST run: typecheck, lint, format check, commitlint, `pnpm audit`, Vitest unit/integration tests, Playwright e2e + axe-core accessibility tests. All checks MUST pass before merge to `main`.
- **DEP-003**: CD pipeline: merges to `main` MUST trigger automatic deployment to the staging environment. Production deployment MUST require manual promotion (e.g., Vercel promote or GitHub environment approval).
- **DEP-004**: Environment management: separate `.env` files for development, staging, and production. Secrets (database URL, OAuth keys, TMDB token, Resend API key, APNs key) MUST be stored in the hosting platform's secret manager (Vercel Environment Variables or equivalent), never committed to the repository.
- **DEP-005**: The production web app MUST be served over HTTPS with a valid SSL certificate on a custom domain. DNS configuration is an operational task, not a code task.
- **DEP-006**: The `quickstart.md` MUST be validated end-to-end from a clean clone as a pre-ship gate (task T100).

## iOS App Store Requirements

- **IOS-001**: App Store Connect metadata MUST be prepared: app name ("Reels"), subtitle, description, keywords, category (Social Networking), primary language (English), screenshots (6.7" and 6.1" iPhones), and age rating questionnaire (17+ — no objectionable content, but dating intent).
- **IOS-002**: The `PrivacyInfo.xcprivacy` manifest MUST declare: collected data types (email, name, age, location, photos, usage data), linked to identity, not used for tracking. Privacy nutrition labels on App Store Connect MUST match.
- **IOS-003**: Apple Developer account, certificates, and provisioning profiles MUST be configured. Push notification entitlement must be enabled for APNs. App ID must be registered.
- **IOS-004**: Account deletion MUST be accessible from within the iOS app (Settings → Delete Account) per Apple’s updated requirements — not only via web.
- **IOS-005**: TestFlight internal testing MUST be configured before App Store submission. At least one full end-to-end pass (sign in → onboard → discover → match) MUST succeed on TestFlight before submitting for review.
