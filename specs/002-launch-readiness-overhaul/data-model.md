# Data Model: Product Launch Readiness Overhaul

**Feature**: 002-launch-readiness-overhaul  
**Date**: 1 April 2026  
**Source of Truth**: `apps/web/prisma/schema.prisma`

---

## New Enums

### PickerPathway

Distinguishes the two plan creation flows.

| Value | Description |
|-------|-------------|
| `FILM_FIRST` | Pathway A — user picks a film, then selects showtimes |
| `FULLY_SPECIFIED` | Pathway B — user provides date, film, and cinema upfront |

### PickerPlanStatus

Lifecycle state of a Picker plan.

| Value | Description |
|-------|-------------|
| `VOTING` | Plan is active, participants can vote on showtimes |
| `CONFIRMED` | Organizer has confirmed a showtime; plan is locked |
| `EXPIRED` | Plan reached 7-day TTL without confirmation, or all showtimes passed |
| `ARCHIVED` | Expired plan moved to archive (guest data deleted) |

### VoteStatus

A participant's availability for a specific showtime.

| Value | Description |
|-------|-------------|
| `AVAILABLE` | Participant can attend this showtime |
| `UNAVAILABLE` | Participant cannot attend this showtime |
| `MAYBE` | Participant is uncertain |

### MoodType

Predefined mood options for Mood Reels (minimum 8 per spec).

| Value | Icon | Colour | Description |
|-------|------|--------|-------------|
| `NOSTALGIC` | 📷 | Warm amber | Longing for the past |
| `ADVENTUROUS` | 🧭 | Forest green | Seeking thrills |
| `HEARTBROKEN` | 💔 | Deep rose | Processing loss |
| `HYPE` | 🔥 | Electric orange | Maximum energy |
| `CHILL` | 🌊 | Ocean blue | Relaxed, mellow |
| `ROMANTIC` | 💕 | Soft pink | In a loving mood |
| `MYSTERIOUS` | 🔮 | Deep purple | Craving intrigue |
| `INSPIRED` | ✨ | Gold | Seeking motivation |
| `MELANCHOLIC` | 🌧️ | Slate blue | Beautifully sad |
| `COZY` | ☕ | Warm brown | Comfort and warmth |

---

## New Entities

### PickerPlan

A group cinema outing plan created by an organizer.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique plan identifier (also serves as shareable link slug) |
| `organizerId` | `String` | FK → `User.id` | User who created the plan |
| `filmTitle` | `String` | Required | Film name from search or manual entry |
| `filmTmdbId` | `Int?` | Optional | TMDB ID if resolved from search |
| `filmPosterPath` | `String?` | Optional | TMDB poster path |
| `filmYear` | `Int?` | Optional | Release year |
| `pathway` | `PickerPathway` | Required | Which creation flow was used |
| `city` | `String?` | Optional | City for showtime search (Pathway A) |
| `cinema` | `String?` | Optional | Specific cinema (Pathway B) |
| `targetDate` | `String?` | Optional | Target date YYYY-MM-DD (Pathway B) |
| `status` | `PickerPlanStatus` | Default `VOTING` | Current plan lifecycle state |
| `confirmedShowtimeId` | `String?` | FK → `PickerShowtime.id`, nullable | The selected showtime (set on confirmation) |
| `createdAt` | `DateTime` | Default `now()` | Creation timestamp |
| `expiresAt` | `DateTime` | Required | Auto-set to `createdAt + 7 days` |

**Relations**: `organizer` → User, `showtimes` → PickerShowtime[], `participants` → PickerParticipant[], `confirmedShowtime` → PickerShowtime?

**Indexes**: `[organizerId]`, `[status]`, `[expiresAt]`, `[status, expiresAt]`

**Validation Rules**:
- `filmTitle` max 500 characters
- `city` must be one of the 18 supported Dutch cities (if provided)
- `expiresAt` is always `createdAt + 7 days` for `VOTING` plans
- Confirmed plans do not expire
- On expiry: status → `EXPIRED`, then `ARCHIVED` after guest data cleanup

---

### PickerShowtime

A candidate showtime option within a plan.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique showtime identifier |
| `planId` | `String` | FK → `PickerPlan.id` | Parent plan |
| `cinemaName` | `String` | Required | Cinema name |
| `cinemaCity` | `String` | Required | City where cinema is located |
| `date` | `String` | Required | Screening date (YYYY-MM-DD) |
| `time` | `String` | Required | Screening time (HH:MM) |
| `ticketUrl` | `String?` | Optional | External link to buy tickets |
| `isManualEntry` | `Boolean` | Default `false` | Whether this was manually entered (vs. auto-populated) |
| `createdAt` | `DateTime` | Default `now()` | When added to the plan |

**Relations**: `plan` → PickerPlan, `votes` → PickerVote[]

**Indexes**: `[planId]`, `[planId, date]`

**Validation Rules**:
- `date` must be in YYYY-MM-DD format, not in the past
- `time` must be in HH:MM format
- `cinemaName` max 200 characters

---

### PickerVote

