# Data Model: Reels — Film-Driven Social Matching Platform MVP

**Date**: 2026-03-29 | **Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

---

## Entity Relationship Diagram

```
┌──────────┐       ┌────────────────┐       ┌──────────┐
│   User   │──1:N──│ WatchlistEntry │──N:1──│   Film   │
└──────────┘       └────────────────┘       └──────────┘
     │                                            │
     ├──1:N──┐  ┌──────────┐                      │
     │       └──│ Interest  │──N:1─── User        │
     │          └──────────┘                      │
     ├──1:N──┐  ┌──────────┐                      │
     │       └──│  Match    │──N:1─── User        │
     │          └──────────┘                      │
     ├──1:N──┐  ┌──────────┐                      │
     │       └──│  Block    │──N:1─── User        │
     │          └──────────┘                      │
     ├──1:N──┐  ┌──────────┐                      │
     │       └──│  Report   │──N:1─── User        │
     │          └──────────┘                      │
     ├──1:N──── MatchScore ──N:1─── User          │
     │                                            │
     ├──1:N──── SeenUser ──N:1─── User            │
     │                                            │
     ├──1:N──── DailyAllocation                   │
     │                                            │
     └──1:N──── DeviceToken                       │
```

---

## Enums

```prisma
enum Intent {
  FRIENDS
  DATING
  BOTH
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  FAKE_PROFILE
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}
```

---

## Entities

### User

Core account entity. Central to all relationships.

BetterAuth creates the User record at authentication time — before onboarding completes. All profile fields collected during onboarding are therefore **nullable** at the database level and validated as required at the application layer (tRPC Zod schemas) when the user completes onboarding.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| email | String | unique | Auth provider email |
| name | String | required | Display name — set by auth provider at account creation (Google/Apple profile name or email prefix for magic link). Updated by user during onboarding. |
| age | Int? | nullable | Validated ≥17 at app layer; null until onboarding |
| location | String? | nullable | Free text city/region; null until onboarding |
| bio | String? | nullable | Max 500 chars |
| intent | Intent? | nullable | FRIENDS / DATING / BOTH; null until onboarding |
| timezone | String? | nullable | IANA timezone (e.g., "America/New_York"); null until onboarding |
| letterboxdUsername | String? | unique | Linked Letterboxd profile |
| profilePhotos | String[] | array | URLs to stored images |
| prompts | Json? | nullable | Array of {question, answer} objects (1–3); null until onboarding |
| topFilmIds | String[] | array | Up to 4 Film IDs |
| privacyPolicyConsentedAt | DateTime? | nullable | Timestamp of GDPR consent; set during onboarding step 1 |
| onboardingCompletedAt | DateTime? | nullable | Set when onboarding finishes; null = incomplete |
| deletedAt | DateTime? | nullable | Soft-delete timestamp |
| createdAt | DateTime | default(now()) | |
| updatedAt | DateTime | @updatedAt | |

**Indexes**: `@@index([deletedAt])`, `@@index([intent])`, `@@index([onboardingCompletedAt])`

**Validation rules**:
- `age >= 17` (App Store 17+ rating) — enforced at tRPC input validation, not DB constraint
- `prompts` must contain 1–3 entries — enforced at tRPC input validation when non-null
- `letterboxdUsername` unique across non-deleted users
- `profilePhotos` max 6 items
- `topFilmIds` max 4 items
- `privacyPolicyConsentedAt` must be set before any profile data is collected (onboarding gate)
- `onboardingCompletedAt` is null until all required fields are populated

**State transitions**:
- Created (auth only, profile empty) → Onboarding In Progress → Onboarded (`onboardingCompletedAt` set) → Active
- Active → Soft-deleted (`deletedAt` set) → Hard-deleted (30 days later, cascade)

---

### Film

Canonical film record normalized via TMDB API.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| tmdbId | Int? | unique | Null if unresolved |
| title | String | required | Canonical TMDB title |
| year | Int? | nullable | Release year |
| posterPath | String? | nullable | TMDB poster path segment |
| genreIds | Int[] | array | TMDB genre ID array |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@index([tmdbId])`

**Validation rules**:
- Films with `tmdbId: null` are excluded from matching
- `genreIds` populated from TMDB search response `genre_ids[]`

---

### WatchlistEntry

Join table linking Users to Films (imported watchlist).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userId | String | FK → User.id | Cascade delete |
| filmId | String | FK → Film.id | |
| importedAt | DateTime | default(now()) | When this entry was imported |

**Indexes**: `@@unique([userId, filmId])`, `@@index([userId])`, `@@index([filmId])`

**Validation rules**:
- Duplicate (userId, filmId) pairs rejected
- On re-import: upsert (add new, keep existing, remove films no longer in watchlist)

---

### Interest

Records one user expressing interest in another via Discover.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| fromUserId | String | FK → User.id | The user who expressed interest |
| toUserId | String | FK → User.id | The target user |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@unique([fromUserId, toUserId])`, `@@index([toUserId])`

**Validation rules**:
- Cannot express interest in yourself
- Cannot express interest in a blocked user
- On creation: check if reciprocal Interest exists → if yes, create Match

**State transitions**:
- Created → (if reciprocal exists) → triggers Match creation

---

### Match

