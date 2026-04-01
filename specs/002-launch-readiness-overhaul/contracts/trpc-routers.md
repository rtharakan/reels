# tRPC Router Contracts: Product Launch Readiness Overhaul

**Feature**: 002-launch-readiness-overhaul  
**Date**: 1 April 2026  
**Base Path**: `apps/web/src/server/routers/`

---

## Updated App Router (`_app.ts`)

```typescript
import { router } from '../trpc';
import { userRouter } from './user';
import { watchlistRouter } from './watchlist';
import { discoverRouter } from './discover';
import { matchRouter } from './match';
import { safetyRouter } from './safety';
import { deviceRouter } from './device';
import { pickerRouter } from './picker';  // NEW
import { moodRouter } from './mood';      // NEW

export const appRouter = router({
  user: userRouter,
  watchlist: watchlistRouter,
  discover: discoverRouter,
  match: matchRouter,
  safety: safetyRouter,
  device: deviceRouter,
  picker: pickerRouter,  // NEW
  mood: moodRouter,      // NEW
});
```

---

## Picker Router (`picker.ts`)

### `picker.create`

Create a new Picker cinema plan.

| Property | Value |
|----------|-------|
| **Procedure** | `protectedProcedure.mutation` |
| **Auth** | Required (organizer must be logged in) |
| **Rate Limit** | 5 plans/minute/user |

**Input Schema** (Zod):
```typescript
z.object({
  filmTitle: z.string().min(1).max(500),
  filmTmdbId: z.number().int().positive().optional(),
  filmPosterPath: z.string().optional(),
  filmYear: z.number().int().min(1888).max(2030).optional(),
  pathway: z.enum(['FILM_FIRST', 'FULLY_SPECIFIED']),
  city: z.string().max(100).optional(),
  cinema: z.string().max(200).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  showtimes: z.array(z.object({
    cinemaName: z.string().min(1).max(200),
    cinemaCity: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    ticketUrl: z.string().url().optional(),
    isManualEntry: z.boolean().default(false),
  })).min(1).max(50),
})
```

**Output**:
```typescript
{
  planId: string;       // cuid — also the shareable link slug
  shareUrl: string;     // Full shareable URL
  expiresAt: string;    // ISO datetime
}
```

---

### `picker.get`

Retrieve a plan's details (public — accessible by anyone with the planId).

| Property | Value |
|----------|-------|
| **Procedure** | `publicProcedure.query` |
| **Auth** | Optional (logged-in users auto-linked as participants) |

**Input Schema**:
```typescript
z.object({
  planId: z.string().cuid(),
})
```

**Output**:
```typescript
{
  id: string;
  filmTitle: string;
  filmTmdbId: number | null;
  filmPosterPath: string | null;
  filmYear: number | null;
  pathway: 'FILM_FIRST' | 'FULLY_SPECIFIED';
  status: 'VOTING' | 'CONFIRMED' | 'EXPIRED' | 'ARCHIVED';
  organizer: { id: string; name: string };
  showtimes: Array<{
    id: string;
    cinemaName: string;
    cinemaCity: string;
    date: string;
    time: string;
    ticketUrl: string | null;
    voteCount: { available: number; unavailable: number; maybe: number };
  }>;
  participants: Array<{
    id: string;
    displayName: string;
    isOrganizer: boolean;
  }>;
  confirmedShowtime: {
    id: string;
    cinemaName: string;
    cinemaCity: string;
    date: string;
    time: string;
    ticketUrl: string | null;
  } | null;
  expiresAt: string;
  createdAt: string;
  currentParticipantId: string | null;  // If viewer is a participant
}
```

---

### `picker.join`

Join a plan as a participant (logged-in user or guest).

| Property | Value |
|----------|-------|
| **Procedure** | `publicProcedure.mutation` |
| **Auth** | Optional |

**Input Schema**:
```typescript
z.object({
  planId: z.string().cuid(),
  displayName: z.string().min(1).max(50).regex(/^[a-zA-Z0-9\s\-_.]+$/),
  guestSessionToken: z.string().optional(),  // From cookie, for guest re-identification
})
```

**Output**:
```typescript
{
  participantId: string;
  sessionToken: string | null;  // Set as cookie for guests
}
```

---

### `picker.vote`

Cast or update a vote on a showtime.

