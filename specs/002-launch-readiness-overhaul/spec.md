# Feature Specification: Product Launch Readiness Overhaul

**Feature Branch**: `002-launch-readiness-overhaul`  
**Created**: 1 April 2026  
**Status**: Draft  
**Input**: User description: "The product launch failed. The main reason is that the product was not fully ready, there were performance issues, security flaws, and features that do not work. Resolve and ensure the product is launched immediately. Five core workstreams: Picker feature, navigation consistency, Easter Egg feature, Dutch localization with icon/naming overhaul, and full QA/deployment."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Group Cinema Trip Planning via Picker (Priority: P1)

A group of friends wants to go to the cinema together. One person opens the Picker feature and creates a new cinema plan. They have two pathways:

**Pathway A — Choose a Film First**: The organizer selects a film from search results or their watchlist. The system presents available showtimes across nearby cinemas for that film. The organizer shares a voting link with friends. Each participant marks which showtimes work for them (similar to When2Meet/Doodle). The group converges on the best time slot that works for most people.

**Pathway B — Provide Date, Film & Cinema**: The organizer already knows which film, cinema, and approximate date they want. They enter these details and the system shows showtimes available on that day at that cinema. Participants vote on the specific showtime.

In both cases, the experience ends with a confirmed showtime that the group has agreed on, displayed as a shareable summary card.

**Why this priority**: This is a brand-new, high-value social feature that differentiates Reels from other film platforms. Group cinema planning is a core unmet need for the target audience (millennials and Gen-Z). It drives engagement, viral sharing, and real-world activity.

**Independent Test**: Can be fully tested by creating a Picker plan, sharing the link, having participants vote on showtimes, and confirming the final selection. Delivers concrete value: a coordinated cinema outing.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the Picker page, **When** they choose "Pick a Film" and search for a movie title, **Then** the system displays matching films with poster art and release info
2. **Given** a user has selected a film, **When** they proceed to showtime selection, **Then** the system displays available showtimes grouped by cinema and date within a reasonable radius
3. **Given** an organizer has selected showtimes, **When** they create the plan, **Then** a unique shareable link is generated that can be sent to friends
4. **Given** a participant opens the shared link (logged in or guest), **When** they view the plan, **Then** they see the film details and a grid of available showtimes to vote on
5. **Given** multiple participants have voted, **When** the organizer views the results, **Then** they see a heat-map or tally of availability showing the best overlapping time slots
6. **Given** an organizer views the results, **When** they confirm a showtime, **Then** all participants receive notification of the final plan with cinema, date, time, and film details
7. **Given** a user chooses "I know what I want" (Pathway B), **When** they enter a date, film, and cinema, **Then** the system displays only showtimes matching those criteria for voting
8. **Given** a Picker plan exists, **When** any participant revisits the plan link, **Then** they see the current state (voting in progress or confirmed)

---

### User Story 2 - Consistent Navigation Across All Pages (Priority: P1)

A user navigates the product and expects a uniform, responsive navigation experience on every page. The top header with logo, primary nav items, and dropdown menu must appear identically on all routes — authenticated, public, and feature pages alike. The dropdown sub-menu must be scrollable when content overflows, appear as a clean overlay above page content, and function correctly on desktop and mobile viewports. Every page must be fully responsive and work well on phone browsers (separate from the native iOS/Android apps).

**Why this priority**: Broken or inconsistent navigation was cited as a reason the product launch failed. Users lose trust when menus behave differently on different pages. This is a blocking issue for launch.

**Independent Test**: Can be tested by visiting every route in the product on desktop and mobile viewports, verifying the header renders identically, all nav links work, and the dropdown menu opens/scrolls/closes correctly on each page.

**Acceptance Scenarios**:

