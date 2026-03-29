# Reel — iOS App

A film-centric social matching platform for iOS. Connect with people who share your taste in film.

[![Build](https://github.com/rtharakan/reels/actions/workflows/ci.yml/badge.svg)](https://github.com/rtharakan/reels/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Reel connects people through shared taste in film. Users link their [Letterboxd](https://letterboxd.com) accounts and are matched with others based on watchlist overlap, genre affinity, and film preferences.

**Stack:** Swift 5.10 · SwiftUI (iOS 17+) · Firebase · SPM

---

## Project Structure

```
reel-ios/
├── App/                  # App entry point, scene delegates
├── Core/                 # Shared business logic (matching engine, utilities)
├── Features/             # Feature modules
│   ├── Auth/             # Apple Sign-In flow
│   ├── Profile/          # Profile creation & editing
│   ├── Discovery/        # Swipe / discovery feed
│   ├── Matching/         # Match presentation
│   └── Messaging/        # In-app chat
├── DesignSystem/         # Reusable UI components
├── Networking/           # API clients (Letterboxd, Firebase)
├── Models/               # Data models
├── Resources/            # Assets, localisation
├── Tests/
│   ├── Unit/             # Unit tests (matching algorithm, etc.)
│   └── UI/               # UI tests (onboarding, swipe flow)
├── Scripts/              # Build & utility scripts
├── Docs/                 # Architecture & contribution docs
├── Config/               # Environment xcconfig files
├── Package.swift         # Swift Package Manager manifest
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Requirements

| Tool    | Version  |
|---------|----------|
| Xcode   | 15+      |
| iOS     | 17+      |
| Swift   | 5.10+    |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rtharakan/reels.git
cd reels
```

### 2. Install dependencies

Dependencies are managed via Swift Package Manager. Open `Package.swift` in Xcode or run:

```bash
swift package resolve
```

### 3. Configure environment

Copy the example config and fill in your keys:

```bash
cp Config/Dev.xcconfig.example Config/Dev.xcconfig
cp Config/Prod.xcconfig.example Config/Prod.xcconfig
```

Required values:
- `FIREBASE_API_KEY`
- `LETTERBOXD_BASE_URL`

### 4. Open in Xcode

```bash
open Package.swift
```

Set the scheme to **Reel (Dev)** and run on a simulator or device.

---

## Architecture

Reel follows **MVVM + Feature Modules**:

- Each feature (`Auth`, `Profile`, `Discovery`, `Matching`, `Messaging`) is a self-contained module with its own `View`, `ViewModel`, and service layer.
- `Core` contains shared business logic (e.g. `MatchingEngine`).
- `DesignSystem` contains stateless, reusable SwiftUI components.
- `Networking` contains API clients and data fetching logic.
- `Models` contains plain data types shared across modules.

See [`Docs/Architecture.md`](Docs/Architecture.md) for full details.

---

## Key Features (v1)

- **Apple Sign-In** — Required for App Store compliance
- **Letterboxd Integration** — Fetch and cache public watchlists
- **Matching Algorithm** — Score compatibility by watchlist overlap and genre affinity
- **Swipe Interface** — Card-based discovery feed
- **Messaging** — Simple in-app chat after a mutual match

---

## Testing

```bash
swift test
```

Unit tests cover the matching algorithm. UI tests cover onboarding and the swipe flow.

---

## CI / CD

GitHub Actions runs on every push and pull request:

- **Build check** — `swift build`
- **Test suite** — `swift test`
- **Linting** — SwiftLint

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Privacy & Compliance

Before App Store submission the following must be in place:

- Privacy Policy URL
- Terms of Service
- Data usage disclosure
- Account deletion flow
- Report / block user functionality

---

## License

MIT © 2026 Robin Zachariah Tharakan — see [LICENSE](LICENSE).