A participant's availability vote on a showtime.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique vote identifier |
| `participantId` | `String` | FK → `PickerParticipant.id` | Who voted |
| `showtimeId` | `String` | FK → `PickerShowtime.id` | Which showtime |
| `status` | `VoteStatus` | Required | Availability status |
| `createdAt` | `DateTime` | Default `now()` | Vote timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |

**Relations**: `participant` → PickerParticipant, `showtime` → PickerShowtime

**Indexes**: `[participantId]`, `[showtimeId]`, `[showtimeId, status]`

**Unique Constraint**: `[participantId, showtimeId]` — one vote per participant per showtime

**Validation Rules**:
- Votes can only be cast/updated when plan status is `VOTING`
- Vote updates are idempotent (upsert on unique constraint)

---

### PickerParticipant

A person participating in a Picker plan (registered user or guest).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique participant identifier |
| `planId` | `String` | FK → `PickerPlan.id` | Which plan |
| `userId` | `String?` | FK → `User.id`, nullable | Linked user account (null for guests) |
| `displayName` | `String` | Required | Name shown in voting grid |
| `sessionToken` | `String?` | Optional | Cookie-based session token for guests |
| `isOrganizer` | `Boolean` | Default `false` | Whether this participant is the plan organizer |
| `joinedAt` | `DateTime` | Default `now()` | When they joined the plan |

**Relations**: `plan` → PickerPlan, `user` → User?, `votes` → PickerVote[]

**Indexes**: `[planId]`, `[userId]`, `[sessionToken]`

**Unique Constraint**: `[planId, userId]` (where userId is not null — one entry per user per plan)

**Validation Rules**:
- `displayName` max 50 characters, sanitized (alphanumeric, spaces, basic punctuation)
- Guest participants (`userId IS NULL`) must have a `sessionToken`
- Guest data (participant + votes) is deleted when plan expires/archives

---

### UserMood

A user's current or historical mood selection.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique mood entry identifier |
| `userId` | `String` | FK → `User.id` | Who set this mood |
| `mood` | `MoodType` | Required | The selected mood |
| `isActive` | `Boolean` | Default `true` | Whether this is the user's current mood |
| `selectedAt` | `DateTime` | Default `now()` | When the mood was set |

**Relations**: `user` → User

**Indexes**: `[userId, isActive]`, `[mood, isActive]`, `[userId, selectedAt]`

**State Transitions**:
- When a user sets a new mood, the previous active mood's `isActive` is set to `false`
- Only one active mood per user at any time
- Mood history is preserved for the "mood history" view

---

### MoodFilmSuggestion

A film recommended to a user based on their mood + taste profile.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique suggestion identifier |
| `userId` | `String` | FK → `User.id` | Who received this suggestion |
| `filmId` | `String` | FK → `Film.id` | Suggested film |
| `mood` | `MoodType` | Required | The mood this suggestion is for |
| `matchExplanation` | `String` | Required | Human-readable reason (e.g., "This film matches your nostalgic vibe because...") |
| `matchStrength` | `Float` | Required, 0.0–1.0 | How strongly the film matches the mood + taste |
| `source` | `String` | Default `"community"` | Source: `"community"` (tags) or `"ai"` (embedding) |
| `createdAt` | `DateTime` | Default `now()` | When the suggestion was generated |

**Relations**: `user` → User, `film` → Film

**Indexes**: `[userId, mood]`, `[filmId]`, `[userId, createdAt]`

---

### MoodFilmTag (Supporting Entity)

Community-driven mood tags on films — the primary recommendation source.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` | PK, `cuid()` | Unique tag identifier |
| `filmId` | `String` | FK → `Film.id` | Tagged film |
| `mood` | `MoodType` | Required | The mood tag |
| `taggedById` | `String` | FK → `User.id` | Who added this tag |
| `createdAt` | `DateTime` | Default `now()` | When tagged |

**Relations**: `film` → Film, `taggedBy` → User

**Indexes**: `[filmId, mood]`, `[mood]`, `[taggedById]`

**Unique Constraint**: `[filmId, mood, taggedById]` — one tag per user per mood per film

---

## Modified Entities

### User (existing)

**New Relations**:
- `pickerPlans` → PickerPlan[] (as organizer)
- `pickerParticipations` → PickerParticipant[] (as participant)
- `moods` → UserMood[]
- `moodSuggestions` → MoodFilmSuggestion[]
- `moodTags` → MoodFilmTag[]

### Film (existing)

**New Relations**:
- `moodSuggestions` → MoodFilmSuggestion[]
- `moodTags` → MoodFilmTag[]

---

## Entity Relationship Diagram

```
User ──┬── 1:N ──→ PickerPlan (as organizer)
       ├── 1:N ──→ PickerParticipant (as participant, nullable)
       ├── 1:N ──→ UserMood
       ├── 1:N ──→ MoodFilmSuggestion
       └── 1:N ──→ MoodFilmTag

PickerPlan ──┬── 1:N ──→ PickerShowtime
             ├── 1:N ──→ PickerParticipant
             └── 1:1? ──→ PickerShowtime (confirmedShowtime)

PickerShowtime ── 1:N ──→ PickerVote

