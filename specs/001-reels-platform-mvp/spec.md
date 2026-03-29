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
3. **Given** a user in onboarding, **When** they enter an invalid or private Letterboxd username, **Then** the system displays a clear error explaining the username was not found or the profile is private, and allows retry.
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

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Accounts**

- **FR-001**: System MUST support account creation via OAuth (Google, Apple) and email magic links.
- **FR-002**: System MUST present the privacy policy in plain language during onboarding before any data collection beyond authentication.
- **FR-003**: Users MUST be able to delete their account and all associated data at any time (GDPR compliance).
- **FR-004**: System MUST support Apple Sign-In on the iOS app.
- **FR-004a**: Authentication sessions MUST use short-lived JWT access tokens (≤15 min expiry) paired with refresh tokens (≤7 days expiry). Access tokens MUST be stored in httpOnly secure cookies on web and in the iOS Keychain on mobile. Refresh tokens MUST be rotated on each use.

**Profile**

- **FR-005**: Users MUST provide a display name, age, location, bio, at least one conversation prompt, and a Letterboxd username during onboarding.
- **FR-006**: Users MUST be able to select up to 4 "top films" for their profile (auto-populated from their watchlist or manually chosen).
- **FR-007**: Users MUST be able to upload profile photos.
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
- **FR-015**: Scraping MUST respect `robots.txt` directives and implement polite crawling (reasonable delays, proper User-Agent identification).

**Matching**

- **FR-015a**: A user MUST have at least 5 resolved films in their watchlist to be eligible for matching and to appear in the Discover feed.
- **FR-016**: System MUST compute a match score between users based on overlapping films in their watchlists. The match score MUST weight direct film overlap at 70% and genre similarity at 30%.
- **FR-017**: Match scoring MUST also factor in genre similarity across watchlists. Genre similarity is computed from the aggregate genre distribution of each user's resolved watchlist films.
- **FR-018**: Matching algorithm MUST be transparent — users MUST be able to see why they matched (shared films, genre overlap).
- **FR-019**: A match is created only when both users have expressed mutual interest.

**Discover Feed**

- **FR-020**: System MUST present a card-based Discover feed showing potential matches ranked by overlap score.
- **FR-021**: Each Discover card MUST display the other user's profile preview, shared film count, and shared film posters.
- **FR-022**: The Discover feed MUST have a finite end per session — no infinite scroll. A session serves a maximum of 10 Discover cards per day.
- **FR-022a**: The daily Discover card allocation MUST reset at midnight in the user's local time zone. Previously seen/skipped users MUST NOT reappear unless re-imported into the eligible pool (e.g., after the other user re-imports a significantly changed watchlist).
- **FR-023**: Users MUST NOT be nudged to continue once they have reviewed available matches.

**Safety & Moderation**

- **FR-024**: Users MUST be able to block another user within two taps from any profile or Discover card.
- **FR-025**: Users MUST be able to report another user with a reason, within two taps from any profile or Discover card.
- **FR-026**: Blocking a user MUST remove them from the blocker's Discover feed, match list, and all future interactions.
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

- **SC-001**: Users can complete the full sign-up and onboarding flow (account creation through watchlist import confirmation) in under 5 minutes.
- **SC-002**: 90% of users with public Letterboxd watchlists have their films successfully imported and resolved on the first attempt.
- **SC-003**: The Discover feed loads and displays the first match card within 2 seconds of opening.
- **SC-004**: Users can understand why they were matched with another user (shared films and genre signals are visible on every match).
- **SC-005**: Block and report actions are reachable within 2 taps from any user profile or Discover card.
- **SC-006**: The platform supports at least 10,000 registered users without degradation in the Discover or matching experience.
- **SC-007**: 7-day retention rate exceeds 40% among users who complete onboarding.
- **SC-008**: Match rate (percentage of users who receive at least one mutual match within their first week) exceeds 25%.
- **SC-009**: All web pages score 90+ on accessibility audits.
- **SC-010**: iOS app achieves App Store approval on the first submission.

## Assumptions

- Users have a public Letterboxd profile with at least some films in their watchlist. Users with private profiles or empty watchlists will receive guidance but cannot be matched until they make data available.
- Letterboxd does not currently offer a public API; the system will scrape public pages. If Letterboxd introduces an official API or explicitly prohibits scraping, the project will migrate within 30 days per the constitution's Data Ethics policy.
- The canonical film metadata service (e.g., TMDB) provides sufficient coverage to resolve the vast majority of films found on Letterboxd watchlists.
- The web application is the primary platform for Phase 1 (MVP). The iOS app (Phase 2) achieves full feature parity with the web.
- The "Date Engine" (suggesting in-theater screenings for matched users) is Phase 3 and explicitly out of scope for this specification.
- Chat between matched users is out of scope for MVP. Matches are surfaced but real-time messaging is deferred.
- No paid features or monetization for the initial release.
- Dark mode is the default visual theme, consistent with the film-first aesthetic described in UX principles.
- The target audience is 20–35 year old, culturally engaged, urban Letterboxd users. The platform enforces a 17+ age rating for App Store compliance.
- Short-lived JWT access tokens (15 min) with rotating refresh tokens (7 days) are used for session management. Web stores tokens in httpOnly secure cookies; iOS stores them in the Keychain.
- Performance targets follow standard web and mobile app expectations unless a specific metric is called out in Success Criteria.