1. **Given** any authenticated page (Discover, Matches, Profile, Explore, Scan, Buddy, Plan, Picker, Settings), **When** the page loads, **Then** the navigation header appears with identical layout, icons, and behavior
2. **Given** the nav menu contains more items than fit on screen, **When** the user opens the dropdown, **Then** it appears as an overlay with vertical scroll, not pushing page content down
3. **Given** any page on a mobile viewport (320px–768px), **When** the user taps the menu, **Then** the mobile menu opens smoothly, all items are reachable by scrolling, and dismisses on tap-outside or back gesture
4. **Given** public pages (Explore, Scan, About, Help, Privacy, Terms), **When** a non-logged-in user visits, **Then** an appropriate navigation header appears with links to public features and auth options
5. **Given** any page with interactive content, **When** the user scrolls down and then opens the nav menu, **Then** the dropdown overlay appears anchored to the header and does not shift with scroll position

---

### User Story 3 - Easter Egg Feature: Mood Reels (Priority: P1)

After careful analysis of the full product, the recommended Easter Egg feature is **Mood Reels** — a feature that matches users to films and to each other based on their current emotional state and viewing mood. Here is the concept:

A user is feeling a certain way — nostalgic, adventurous, heartbroken, hype, chill — and wants a film recommendation that matches that mood. They open Mood Reels and select their current vibe from a visual, emoji-rich mood selector. The system cross-references their mood with their taste profile (watchlist, liked films, genre preferences) and surfaces personalized film suggestions. More powerfully, it shows other Reels users who are in the same mood right now, creating spontaneous "mood-matched" connections — a serendipitous way to discover both films and people. This feature is labelled as an Easter Egg (beta) and positioned as experimental.

**Why this priority**: This feature transforms Reels from a utility ("find someone who likes the same films") into an emotional experience ("find your vibe tribe"). It speaks directly to millennials and Gen-Z who value authenticity, mood-driven content (think Spotify Wrapped, Instagram Stories mood stickers), and serendipitous social connection. It creates daily re-engagement: "What's your mood today?"

**Independent Test**: Can be tested by selecting a mood, receiving film recommendations that match the mood + taste, and seeing other users in the same mood. Delivers value as a standalone discovery and social feature.

**Acceptance Scenarios**:

1. **Given** a logged-in user navigates to Mood Reels, **When** the page loads, **Then** they see a visually engaging mood selector with at least 8 distinct moods represented by icons and colours
2. **Given** a user selects a mood, **When** the system processes their selection, **Then** it displays 5–10 film suggestions tailored to both their chosen mood and their existing taste profile within 3 seconds
3. **Given** film suggestions are displayed, **When** the user views a suggestion, **Then** they see the film poster, title, year, a brief mood-match explanation ("This film matches your nostalgic vibe because..."), and a match-strength indicator
4. **Given** other users have also selected a mood, **When** the user scrolls below film suggestions, **Then** they see a "Mood Twins" section showing other users currently in the same mood, with shared film overlap info
5. **Given** the user views a Mood Twin profile, **When** they express interest, **Then** it follows the same interest/match flow as Discover
6. **Given** the Mood Reels feature page, **When** the user views the header area, **Then** they see a clear "Beta — Easter Egg" badge indicating this feature is experimental and being improved
7. **Given** the user has not set a mood today, **When** they visit the main dashboard, **Then** they see a subtle prompt: "What's your vibe today?" linking to Mood Reels
8. **Given** a returning user, **When** they visit Mood Reels, **Then** they see their mood history and can update their current mood at any time

---

### User Story 4 - Full Dutch Localization and Feature Icon/Naming Consistency (Priority: P1)

Every feature and page in the product must be available in Dutch (Nederlands) with correct grammar, tone, and messaging. Feature naming and iconography must be consistent across all platforms (web, iOS, Android):

| Feature | Icon | English Title | Dutch Title |
| ------- | ---- | ------------- | ----------- |
| Explore | Heart | Match | Match |
| Scan | Scanner | Film Twins | Film Tweelingen |
| Plan | Calendar | Cinema Week | Bioscoop Week |
| Buddy | Popcorn | Buddy | Buddy |
| Picker | Ticket/Group | Picker | Picker |
| Mood Reels | Sparkle/Palette | Mood Reels | Mood Reels |

