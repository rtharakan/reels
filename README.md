<p align="center">
  <img src="https://img.shields.io/badge/status-beta-orange" alt="Status: Beta" />
  <img src="https://img.shields.io/github/license/rtharakan/reels" alt="MIT License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
</p>

# Reels

**Meet people through the films you love.**

Reels matches people based on their real film taste — not selfies, not bios, not vibes. Link your [Letterboxd](https://letterboxd.com) profile, and we surface the people whose watchlists actually overlap with yours.

---

## Quick Start

```bash
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install
cp .env.example .env
pnpm dev
```

Requires Node.js 20+, pnpm, PostgreSQL, and a [TMDB API token](https://developer.themoviedb.org/docs/getting-started).

## What's Inside

| Package | Description |
|---|---|
| `apps/web` | Next.js 14 web app with tRPC API |
| `packages/matching-engine` | Jaccard overlap + cosine genre similarity scoring |
| `packages/letterboxd-scraper` | Polite Letterboxd profile scraper + TMDB normaliser |
| `packages/shared-types` | TypeScript types used across the monorepo |
| `packages/ui` | Shared design system components |

## Features

- **Letterboxd import** — paste your username, we do the rest
- **Enhanced matching** — 5 scoring signals: liked overlap (30%), high-rated overlap (25%), genre similarity (20%), watched overlap (15%), and watchlist overlap (10%)
- **Daily discover feed** — 10 curated cards per day, no infinite scroll
- **Mutual matches** — see exactly *why* you matched (shared films, genre breakdown)
- **Explore tool** — compare any two profiles publicly, no account needed
- **Dutch cinema dates** — find shared films screening near you

## Documentation

- [Full README](docs/README.md) — architecture, tech stack, matching engine details
- [Contributing Guide](docs/CONTRIBUTING.md) — how to set up, branch, and submit PRs
- [Code of Conduct](docs/CODE_OF_CONDUCT.md)
- [License](LICENSE) — MIT

---

*Film metadata provided by [TMDB](https://www.themoviedb.org/). Watchlist data from [Letterboxd](https://letterboxd.com/). Not affiliated with either service.*