Bidirectional mutual match between two users.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userAId | String | FK → User.id | Lexicographically smaller ID |
| userBId | String | FK → User.id | Lexicographically larger ID |
| score | Float | required | Match score at time of match |
| sharedFilmIds | String[] | array | Film IDs contributing to match |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@unique([userAId, userBId])`, `@@index([userAId])`, `@@index([userBId])`

**Canonical ordering rule**: Always `min(idA, idB)` → `userAId`, `max(idA, idB)` → `userBId`. Prevents duplicate records.

**Validation rules**:
- Only created when mutual Interest exists
- `sharedFilmIds` populated at match time for "why you matched" display

---

### Block

Records one user blocking another.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| blockerId | String | FK → User.id | User who blocked |
| blockedUserId | String | FK → User.id | User who was blocked |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@unique([blockerId, blockedUserId])`, `@@index([blockerId])`, `@@index([blockedUserId])`

**Side effects on creation**:
- Remove any existing Match between the two users
- Remove any existing Interest records between the two users
- Bidirectionally exclude from Discover feed

---

### Report

User-submitted safety report for moderation.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| reporterId | String | FK → User.id | |
| reportedUserId | String | FK → User.id | |
| reason | ReportReason | enum | SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, FAKE_PROFILE, OTHER |
| description | String? | nullable | Optional free-text detail |
| status | ReportStatus | default(PENDING) | PENDING → REVIEWED → ACTIONED / DISMISSED |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@index([reportedUserId])`, `@@index([status])`

**State transitions**:
- PENDING → REVIEWED → ACTIONED (user warned/banned) or DISMISSED

---

### MatchScore

Pre-computed pairwise match scores for Discover feed ordering.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userId | String | FK → User.id | Source user |
| candidateId | String | FK → User.id | Potential match |
| filmOverlap | Float | required | Jaccard similarity (0–1) |
| genreSimilarity | Float | required | Cosine similarity (0–1) |
| totalScore | Float | required | 0.70 × filmOverlap + 0.30 × genreSimilarity |
| sharedFilmIds | String[] | array | IDs of overlapping films |
| computedAt | DateTime | default(now()) | |

**Indexes**: `@@unique([userId, candidateId])`, `@@index([userId, totalScore(sort: Desc)])`

**Recomputation trigger**: When a user's watchlist changes (import/re-import), recompute all MatchScores for that user as a background job.

---

### SeenUser

Permanent record of users shown in Discover (prevents re-showing).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userId | String | FK → User.id | The viewer |
| seenUserId | String | FK → User.id | The user shown |
| seenAt | DateTime | default(now()) | |

**Indexes**: `@@unique([userId, seenUserId])`, `@@index([userId])`

---

### DailyAllocation

Tracks how many Discover cards were served today per user.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userId | String | FK → User.id | |
| allocatedDate | DateTime | required | The calendar date (in user's timezone) |
| cardCount | Int | default(0) | Cards served so far today |

**Indexes**: `@@unique([userId, allocatedDate])`, `@@index([userId, allocatedDate])`

**Reset logic**: No explicit reset — new date in user's timezone simply creates a new row. Query: `cardCount < 10` for user's current local date.

---

### DeviceToken

Stores iOS push notification device tokens.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | PK, cuid() | |
| userId | String | FK → User.id | |
| token | String | required | APNs device token |
| platform | String | default("ios") | |
| createdAt | DateTime | default(now()) | |

**Indexes**: `@@unique([userId, token])`, `@@index([userId])`

---

## BetterAuth Managed Tables

BetterAuth's Prisma adapter automatically manages these tables. Do NOT modify directly:

- **Session**: Active sessions (id, userId, expiresAt, token, ipAddress, userAgent)
- **Account**: Linked OAuth accounts (id, userId, provider, providerAccountId, accessToken, refreshToken)
- **Verification**: Magic link / email verification tokens (id, identifier, value, expiresAt)

---

## Key Query Patterns

### Discover Feed (top 10 candidates)
```sql
SELECT ms.candidateId, ms.totalScore, ms.sharedFilmIds
FROM MatchScore ms
WHERE ms.userId = :userId
  AND ms.candidateId NOT IN (SELECT seenUserId FROM SeenUser WHERE userId = :userId)
  AND ms.candidateId NOT IN (
    SELECT blockedUserId FROM Block WHERE blockerId = :userId
    UNION SELECT blockerId FROM Block WHERE blockedUserId = :userId
  )
  AND ms.candidateId IN (SELECT id FROM "User" WHERE "deletedAt" IS NULL)
  AND ms.candidateId IN (
    SELECT id FROM "User" WHERE intent = :userIntent OR intent = 'BOTH' OR :userIntent = 'BOTH'
  )
  AND ms.candidateId IN (
    SELECT "userId" FROM WatchlistEntry GROUP BY "userId" HAVING COUNT(*) >= 5
  )
ORDER BY ms.totalScore DESC
LIMIT :remaining  -- (10 - today's cardCount)
```

### Reciprocal Interest Check (on express interest)
```sql
SELECT id FROM Interest
WHERE "fromUserId" = :targetUserId AND "toUserId" = :currentUserId
LIMIT 1
```
If found → create Match + notify both users.

### User's Matches
```sql
SELECT * FROM Match
WHERE "userAId" = :userId OR "userBId" = :userId
ORDER BY "createdAt" DESC
```