All UI strings, error messages, form labels, notifications, onboarding copy, and success messages must be translated. Language toggle must be accessible from every page.

**Why this priority**: The product targets a Dutch-speaking audience alongside English speakers. Incomplete or inconsistent translations break user trust and make the product feel unfinished. Consistent icon and naming conventions reduce confusion and improve brand identity.

**Independent Test**: Can be tested by switching to Dutch and navigating every page, verifying all text is translated, icons match the specification, and feature titles are consistent in navigation, page headers, and any references throughout the product.

**Acceptance Scenarios**:

1. **Given** a user sets language to Dutch, **When** they navigate any page, **Then** all visible text (labels, buttons, headings, descriptions, error messages) appears in grammatically correct Dutch
2. **Given** the navigation header, **When** displayed in either language, **Then** each feature shows its designated icon and title per the naming table above
3. **Given** the Picker feature, **When** viewed on web, iOS, and Android, **Then** the icon, title, and all internal copy are consistent across platforms
4. **Given** an error occurs (e.g., network failure, validation error), **When** the user sees the error message, **Then** it is displayed in their selected language
5. **Given** the onboarding flow, **When** completed in Dutch, **Then** every step — privacy consent, profile setup, watchlist import, top films — is fully translated
6. **Given** notification messages (match found, plan confirmed, etc.), **When** received by a Dutch-language user, **Then** they are in Dutch

---

### User Story 5 - Cross-Platform Sync, QA, and Deployment (Priority: P1)

An engineer reviews the entire product across all three deployment targets (web on main branch, iOS on iOS branch, Android on Android branch) and ensures every feature works correctly, performs well, and is free of security vulnerabilities. All branches are in sync: same features, same pages, same data, same behaviour. Automated tests pass. Manual QA confirms no regressions. The product is deployed.

**Why this priority**: The previous launch failed due to performance issues, security flaws, and broken features. Nothing ships until everything works. This is the gate-keeping story that validates all other stories.

**Independent Test**: Can be tested by running the full test suite, performing manual QA on each platform for every feature, verifying branch sync via feature-parity checklist, and successfully deploying to production.

**Acceptance Scenarios**:

1. **Given** the web app on the main branch, **When** all automated tests are run, **Then** 100% pass with no failures or skipped critical tests
2. **Given** the iOS app on the iOS branch, **When** built and run on a simulator and device, **Then** all features work identically to the web app
3. **Given** the Android app on the Android branch, **When** built and run on an emulator and device, **Then** all features work identically to the web and iOS apps
4. **Given** any page or feature, **When** tested for performance, **Then** pages load within 2 seconds on a standard connection and interactions respond within 300ms
5. **Given** the full product, **When** scanned for security vulnerabilities (OWASP Top 10), **Then** no critical or high-severity issues remain
6. **Given** all three branches, **When** compared for feature parity, **Then** every feature, page, icon, title, and translation is present and consistent
7. **Given** all tests and QA pass, **When** the deployment pipeline is triggered, **Then** web deploys from main, iOS submits from iOS branch, and Android submits from Android branch

---

### Edge Cases

- What happens when a Picker plan has zero participants voting? — The plan remains open; organizer sees a prompt to remind friends
- What happens when all showtimes for a Picker plan have passed? — The plan is marked as expired with a prompt to create a new one
- What happens when Mood Reels has no other users in the same mood? — Film suggestions still appear; "Mood Twins" section shows a friendly "You're the first one in this mood today — check back later" message
- What happens when a user switches language mid-session? — All UI text updates immediately without page reload; in-progress forms retain their input values
- What happens when the dropdown menu has more items than the viewport height? — The overlay scrolls internally with a visible scrollbar; it never exceeds 80% of viewport height
- What happens when a translated string is missing in Dutch? — The system falls back to English for that specific string and logs the missing key for developer attention
- What happens when a Picker link is opened by a non-Reels user? — They see the plan details as a guest and can vote without creating an account; a subtle prompt encourages sign-up