| Property | Value |
|----------|-------|
| **Procedure** | `publicProcedure.mutation` |
| **Auth** | Optional (identified by participantId) |
| **Rate Limit** | 30 votes/minute/session |

**Input Schema**:
```typescript
z.object({
  participantId: z.string().cuid(),
  votes: z.array(z.object({
    showtimeId: z.string().cuid(),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAYBE']),
  })).min(1).max(50),
})
```

**Output**:
```typescript
{
  success: boolean;
  updatedCount: number;
}
```

---

### `picker.confirm`

Organizer confirms a showtime, locking the plan.

| Property | Value |
|----------|-------|
| **Procedure** | `protectedProcedure.mutation` |
| **Auth** | Required (must be plan organizer) |

**Input Schema**:
```typescript
z.object({
  planId: z.string().cuid(),
  showtimeId: z.string().cuid(),
})
```

**Output**:
```typescript
{
  success: boolean;
  confirmedShowtime: {
    cinemaName: string;
    cinemaCity: string;
    date: string;
    time: string;
    ticketUrl: string | null;
  };
}
```

**Side Effects**:
- Sets `PickerPlan.status` → `CONFIRMED`
- Sets `PickerPlan.confirmedShowtimeId`
- Triggers notification to all participants (FR-008)

---

### `picker.searchFilms`

Search TMDB for films (used in Pathway A).

| Property | Value |
|----------|-------|
| **Procedure** | `publicProcedure.query` |
| **Auth** | Optional |

**Input Schema**:
```typescript
z.object({
  query: z.string().min(1).max(200),
})
```

**Output**:
```typescript
{
  results: Array<{
    tmdbId: number;
    title: string;
    year: number | null;
    posterPath: string | null;
    overview: string | null;
  }>;
}
```

---

### `picker.getShowtimes`

Fetch available showtimes from Filmladder for a film + city.

| Property | Value |
|----------|-------|
| **Procedure** | `publicProcedure.query` |
| **Auth** | Optional |

**Input Schema**:
```typescript
z.object({
  filmTitle: z.string().min(1).max(500),
  city: z.string().min(1).max(100).optional(),
  cinema: z.string().min(1).max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
```

**Output**:
```typescript
{
  showtimes: Array<{
    cinemaName: string;
    cinemaCity: string;
    date: string;
    time: string;
    ticketUrl: string | null;
  }>;
  source: 'filmladder' | 'manual';  // Indicates if results came from scraper or fallback
}
```

---

### `picker.myPlans`

List plans the current user is involved in (as organizer or participant).

| Property | Value |
|----------|-------|
| **Procedure** | `protectedProcedure.query` |
| **Auth** | Required |

**Input Schema**: None

**Output**:
```typescript
{
  plans: Array<{
    id: string;
    filmTitle: string;
    filmPosterPath: string | null;
    status: 'VOTING' | 'CONFIRMED' | 'EXPIRED' | 'ARCHIVED';
    participantCount: number;
    isOrganizer: boolean;
    createdAt: string;
    expiresAt: string;
  }>;
}
```

---

## Mood Router (`mood.ts`)

### `mood.setMood`

Set the user's current mood.

| Property | Value |
|----------|-------|
| **Procedure** | `onboardedProcedure.mutation` |
| **Auth** | Required + onboarded |
| **Rate Limit** | 10 changes/minute/user |

**Input Schema**:
```typescript
z.object({
  mood: z.enum([
    'NOSTALGIC', 'ADVENTUROUS', 'HEARTBROKEN', 'HYPE', 'CHILL',
    'ROMANTIC', 'MYSTERIOUS', 'INSPIRED', 'MELANCHOLIC', 'COZY'
  ]),
})
```

**Output**:
```typescript
{
  moodId: string;
  suggestions: Array<{
    id: string;
    filmId: string;
    filmTitle: string;
    filmYear: number | null;
    filmPosterPath: string | null;
    mood: string;
    matchExplanation: string;
    matchStrength: number;
    source: 'community' | 'ai';
  }>;
  moodTwins: Array<{
    userId: string;
    displayName: string;
    image: string | null;
    sharedFilmCount: number;
    mood: string;
  }>;
}
```

---

### `mood.getSuggestions`

Get film suggestions for the user's current mood (without changing mood).

| Property | Value |
|----------|-------|
| **Procedure** | `onboardedProcedure.query` |
| **Auth** | Required + onboarded |

