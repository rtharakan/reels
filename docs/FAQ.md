# Frequently Asked Questions

## Getting Started

### What is Reels?
Reels is a social matching platform that connects people based on their real film taste — not selfies or bios. Import your Letterboxd profile, and we surface the people whose watchlists actually overlap with yours.

### Do I need a Letterboxd account?
Yes. Reels imports your public Letterboxd data (watchlist, watched films, likes, and ratings) to compute match scores. Your Letterboxd profile must be public for the import to work.

### What's the minimum number of films needed?
You need at least **5 films** across all your Letterboxd data (watchlist + watched + liked) to be eligible for matching.

### How do I sign up?
1. Visit the Reels homepage
2. Click "Get Started" or "Sign Up"
3. Enter your email — we'll send a magic link (no password needed)
4. Click the link in your email to authenticate
5. Complete onboarding: name, age, location, bio, and conversation prompts
6. Import your Letterboxd watchlist
7. Optionally select your top 4 films
8. Start discovering matches!

---

## Matching

### How does the matching algorithm work?
We compute a compatibility score using five weighted signals:

| Signal | Weight | What it measures |
|--------|--------|-----------------|
| **Liked overlap** | 30% | Films both users explicitly liked |
| **High-rated overlap** | 25% | Films both users rated 4+ stars |
| **Genre similarity** | 20% | Cosine similarity of genre frequency vectors |
| **Watched overlap** | 15% | Films both users have seen |
| **Watchlist overlap** | 10% | Films both users want to see |

### How many matches do I get per day?
You see **10 Discover cards per day**. The feed resets at midnight in your local timezone. There's no infinite scroll — this is intentional.

### What happens when I express interest?
If the other person has also expressed interest in you, it's a **mutual match**! You'll both see the match in your Matches list, including why you matched (shared films, genre breakdown).

### Can I see why we matched?
Yes! Every match displays:
- Shared film count and list
- Genre overlap breakdown
- Individual scoring signals
- The other person's top 4 films and prompts

### What's the difference between Friends, Dating, and Both?
When you set your intent during onboarding:
- **Friends** mode shows you only users looking for Friends or Both
- **Dating** mode shows you only users looking for Dating or Both
- **Both** mode shows you everyone

---

## Features

### What is the Explore tool?
Explore lets anyone compare two Letterboxd profiles head-to-head — no account needed. Enter two usernames and see your overlap score, shared films, and Dutch cinema date suggestions.

### What is the Scan tool?
Scan discovers similar Letterboxd profiles based on your taste. It examines films you've liked and finds other users who also liked those same films, then scores them against your full profile.

### What are Buddy requests?
The Buddy feature lets you coordinate cinema dates. Create a request for a specific film, cinema, and time, then others can express interest and chat in a group thread.

### Is there dark mode?
Yes! Toggle between light and dark mode any time. The app uses a warm stone-based neutral palette with terracotta accents.

### Is there multi-language support?
Yes. Reels supports **English** and **Dutch** (Nederlands). Toggle the language in Settings or via the globe icon.

---

## Privacy & Safety

### What data do you collect?
We store your email, profile information (name, age, location, bio, prompts), and film data imported from your public Letterboxd profile. We never access private Letterboxd data or store passwords.

### Can I export my data?
Yes. Go to **Settings → Export My Data** to download a JSON file containing all your stored information (GDPR Art. 15 compliant).

### Can I delete my account?
Yes. Go to **Settings → Delete Account**. This permanently deletes ALL your data, including profile, watchlist, matches, interests, and session data. This action cannot be undone.

### How do I block or report someone?
From any profile view or Discover card, tap the overflow menu (⋯) to find **Block** and **Report** options — always within two taps. Blocking removes the user from your feed and matches. Reports are flagged for moderation review.

### Is my data sold to third parties?
No. We do not sell, share, or monetize your personal data.

---

## Technical

### What tech stack does Reels use?
- **Frontend**: Next.js 14 (App Router) with Tailwind CSS
- **API**: tRPC v11 for end-to-end type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: BetterAuth (magic links + OAuth)
- **Film Data**: Letterboxd scraping + TMDB API
- **Mobile**: iOS (SwiftUI), Android (Kotlin/Compose)

### How do I run Reels locally?
```bash
git clone https://github.com/rtharakan/reels.git
cd reels
pnpm install
cp .env.example .env  # fill in your secrets
pnpm dev
```
Requires Node.js 20+, pnpm, PostgreSQL, and a TMDB API token.

### How do I run the tests?
```bash
pnpm test       # Run all tests
pnpm typecheck  # TypeScript checking
pnpm lint       # Linting
```

---

## Troubleshooting

### "Username not found" during Letterboxd import
Make sure the Letterboxd username is spelled correctly and the profile is public. Private profiles cannot be imported.

### "This profile is private" during import
The user's Letterboxd profile privacy settings need to be changed to public before import.

### Magic link not arriving
1. Check your spam/junk folder
2. Make sure you typed the correct email address
3. Magic links expire after 10 minutes — request a new one if needed
4. If using a corporate email, check with your IT department about email filtering

### My match score seems low
Match scores depend on how much data both users have on Letterboxd. Users with more films logged (watched, liked, rated) will get more accurate scores. Encourage your matches to log more films!

---

*Film metadata provided by [TMDB](https://www.themoviedb.org/). Watchlist data from [Letterboxd](https://letterboxd.com/). Not affiliated with either service.*
