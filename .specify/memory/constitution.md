<!--
  Sync Impact Report
  ==================================================
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (first version)
  Added sections:
    - Core Principles (7 principles)
    - Data Ethics & Scraping Policy
    - Development Workflow & Quality Gates
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section present)
    - .specify/templates/spec-template.md — ✅ compatible (requirements/success criteria align)
    - .specify/templates/tasks-template.md — ✅ compatible (phase structure supports principle-driven tasks)
  Follow-up TODOs: None
  ==================================================
-->

# ReelMatch Constitution

## Core Principles

### I. Accessibility-First Design (NON-NEGOTIABLE)

- Every user-facing feature MUST meet WCAG 2.1 Level AA compliance
  before it is considered complete.
- Web UI MUST support keyboard navigation, screen readers, and
  sufficient color contrast ratios (minimum 4.5:1 for normal text).
- iOS app MUST use semantic SwiftUI accessibility modifiers
  (`accessibilityLabel`, `accessibilityHint`, `accessibilityValue`)
  on all interactive elements.
- Motion and animation MUST respect the user's `prefers-reduced-motion`
  setting on web and `UIAccessibility.isReduceMotionEnabled` on iOS.
- All images (film posters, avatars) MUST have meaningful alt text.
- Touch targets MUST be at minimum 44×44 points (Apple HIG).
- Rationale: A film community platform MUST be usable by everyone,
  including users with visual, motor, or cognitive disabilities.

### II. Privacy by Design

- The system MUST collect only the minimum data required to deliver
  each feature. No speculative data hoarding.
- Letterboxd scraping MUST be limited to publicly available data only.
  The system MUST NOT attempt to bypass login walls or access
  private profiles.
- Users MUST be able to delete their account and all associated data
  at any time (GDPR Article 17 — Right to Erasure).
- Personal data MUST be encrypted at rest and in transit.
- The privacy policy MUST be written in plain language and presented
  during onboarding before any data collection occurs.
- Third-party API keys and secrets MUST NOT be committed to source
  control or exposed in client-side bundles.
- Rationale: Trust is the foundation of a social platform. Users
  share taste data; the system must treat that data with care.

### III. Ethical UX — No Dark Patterns

- The platform MUST NOT employ infinite scroll addiction loops,
  manipulative notification patterns, or deceptive UI (confirmed
  shaming, hidden opt-outs, disguised ads).
- The Discover feed MUST have a clear, finite end per session.
  Users MUST NOT be nudged to continue swiping once they have
  reviewed available matches.
- Matching algorithms MUST be transparent: users SHOULD be able to
  understand why they were matched (shared films, genre overlap).
- Block and report functionality MUST be accessible within two taps
  from any user profile.
- Rationale: The PRD explicitly states "no algorithmic addiction
  loops" and "no dark patterns." This is a constitutional mandate.

### IV. Type-Safe End-to-End

- TypeScript MUST be used across all web packages (frontend, backend,
  shared types, configuration).
- `strict` mode MUST be enabled in every `tsconfig.json`. The `any`
  type MUST NOT be used except when interfacing with untyped
  third-party libraries, and each such use MUST include a comment
  explaining why.
- API contracts between frontend and backend MUST be enforced via
  tRPC — no hand-written REST types.
- iOS ↔ API communication MUST use Codable models that mirror the
  tRPC response shapes, validated by shared JSON schema or contract
  tests.
- Prisma schema MUST be the single source of truth for database
  types, auto-generated into TypeScript.
- Rationale: End-to-end type safety eliminates an entire class of
  runtime bugs and is an explicit engineering constraint in the PRD.

### V. Security by Default

- Authentication MUST use industry-standard protocols (OAuth 2.0,
  OpenID Connect) via BetterAuth or NextAuth. Custom auth schemes
  are prohibited.
- All user input MUST be validated and sanitized at system boundaries
  (API endpoints, form submissions) to prevent injection attacks
  (SQL, XSS, command injection).
- API endpoints MUST enforce authorization checks. No endpoint may
  rely solely on client-side access control.
- Dependencies MUST be audited for known vulnerabilities on every CI
  run (`pnpm audit`). Critical/high vulnerabilities MUST be resolved
  before merge.
