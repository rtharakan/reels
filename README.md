<p align="center">
  <img src="https://img.shields.io/badge/status-v1.2-brightgreen" alt="Status: v1.2" />
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
| `apps/ios` | SwiftUI native iOS app |
| `apps/android` | Kotlin + Jetpack Compose Android app |
| `packages/matching-engine` | Jaccard overlap + cosine genre similarity scoring |
| `packages/letterboxd-scraper` | Polite Letterboxd profile scraper + TMDB normaliser |
| `packages/shared-types` | TypeScript types used across the monorepo |
| `packages/ui` | Shared design system components |

## Features

- **Letterboxd import** — paste your username, we do the rest
- **Enhanced matching** — 5 scoring signals: liked overlap (30%), high-rated overlap (25%), genre similarity (20%), watched overlap (15%), and watchlist overlap (10%)
- **Daily discover feed** — 10 curated cards per day, no infinite scroll
- **Mutual matches** — see exactly *why* you matched (shared films, genre breakdown)
- **Explore tool** — compare any two profiles publicly using the same 5-signal scoring, no account needed
- **Scan agent** — discover similar Letterboxd profiles based on taste analysis
- **Dutch cinema dates** — find shared films screening near you, grouped by film and date
- **Warm neutral UI** — terracotta accent, sage secondary, dark mode, skeleton loading states
- **Multi-language** — full English and Dutch (NL) translations with in-app language toggle
- **Native mobile apps** — iOS (SwiftUI) and Android (Jetpack Compose) with matching design system

### v1.2 Changelog

- **Homepage showtimes** — pre-fetches all city screenings once, instant client-side fuzzy matching (no more per-click API calls)
- **Poster reliability** — `unoptimized` on all external Image components, TMDB-first poster strategy, XSS-safe error fallbacks
- **Scan agent** — handles Cloudflare challenges on Letterboxd; uses film pages + watchlist fallback for user discovery
- **Security hardening** — HSTS header, XSS fixes (innerHTML → textContent), production auth guard, rate-limited now-playing, photo URL validation, region param validation
- **Showtimes UX** — proper ticket links (no more `href="#"`), loading states for city screening data
- **Explore fallback** — interest-based date ideas when no shared watchlist films exist
- **i18n system** — lightweight React context provider with EN/NL toggle and localStorage persistence
- **iOS app** — full SwiftUI app with auth, onboarding, discover, matches, profile, safety + Dutch localization
- **Android app** — full Kotlin/Compose app with Material3, Hilt DI, Retrofit, identical feature set + Dutch strings
- **Branch cleanup** — three clean branches: `main` (web), `ios/v1.2-app`, `android/v1.2-app`

## Mobile Apps

### iOS
On the `ios/v1.2-app` branch. Requires Xcode 15+ and iOS 17+.

### Android
On the `android/v1.2-app` branch. Requires Android Studio Hedgehog+ and API 26+.

## Documentation

- [Full README](docs/README.md) — architecture, tech stack, matching engine details
- [Contributing Guide](docs/CONTRIBUTING.md) — how to set up, branch, and submit PRs
- [Code of Conduct](docs/CODE_OF_CONDUCT.md)
- [License](LICENSE) — MIT

---

*Film metadata provided by [TMDB](https://www.themoviedb.org/). Watchlist data from [Letterboxd](https://letterboxd.com/). Not affiliated with either service.*