## Requirements *(mandatory)*

### Functional Requirements

**Picker Feature**

- **FR-001**: System MUST provide two distinct pathways for creating a cinema plan: "Pick a Film" (film-first) and "I Know What I Want" (date/film/cinema)
- **FR-002**: System MUST allow organizers to search for films by title with results including poster image, year, and synopsis
- **FR-003**: System MUST display available showtimes grouped by cinema and date once a film is selected
- **FR-004**: System MUST generate a unique shareable link for each Picker plan that is accessible to both logged-in users and guests
- **FR-005**: System MUST provide a time-slot voting grid where each participant can mark available/unavailable for each showtime option
- **FR-006**: System MUST display real-time voting results showing participant availability per showtime as a visual heat-map or tally
- **FR-007**: System MUST allow the organizer to confirm a final showtime selection, which locks the plan
- **FR-008**: System MUST notify all plan participants when a showtime is confirmed
- **FR-009**: System MUST display a summary card for confirmed plans showing film, cinema, date, time, and participant list
- **FR-010**: System MUST support the "I Know What I Want" pathway accepting date, film, and cinema as inputs and showing matching showtimes

**Navigation Consistency**

- **FR-011**: System MUST render the same navigation header component on all authenticated pages with identical layout, icons, and behaviour
- **FR-012**: System MUST render an appropriate navigation header on all public pages with links to public features and authentication
- **FR-013**: Navigation dropdown MUST appear as a fixed overlay above page content, not pushing content down
- **FR-014**: Navigation dropdown MUST support vertical scrolling when items exceed available viewport space, capped at 80% of viewport height
- **FR-015**: All pages and features MUST be fully responsive, functioning correctly on viewports from 320px to 2560px wide
- **FR-016**: Mobile navigation (viewports under 768px) MUST use a touch-friendly menu that opens, scrolls, and dismisses cleanly
- **FR-017**: Navigation MUST include all features with their designated icons and titles as specified in the naming convention

**Mood Reels (Easter Egg / Beta)**

- **FR-018**: System MUST provide a mood selector with at least 8 distinct mood options, each represented by a unique icon and colour
- **FR-019**: System MUST generate mood-based film recommendations by cross-referencing the selected mood with the user's taste profile (genres, liked films, watchlist)
- **FR-020**: System MUST display 5–10 personalised film suggestions per mood selection with mood-match explanations
- **FR-021**: System MUST show a "Mood Twins" section displaying other users currently in the same mood with shared film overlap data
- **FR-022**: Mood Reels MUST be clearly labelled with a "Beta — Easter Egg" badge on all surfaces
- **FR-023**: System MUST allow users to update their mood at any time and persist mood history
- **FR-024**: Interest expressed on a Mood Twin MUST follow the same mutual-interest matching flow as Discover

**Localization & Naming**

- **FR-025**: All user-facing text MUST be available in English and Dutch with grammatically correct translations
- **FR-026**: Language selection MUST be accessible from every page via a persistent toggle in the header or footer
- **FR-027**: When language is switched, all visible text MUST update immediately without full page reload
- **FR-028**: Each feature MUST use its designated icon and title consistently across navigation, page headers, and all in-app references (per the naming table in User Story 4)
- **FR-029**: If a translated string is missing, the system MUST fall back to English and log the missing key
- **FR-030**: Notifications, error messages, and system-generated content MUST respect the user's language preference

**QA, Performance & Security**

- **FR-031**: All existing and new features MUST have automated test coverage (unit and integration)
- **FR-032**: Every page MUST load within 2 seconds on a standard broadband connection
- **FR-033**: All interactive elements MUST respond to user input within 300 milliseconds
- **FR-034**: The product MUST pass a security audit covering authentication, authorization, input validation, and data protection aligned with OWASP Top 10
- **FR-035**: All three deployment branches (main, iOS, Android) MUST maintain feature parity: identical features, pages, icons, titles, and translations
- **FR-036**: Automated build and test pipelines MUST pass without failures before any deployment

