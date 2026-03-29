# Reels — Film-Driven Social Matching Platform

A social matching platform that connects people through their film taste. Import your Letterboxd watchlist, get matched with others who share your cinematic preferences, and discover new connections.

## Quick Start

```bash
pnpm install
cp .env.example .env
# Fill in your .env values
pnpm dev
```

See [quickstart guide](specs/001-reels-platform-mvp/quickstart.md) for full setup instructions.

## Architecture

- **apps/web** — Next.js 14 App Router + tRPC API
- **packages/shared-types** — Shared TypeScript types
- **packages/matching-engine** — Film taste matching algorithm
- **packages/letterboxd-scraper** — Letterboxd watchlist scraper
- **packages/ui** — Shared UI components

## Tech Stack

- TypeScript, Next.js 14, tRPC v11, Prisma, PostgreSQL
- BetterAuth (authentication), Tailwind CSS
- Turborepo (monorepo management)

## License

MIT — see [LICENSE](docs/LICENSE)