PickerParticipant ──┬── N:1 ──→ PickerPlan
                    ├── N:1? ──→ User (nullable for guests)
                    └── 1:N ──→ PickerVote

Film ──┬── 1:N ──→ MoodFilmSuggestion
       └── 1:N ──→ MoodFilmTag
```

---

## Data Lifecycle & Cleanup

| Event | Action |
|-------|--------|
| Plan expires (7 days, unconfirmed) | Set status → `EXPIRED`, then `ARCHIVED`. Delete guest `PickerParticipant` records (userId IS NULL) and their `PickerVote` records |
| Plan confirmed | Status → `CONFIRMED`, `confirmedShowtimeId` set. Plan persists indefinitely |
| User deletes account | Cascade delete all owned plans, participations, moods, suggestions, tags (via Prisma `onDelete: Cascade`) |
| Mood updated | Previous active mood `isActive` → `false`, new mood inserted with `isActive` → `true` |

---

## Prisma Schema Additions (Preview)

```prisma
enum PickerPathway {
  FILM_FIRST
  FULLY_SPECIFIED
}

enum PickerPlanStatus {
  VOTING
  CONFIRMED
  EXPIRED
  ARCHIVED
}

enum VoteStatus {
  AVAILABLE
  UNAVAILABLE
  MAYBE
}

enum MoodType {
  NOSTALGIC
  ADVENTUROUS
  HEARTBROKEN
  HYPE
  CHILL
  ROMANTIC
  MYSTERIOUS
  INSPIRED
  MELANCHOLIC
  COZY
}

model PickerPlan {
  id                  String           @id @default(cuid())
  organizerId         String
  filmTitle           String
  filmTmdbId          Int?
  filmPosterPath      String?
  filmYear            Int?
  pathway             PickerPathway
  city                String?
  cinema              String?
  targetDate          String?
  status              PickerPlanStatus @default(VOTING)
  confirmedShowtimeId String?          @unique
  createdAt           DateTime         @default(now())
  expiresAt           DateTime

  organizer          User               @relation("PickerPlanOrganizer", fields: [organizerId], references: [id], onDelete: Cascade)
  showtimes          PickerShowtime[]   @relation("PlanShowtimes")
  participants       PickerParticipant[]
  confirmedShowtime  PickerShowtime?    @relation("ConfirmedShowtime", fields: [confirmedShowtimeId], references: [id])

  @@index([organizerId])
  @@index([status])
  @@index([expiresAt])
  @@index([status, expiresAt])
}

model PickerShowtime {
  id            String   @id @default(cuid())
  planId        String
  cinemaName    String
  cinemaCity    String
  date          String
  time          String
  ticketUrl     String?
  isManualEntry Boolean  @default(false)
  createdAt     DateTime @default(now())

  plan          PickerPlan   @relation("PlanShowtimes", fields: [planId], references: [id], onDelete: Cascade)
  votes         PickerVote[]
  confirmedFor  PickerPlan?  @relation("ConfirmedShowtime")

  @@index([planId])
  @@index([planId, date])
}

model PickerVote {
  id            String     @id @default(cuid())
  participantId String
  showtimeId    String
  status        VoteStatus
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  participant PickerParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  showtime    PickerShowtime    @relation(fields: [showtimeId], references: [id], onDelete: Cascade)

  @@unique([participantId, showtimeId])
  @@index([participantId])
  @@index([showtimeId])
  @@index([showtimeId, status])
}

model PickerParticipant {
  id           String   @id @default(cuid())
  planId       String
  userId       String?
  displayName  String
  sessionToken String?
  isOrganizer  Boolean  @default(false)
  joinedAt     DateTime @default(now())

  plan  PickerPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)
  user  User?        @relation("PickerParticipant", fields: [userId], references: [id], onDelete: Cascade)
  votes PickerVote[]

  @@unique([planId, userId])
  @@index([planId])
  @@index([userId])
  @@index([sessionToken])
}

model UserMood {
  id         String   @id @default(cuid())
  userId     String
  mood       MoodType
  isActive   Boolean  @default(true)
  selectedAt DateTime @default(now())

  user User @relation("UserMoods", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isActive])
  @@index([mood, isActive])
  @@index([userId, selectedAt])
}

model MoodFilmSuggestion {
  id               String   @id @default(cuid())
  userId           String
  filmId           String
  mood             MoodType
  matchExplanation String
  matchStrength    Float
  source           String   @default("community")
  createdAt        DateTime @default(now())

  user User @relation("MoodSuggestions", fields: [userId], references: [id], onDelete: Cascade)
  film Film @relation("MoodSuggestions", fields: [filmId], references: [id])

  @@index([userId, mood])
  @@index([filmId])
  @@index([userId, createdAt])
}

model MoodFilmTag {
  id         String   @id @default(cuid())
  filmId     String
  mood       MoodType
  taggedById String
  createdAt  DateTime @default(now())

  film     Film @relation("MoodTags", fields: [filmId], references: [id])
  taggedBy User @relation("MoodTags", fields: [taggedById], references: [id], onDelete: Cascade)

  @@unique([filmId, mood, taggedById])
  @@index([filmId, mood])
  @@index([mood])
  @@index([taggedById])
}
```
