# Contributing to Reel

Thank you for your interest in contributing! This document outlines the process for contributing to the project.

---

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment of any kind will not be tolerated.

---

## Development Setup

1. **Fork** the repository and clone your fork.
2. Follow the [Getting Started](README.md#getting-started) steps in the README.
3. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Branch Naming

| Prefix       | Purpose                          |
|--------------|----------------------------------|
| `feature/`   | New features                     |
| `fix/`       | Bug fixes                        |
| `chore/`     | Tooling, CI, refactoring         |
| `docs/`      | Documentation-only changes       |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Letterboxd username validation
fix: correct match score calculation
docs: update architecture overview
chore: bump SwiftLint to 0.55
```

---

## Pull Requests

1. Keep PRs focused — one logical change per PR.
2. Reference the related issue (e.g. `Closes #42`).
3. Ensure all CI checks pass before requesting review.
4. Add or update tests for any new behaviour.
5. Update documentation if you change public APIs or architecture.

---

## Code Style

- Follow Apple's [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/).
- Run SwiftLint locally before pushing:

  ```bash
  swiftlint
  ```

- Use `// MARK: -` sections to organise files.
- Prefer `async/await` over callbacks or Combine where practical.

---

## Testing

- Unit tests live in `Tests/Unit/`.
- UI tests live in `Tests/UI/`.
- Run the full suite with:

  ```bash
  swift test
  ```

New features must include corresponding tests.

---

## Reporting Issues

Use the GitHub Issues tab. Please include:

- iOS / Xcode version
- Steps to reproduce
- Expected vs actual behaviour
- Relevant logs or screenshots

---

## Architecture Questions

See [`Docs/Architecture.md`](Docs/Architecture.md) before making structural changes. For significant architectural decisions, open a GitHub Discussion first.
