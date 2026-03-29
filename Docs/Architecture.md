# Architecture Overview

## High-Level Structure

Reel is a SwiftUI iOS application built with MVVM + Feature Modules.

```
┌─────────────────────────────────────────────────────────┐
│                      SwiftUI Views                       │
│  (DiscoveryView, ProfileCreationView, MessagingView …)  │
└──────────────────────────┬──────────────────────────────┘
                           │ @StateObject / @ObservedObject
┌──────────────────────────▼──────────────────────────────┐
│                     ViewModels                           │
│  (DiscoveryViewModel, ProfileCreationViewModel …)        │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
┌──────────▼───────────┐     ┌─────────────▼──────────────┐
│      Core             │     │      Networking             │
│  MatchingEngine       │     │  NetworkClient              │
│                       │     │  LetterboxdService          │
└───────────────────────┘     └────────────────────────────┘
           │                               │
┌──────────▼───────────────────────────────▼──────────────┐
│                      Models                              │
│  User · Film · Match · Message                           │
└─────────────────────────────────────────────────────────┘
```

---

## Feature Modules

Each feature lives under `Features/<Name>/` and contains:

```
Features/Auth/
├── Views/
│   └── SignInView.swift          # SwiftUI view
└── ViewModels/
    └── SignInViewModel.swift     # ObservableObject
```

Features own their views and view-models. They communicate with the
rest of the app via shared `Models` and `Core` services — never by
importing each other directly.

---

## Data Flow

```
View → ViewModel (via @StateObject)
ViewModel → Service (async/await)
Service → Models (Codable structs)
Models → View (via @Published)
```

---

## Backend

| Concern       | Technology              |
|---------------|-------------------------|
| Auth          | Firebase Authentication |
| Database      | Cloud Firestore         |
| Matching      | Cloud Functions         |
| Image hosting | Kingfisher + remote URL |

---

## Phase 2 — Theatrical Date Matching

When a matched pair shares a film currently in theatres, the system
surfaces a "See it together?" prompt. This requires:

- A theatrical listings API (e.g. Showtimes API or similar)
- A `TheatreSession` model (`film`, `cinema`, `showtime`)
- Cloud Function to detect overlap between match and live listings
- Push notification via Firebase Cloud Messaging

The architecture accommodates this without breaking Phase 1: add a
`TheatricalMatching` feature module that reads existing `Match` and
`Film` models.
