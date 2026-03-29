# Contributing to Reels

Thanks for wanting to help build Reels. Whether you're fixing a bug, improving docs, or tackling something bigger — we appreciate it.

## Ground Rules

- Be kind. Read the [Code of Conduct](CODE_OF_CONDUCT.md) first.
- Keep PRs focused. One change per pull request.
- Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org/).

## Getting Set Up

```bash
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install
cp .env.example .env   # fill in your values
pnpm dev
```

You'll need Node.js 20+, pnpm, and a running PostgreSQL instance. See the [quickstart guide](../specs/001-reels-platform-mvp/quickstart.md) for full setup details.

## Development Workflow

1. **Fork** the repository and clone your fork.
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes.** Run checks before committing:
   ```bash
   pnpm typecheck   # TypeScript compilation
   pnpm lint         # ESLint
   pnpm format:check # Prettier
   pnpm test         # Vitest (where applicable)
   ```
4. **Commit** with a conventional message:
   ```
   feat: add genre breakdown to match detail page
   fix: handle empty watchlist on profile page
   docs: clarify TMDB API token setup
   ```
   Commitlint + Husky will reject non-conforming messages automatically.
5. **Push** and open a PR against `main`.

## Pull Request Guidelines

- Use the PR template (it's loaded automatically).
- Describe *what* changed and *why*.
- If your PR touches UI, include a screenshot or short recording.
- Make sure all CI checks pass before requesting review.

## Branch Protection

The `main` branch is protected:
- Requires at least 1 approval.
- All status checks (typecheck, lint, tests) must pass.
- No direct pushes — everything goes through a PR.

## Project Structure at a Glance

| Area | Location | Notes |
|---|---|---|
| Web app | `apps/web/` | Next.js 14, tRPC, Prisma |
| Matching engine | `packages/matching-engine/` | Jaccard + cosine similarity |
| Letterboxd scraper | `packages/letterboxd-scraper/` | Cheerio, TMDB normalisation |
| Shared types | `packages/shared-types/` | TypeScript interfaces |
| UI components | `packages/ui/` | Tailwind + shadcn primitives |

## What's a Good First Contribution?

- Fix any issue labelled `good first issue`.
- Improve accessibility: add missing `aria-` attributes, check contrast ratios, test keyboard navigation.
- Write or improve tests for existing packages.
- Improve documentation or fix typos.

## Reporting Bugs

Open an issue with:
- Steps to reproduce.
- What you expected to happen.
- What actually happened.
- Your environment (OS, Node version, browser).

## Questions?

Open a discussion or reach out in an issue. There are no stupid questions.
