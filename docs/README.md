<p align="center">
  <img src="https://img.shields.io/badge/status-beta-orange" alt="Status: Beta" />
  <img src="https://img.shields.io/github/license/rtharakan/reels" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
</p>

# Reels

**Meet people through the films you love.**

Reels is an open-source social platform that matches people based on their actual film taste. Link your [Letterboxd](https://letterboxd.com) profile, and we'll find the people whose watchlists overlap with yours — whether you're looking for friends, a date, or just someone who finally understands why *Stalker* is a masterpiece.

No swiping on selfies. No algorithm-optimized engagement traps. Just shared films, honest compatibility scores, and a daily feed of 10 people worth meeting.

---

## How It Works

1. **Sign up** with email (magic link) or Google/Apple OAuth.
2. **Import your Letterboxd watchlist** — we scrape your public profile and resolve every film against TMDB for rich metadata.
3. **Get matched** — our engine scores candidates on direct film overlap (70%) and genre similarity (30%).
4. **Browse Discover** — see 10 cards a day, each showing shared films and a compatibility percentage. Express interest or skip.
5. **Mutual match** — when both of you say yes, you're connected. See exactly *why* you matched: shared films, genre tendencies, the works.

There's also an **Explore** page (no account needed) where you can compare any two Letterboxd profiles head-to-head — complete with cinema showtime suggestions for cities across the Netherlands.

---

## Try It Locally

```bash
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install
cp .env.example .env   # then fill in your secrets
pnpm dev               # starts web app at localhost:3000
```

You'll need PostgreSQL running and a [TMDB API token](https://developer.themoviedb.org/docs/getting-started). See the [full setup guide](../specs/001-reels-platform-mvp/quickstart.md) if you get stuck.

---

## Project Structure

This is a [Turborepo](https://turbo.build/) monorepo managed with pnpm workspaces.

```
reels/
├── apps/
│   └── web/              → Next.js 14 App Router + tRPC API + Prisma
├── packages/
│   ├── matching-engine/  → Film overlap + genre similarity scoring
│   ├── letterboxd-scraper/ → Polite Letterboxd profile scraper
│   ├── shared-types/     → TypeScript types shared across apps
│   └── ui/               → Design system components (Tailwind + shadcn)
├── specs/                → Feature specifications and design docs
└── docs/                 → README, Contributing, License, Code of Conduct
```

### Key Directories in `apps/web/`

| Path | What lives here |
|---|---|
| `src/app/(auth)/` | Login, signup, magic-link pages |
| `src/app/onboarding/` | Multi-step onboarding flow (privacy → profile → watchlist → top films) |
| `src/app/(main)/` | Discover feed, Matches list, Profile management |
| `src/app/explore/` | Public profile comparison tool (no auth required) |
| `src/server/routers/` | tRPC API routers (user, watchlist, discover, match, safety, device) |
| `src/server/services/` | Business logic (import, scoring, feed generation, matching) |
| `prisma/schema.prisma` | Database schema |

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Server components, streaming, file-based routing |
| **API** | tRPC v11 | End-to-end type safety, no code generation |
| **Database** | PostgreSQL + Prisma | Relational data with excellent DX |
| **Auth** | BetterAuth | Magic links, OAuth (Google/Apple), JWT sessions |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first with accessible, composable components |
| **Monorepo** | Turborepo + pnpm workspaces | Fast builds, dependency hoisting, parallel tasks |
| **Film Data** | Letterboxd (scraping) + TMDB API | Watchlists from Letterboxd, metadata from TMDB |

---

## The Matching Engine

The matching engine lives in `packages/matching-engine/` and computes a compatibility score between two users:

- **Film overlap (70% weight)** — Jaccard similarity over each user's watchlist film set.
- **Genre similarity (30% weight)** — Cosine similarity over normalised genre frequency vectors.

A minimum of 5 films per user is required before matching kicks in. Scores range from 0 to 1. The Discover feed ranks candidates by this score and filters out already-seen users, blocked users, and intent-incompatible profiles.

---

## Contributing

We'd love help — whether it's fixing a typo, improving accessibility, or building a whole new feature.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. The short version:

1. Fork the repo and create a branch from `main`.
2. Write clear, conventional commit messages (`feat:`, `fix:`, `docs:`, etc.).
3. Make sure `pnpm typecheck` and `pnpm lint` pass.
4. Open a pull request using the PR template.

All contributions must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Roadmap

- [x] Web MVP — onboarding, discover, matches, profile, safety
- [x] Explore tool — public profile comparison + Dutch cinema date planner
- [ ] Visual polish — refined color palette, poster fidelity
- [ ] iOS app — native SwiftUI client with push notifications
- [ ] Rate limiting and production hardening
- [ ] GDPR data export and scheduled cleanup
- [ ] App Store submission

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Reels uses data from [TMDB](https://www.themoviedb.org/) and [Letterboxd](https://letterboxd.com/). We are not endorsed by or affiliated with either service. Film metadata is provided by TMDB.*