- Rate limiting MUST be applied to authentication endpoints and
  scraping-trigger endpoints to prevent abuse.
- Apple App Store requirements MUST be met: privacy manifest,
  proper permission prompts, account deletion capability.
- Rationale: A dating-adjacent platform handles sensitive personal
  data. Security failures erode trust and invite regulatory action.

### VI. Modular & Open Architecture

- The monorepo MUST follow the defined structure: `/apps` for
  deployable applications, `/packages` for shared libraries,
  `/docs` for documentation.
- Each package MUST be independently buildable and testable via
  Turborepo pipelines.
- No package may import from another package's internal modules —
  only from its public API (package entry point).
- The project MUST NOT introduce hard vendor lock-in. Infrastructure
  choices (Vercel, Supabase, Cloudflare) MUST be abstracted behind
  service interfaces so alternatives can be substituted.
- Licensing MUST be MIT or Apache 2.0. All dependencies MUST have
  compatible open-source licenses.
- Required repository files: `README.md`, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `LICENSE`.
- Rationale: Open-source readiness and modularity are explicit PRD
  requirements. Vendor independence ensures long-term viability.

### VII. Inclusive Community Standards

- The `CODE_OF_CONDUCT.md` MUST be enforced and referenced in
  contribution guidelines.
- User-generated content (bios, prompts) MUST be subject to
  moderation policies. Report mechanisms MUST be prominent.
- The platform MUST support internationalization (i18n) readiness:
  no hard-coded user-facing strings; all text MUST be extractable
  for future localization.
- Design MUST avoid cultural assumptions in matching algorithms —
  film taste is the signal, not demographic proxies.
- Age rating (17+) MUST be declared for App Store submission given
  the social/dating nature of the platform.
- Rationale: A responsible social platform must actively cultivate
  a safe, welcoming environment for its diverse user base.

## Data Ethics & Scraping Policy

- Letterboxd data scraping MUST respect `robots.txt` directives and
  implement polite crawling (reasonable delays between requests,
  proper User-Agent identification).
- Scraped data MUST be normalized through the TMDB API for
  canonical film identification. Raw scraped data MUST NOT be stored
  longer than necessary for normalization.
- If Letterboxd introduces an official API or explicitly prohibits
  scraping, the project MUST migrate to the sanctioned method or
  cease data collection within 30 days.
- TMDB API usage MUST comply with TMDB's terms of service,
  including proper attribution.
- User consent for watchlist import MUST be obtained explicitly
  during the onboarding flow — no background scraping without
  user initiation.

## Development Workflow & Quality Gates

- All code changes MUST be submitted via pull request with at least
  one approval before merge.
- CI pipeline MUST pass the following gates before merge:
  - TypeScript compilation with zero errors (`tsc --noEmit`)
  - ESLint with zero errors (warnings allowed but tracked)
  - Prettier formatting check
  - `pnpm audit` with no critical/high vulnerabilities
  - All existing tests pass
- Accessibility MUST be validated in CI where tooling permits
  (e.g., `axe-core` for web components).
- Commit messages MUST follow Conventional Commits format
  (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
- Environment variables MUST be documented in `.env.example` and
  MUST NOT contain real secrets.

## Governance

- This constitution supersedes all other development practices and
  guidelines. When a conflict arises between this constitution and
  any other document, this constitution prevails.
- Amendments require:
  1. A written proposal describing the change and its rationale.
  2. Review and approval by the project maintainer(s).
  3. A migration plan for any existing code affected by the change.
  4. Version increment following semantic versioning:
     - MAJOR: Principle removal or backward-incompatible redefinition.
     - MINOR: New principle or materially expanded guidance.
     - PATCH: Clarifications, wording, or non-semantic refinements.
- Compliance review: every pull request MUST include a self-check
  confirming no constitutional violations. Reviewers MUST verify
  compliance as part of the review process.
- Runtime development guidance is maintained in project documentation
  (`/docs` and `.specify/` artifacts). When guidance conflicts with
  this constitution, escalate to the maintainer for resolution.

**Version**: 1.0.0 | **Ratified**: 2026-03-29 | **Last Amended**: 2026-03-29
