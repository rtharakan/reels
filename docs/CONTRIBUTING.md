# Contributing to Reels

## Branch Protection

- The `main` branch requires 1 approval and all status checks to pass before merging.
- All PRs must pass CI (typecheck, lint, format check, tests).

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Enforced via commitlint + Husky.

Examples:
- `feat: add discover feed UI`
- `fix: correct match score calculation`
- `docs: update quickstart guide`

## Development Workflow

1. Create a feature branch from `main`
2. Make changes with conventional commit messages
3. Open a PR using the PR template
4. Ensure all CI checks pass
5. Get 1 approval, then merge
