# tRPC Router Contracts: Reels MVP

**Date**: 2026-03-29 | **Data Model**: [data-model.md](../data-model.md)

These contracts define the public API surface exposed by the Next.js tRPC server. The iOS app and web client both consume these routes.

**Wire format**:
- Queries → `GET /api/trpc/{router}.{procedure}?input={url_encoded_json}`
- Mutations → `POST /api/trpc/{router}.{procedure}` with JSON body
- All responses wrapped in `{ result: { data: T } }` envelope

---

## auth router

> Handled by BetterAuth — mounted at `/api/auth/[...all]/route.ts`. Not a tRPC router, but documented here for completeness.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-in/social` | POST | OAuth sign-in (Google, Apple) |
| `/api/auth/sign-in/magic-link` | POST | Send magic link email |
| `/api/auth/magic-link/verify` | GET | Verify magic link token |
| `/api/auth/sign-out` | POST | Sign out, clear session |
| `/api/auth/get-session` | GET | Get current session |
| `/api/auth/callback/{provider}` | GET | OAuth callback |

---

## user router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `user.me` | query | required | — | `UserProfile` | Get current user's full profile |
| `user.getById` | query | required | `{ userId: string }` | `PublicProfile` | Get another user's public profile |
| `user.completeOnboarding` | mutation | required | `OnboardingInput` | `UserProfile` | Complete onboarding with all required fields |
| `user.updateProfile` | mutation | required | `UpdateProfileInput` | `UserProfile` | Update profile fields (including intent) |
| `user.deleteAccount` | mutation | required | — | `{ success: boolean }` | Soft-delete account + all data |

### Types

```typescript
type Intent = "FRIENDS" | "DATING" | "BOTH";

type UserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  letterboxdUsername: string | null;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
  watchlistCount: number;
  isOnboarded: boolean;
  createdAt: string; // ISO 8601
};

type PublicProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
};

type OnboardingInput = {
  name: string;            // required, 1–50 chars
  age: number;             // required, ≥17
  location: string;        // required, 1–100 chars
  bio: string;             // required, 1–500 chars
  intent: Intent;          // required
  letterboxdUsername?: string; // optional — user may skip watchlist import
  prompts: { question: string; answer: string }[]; // 1–3 entries, answer 1–300 chars
  topFilmIds?: string[];   // optional, max 4
  timezone: string;        // IANA timezone
};

type UpdateProfileInput = Partial<{
  name: string;
  age: number;
  location: string;
  bio: string;
  intent: Intent;
  letterboxdUsername: string;
  prompts: { question: string; answer: string }[];
  topFilmIds: string[];
  profilePhotos: string[];
  timezone: string;
}>;
```

---

## watchlist router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `watchlist.import` | mutation | required | `{ letterboxdUsername: string }` | `ImportResult` | Import/re-import Letterboxd watchlist |
| `watchlist.getMyWatchlist` | query | required | `{ cursor?: string; limit?: number }` | `PaginatedWatchlist` | Get current user's watchlist (paginated) |

### Types

```typescript
type ImportResult = {
  totalScraped: number;     // Films found on Letterboxd
  totalResolved: number;    // Films matched to TMDB
  totalUnresolved: number;  // Films not found in TMDB
  isEligibleForMatching: boolean; // resolved >= 5
};

type PaginatedWatchlist = {
  items: WatchlistItem[];
  nextCursor: string | null;
  totalCount: number;
};

type WatchlistItem = {
  id: string;
  film: FilmPreview;
  importedAt: string; // ISO 8601
};

type FilmPreview = {
  id: string;
  tmdbId: number | null;
  title: string;
  year: number | null;
  posterUrl: string | null; // Full TMDB poster URL (constructed from Film.posterPath: `https://image.tmdb.org/t/p/w500${posterPath}`)
  genreIds: number[];
};
```

---

## discover router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `discover.getFeed` | query | required | — | `DiscoverFeed` | Get today's Discover cards |
| `discover.expressInterest` | mutation | required | `{ targetUserId: string }` | `InterestResult` | Express interest in a user |
| `discover.skip` | mutation | required | `{ targetUserId: string }` | `{ success: boolean }` | Skip a user (mark as seen) |

### Types

```typescript
type DiscoverFeed = {
  cards: DiscoverCard[];
  remainingToday: number;    // Cards left in today's allocation
  isAllCaughtUp: boolean;    // True when no more cards today
};

type DiscoverCard = {
  userId: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
  matchScore: number;        // 0–1
  sharedFilmCount: number;
  sharedFilms: FilmPreview[];  // A selection of shared films
};

type InterestResult = {
  success: boolean;
  isMatch: boolean;           // True if mutual interest → match created
  matchId: string | null;     // Set if isMatch is true
};
```

---

## match router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `match.list` | query | required | — | `MatchListItem[]` | Get all matches for current user |
| `match.getById` | query | required | `{ matchId: string }` | `MatchDetail` | Get match detail with shared films |

### Types

```typescript
type MatchListItem = {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    profilePhotos: string[];
  };
  sharedFilmCount: number;
  score: number;
  createdAt: string; // ISO 8601
};

type MatchDetail = {
  matchId: string;
  otherUser: PublicProfile;
  score: number;
  sharedFilms: FilmPreview[];
  genreOverlap: { genreName: string; count: number }[]; // Shared genre breakdown — genre names resolved from TMDB genre ID→name mapping at query time
  createdAt: string;
};
```

---

## safety router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `safety.block` | mutation | required | `{ userId: string }` | `{ success: boolean }` | Block a user |
| `safety.unblock` | mutation | required | `{ userId: string }` | `{ success: boolean }` | Unblock a user |
| `safety.report` | mutation | required | `ReportInput` | `{ success: boolean; reportId: string }` | Report a user |
| `safety.getBlockedUsers` | query | required | — | `BlockedUser[]` | List blocked users |

### Types

```typescript
type ReportInput = {
  reportedUserId: string;
  reason: "SPAM" | "HARASSMENT" | "INAPPROPRIATE_CONTENT" | "FAKE_PROFILE" | "OTHER";
  description?: string;  // Optional detail, max 1000 chars
};

type BlockedUser = {
  userId: string;
  name: string;
  blockedAt: string; // ISO 8601
};
```

---

## device router

| Procedure | Type | Auth | Input | Output | Description |
|-----------|------|------|-------|--------|-------------|
| `device.registerPush` | mutation | required | `{ token: string; platform: "ios" }` | `{ success: boolean }` | Register APNs device token |
| `device.unregisterPush` | mutation | required | `{ token: string }` | `{ success: boolean }` | Remove device token |

---

## Error Envelope

All errors follow tRPC's standard error format:

```typescript
type TRPCError = {
  error: {
    message: string;
    code: TRPCErrorCode; // "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" | "FORBIDDEN" | "TOO_MANY_REQUESTS" | "INTERNAL_SERVER_ERROR"
    data?: Record<string, unknown>;
  };
};
```

### Common Error Codes

| Code | When |
|------|------|
| `UNAUTHORIZED` | No valid session / expired token |
| `NOT_FOUND` | User, match, or resource doesn't exist |
| `BAD_REQUEST` | Invalid input (validation failure) |
| `FORBIDDEN` | Accessing blocked user's data; acting on deleted account |
| `TOO_MANY_REQUESTS` | Rate limit exceeded (auth, scraping) |
| `INTERNAL_SERVER_ERROR` | Downstream failure (TMDB, Letterboxd unreachable) |