**Input Schema**: None (uses current active mood)

**Output**: Same as `mood.setMood.suggestions` + `moodTwins`

---

### `mood.getHistory`

Get the user's mood history.

| Property | Value |
|----------|-------|
| **Procedure** | `onboardedProcedure.query` |
| **Auth** | Required + onboarded |

**Input Schema**: None

**Output**:
```typescript
{
  history: Array<{
    id: string;
    mood: string;
    isActive: boolean;
    selectedAt: string;
  }>;
  currentMood: string | null;
}
```

---

### `mood.tagFilm`

Tag a film with a mood (community-driven).

| Property | Value |
|----------|-------|
| **Procedure** | `onboardedProcedure.mutation` |
| **Auth** | Required + onboarded |

**Input Schema**:
```typescript
z.object({
  filmId: z.string().cuid(),
  mood: z.enum([
    'NOSTALGIC', 'ADVENTUROUS', 'HEARTBROKEN', 'HYPE', 'CHILL',
    'ROMANTIC', 'MYSTERIOUS', 'INSPIRED', 'MELANCHOLIC', 'COZY'
  ]),
})
```

**Output**:
```typescript
{
  success: boolean;
  tagId: string;
}
```

---

### `mood.expressInterest`

Express interest in a Mood Twin (follows existing Discover interest flow).

| Property | Value |
|----------|-------|
| **Procedure** | `onboardedProcedure.mutation` |
| **Auth** | Required + onboarded |

**Input Schema**:
```typescript
z.object({
  targetUserId: z.string().cuid(),
})
```

**Output**: Delegates to existing `discover.expressInterest` logic — returns match status.

---

## API Routes (Non-tRPC)

### `GET /api/screenings`

Existing route — reused by Picker for showtime data.

**Query Params**: `city` (string), `film` (string, optional)
**Response**: `ExploreScreening[]`

### `GET /api/now-showing`

Existing route — used by homepage.

**Query Params**: `city` (string)
**Response**: `{ films: NowShowingFilm[], screenings: Screening[] }`

---

## iOS API Client Extensions

The iOS app communicates with the web API via REST-like calls that mirror tRPC shapes. New methods needed:

```swift
// PickerAPI.swift
func createPlan(_ input: CreatePlanInput) async throws -> CreatePlanResponse
func getPlan(_ planId: String) async throws -> PlanDetail
func joinPlan(_ planId: String, displayName: String) async throws -> JoinResponse
func vote(_ participantId: String, votes: [VoteInput]) async throws -> VoteResponse
func confirmPlan(_ planId: String, showtimeId: String) async throws -> ConfirmResponse
func searchFilms(_ query: String) async throws -> [FilmSearchResult]
func getShowtimes(filmTitle: String, city: String?) async throws -> ShowtimeResponse
func myPlans() async throws -> [PlanSummary]

// MoodAPI.swift
func setMood(_ mood: MoodType) async throws -> MoodResponse
func getSuggestions() async throws -> MoodResponse
func getMoodHistory() async throws -> MoodHistoryResponse
func tagFilm(_ filmId: String, mood: MoodType) async throws -> TagResponse
func expressInterest(_ targetUserId: String) async throws -> InterestResponse
```

## Android API Client Extensions

Mirror the iOS API client using Kotlin Retrofit/Ktor:

```kotlin
// PickerApi.kt
suspend fun createPlan(input: CreatePlanInput): CreatePlanResponse
suspend fun getPlan(planId: String): PlanDetail
suspend fun joinPlan(planId: String, displayName: String): JoinResponse
suspend fun vote(participantId: String, votes: List<VoteInput>): VoteResponse
suspend fun confirmPlan(planId: String, showtimeId: String): ConfirmResponse
suspend fun searchFilms(query: String): List<FilmSearchResult>
suspend fun getShowtimes(filmTitle: String, city: String?): ShowtimeResponse
suspend fun myPlans(): List<PlanSummary>

// MoodApi.kt
suspend fun setMood(mood: MoodType): MoodResponse
suspend fun getSuggestions(): MoodResponse
suspend fun getMoodHistory(): MoodHistoryResponse
suspend fun tagFilm(filmId: String, mood: MoodType): TagResponse
suspend fun expressInterest(targetUserId: String): InterestResponse
```