**Cross-Platform Deployment**

- **FR-037**: The web app MUST be deployable from the main branch
- **FR-038**: The iOS app MUST be deployable from the iOS branch with all features matching web
- **FR-039**: The Android app MUST be deployable from the Android branch with all features matching web and iOS
- **FR-040**: All branch merges MUST preserve feature consistency and not introduce regressions

### Key Entities

- **PickerPlan**: Represents a group cinema outing plan. Key attributes: organizer, film, pathway type (film-first or fully specified), status (voting/confirmed/expired), confirmed showtime, shareable link identifier
- **PickerShowtime**: A candidate showtime option within a plan. Key attributes: cinema name, date, time, film screening reference
- **PickerVote**: A participant's availability vote on a showtime option. Key attributes: participant (user or guest identifier), showtime reference, availability status (available/unavailable)
- **PickerParticipant**: A person participating in a plan. Key attributes: user reference (nullable for guests), display name, joined timestamp
- **UserMood**: A user's current or historical mood selection. Key attributes: user, mood type, selected timestamp, active flag
- **MoodFilmSuggestion**: A film recommended based on mood + taste profile. Key attributes: film, mood type, match explanation, match strength score

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a Picker cinema plan and share it with friends in under 2 minutes
- **SC-002**: 80% of Picker participants can vote on showtimes within 30 seconds of opening the shared link
- **SC-003**: Navigation header renders identically (same layout, icons, behaviour) on 100% of pages across the product, verified by visual regression testing
- **SC-004**: Mobile navigation (phone browsers) scores "usable" on all pages when tested on viewports of 320px, 375px, and 428px widths
- **SC-005**: Mood Reels generates personalised film suggestions in under 3 seconds for 95% of mood selections
- **SC-006**: 100% of user-facing strings are translated into Dutch with zero fallback-to-English occurrences on shipped pages
- **SC-007**: All feature icons and titles match the specification table when verified across web, iOS, and Android
- **SC-008**: Every page loads in under 2 seconds on a 10 Mbps connection, measured by automated performance tests
- **SC-009**: All interactive elements respond within 300ms, verified by interaction timing tests
- **SC-010**: Zero critical or high-severity security vulnerabilities found in pre-launch security scan
- **SC-011**: Automated test suites pass at 100% on all three branches (main, iOS, Android) before deployment
- **SC-012**: Feature parity audit confirms identical features, pages, and translations across all three platform branches
- **SC-013**: Product is successfully deployed: web app live via main branch, iOS submitted from iOS branch, Android submitted from Android branch

## Assumptions

- The existing Letterboxd scraper, matching engine, and authentication system will be reused as-is; no changes to core matching algorithm are needed
- Showtime data for the Picker feature will be sourced from a third-party cinema listings provider or manual entry by the organizer (the system does not need to maintain its own showtimes database initially — organizers can input showtimes manually from cinema websites as an MVP approach)
- The mood-to-film mapping for Mood Reels will use genre tags and existing film metadata (TMDB genres, user ratings, liked films) rather than requiring a new content tagging system
- Guest participation in Picker plans (via shared link) does not require account creation; guests are identified by a display name they provide
- The Android app will need significant development to reach feature parity, as currently only a scaffold exists; Kotlin + Jetpack Compose + Material3 will be used per existing architecture decisions
- The Dutch translations for new features (Picker, Mood Reels) will be authored as part of this specification's implementation, extending the existing i18n system
- Performance and security testing will use standard tooling (Lighthouse for performance, dependency scanning and manual OWASP audit for security)
- The three-branch deployment model (main for web, iOS branch, Android branch) is the established workflow; CI/CD pipelines exist or will be established for each
- "Cinema Week" is a marketing-friendly name for the Plan feature and does not imply the feature is limited to weekly planning
