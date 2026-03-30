# Go-Live Deployment Guide

This guide covers deploying Reels to production using **100% free-tier** open-source services, and how to run the iOS app on your Mac for local testing.

## Services Overview

| Service | Purpose | Cost |
|---------|---------|------|
| [Vercel](https://vercel.com) | Next.js web hosting | Free (Hobby) |
| [Supabase](https://supabase.com) | PostgreSQL database | Free (500 MB) |
| [Resend](https://resend.com) | Email (magic links) | Free (3,000/mo) |
| [TMDB](https://www.themoviedb.org) | Film metadata & posters | Free |
| Supabase Storage | Profile photos | Free (1 GB) |

---

## Step 1 — Database (Supabase)

1. Go to <https://app.supabase.com> and create a free account.
2. Click **New Project**, choose a region closest to your users.
3. Note your **database password** — you will need it.
4. Once the project is ready, go to **Settings → Database**.
5. Under **Connection string → URI**, choose **Transaction pooler** (port 6543).
6. Copy the connection string. It looks like:
   ```
   postgresql://postgres.YOURREF:YOURPASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Save this as `DATABASE_URL` in your Vercel environment variables (Step 4).

### Apply the database schema

Once you have the URL, run from `apps/web/`:

```sh
# In apps/web/
cp .env.example .env.local
# Edit .env.local and fill in DATABASE_URL, BETTER_AUTH_SECRET, TMDB_BEARER_TOKEN
pnpm db:push    # or: npx prisma db push
```

---

## Step 2 — Email (Resend)

1. Go to <https://resend.com> and create a free account.
2. In the dashboard, go to **API Keys → Create API Key**.
3. Give it a name (e.g., `reels-production`) and copy the key.
4. The key starts with `re_...`

**For the sender domain:**
- Free option: use Resend's testing domain → set `SMTP_FROM="Reels <onboarding@resend.dev>"`
- Custom domain: add your domain in Resend → Domains → Add Domain, then set `SMTP_FROM="Reels <noreply@yourdomain.com>"`

---

## Step 3 — TMDB API Key

1. Go to <https://www.themoviedb.org/signup> and create a free account.
2. Go to **Settings (avatar top-right) → API → Request an API Key**.
3. Choose **Developer** and fill in the form (it's free).
4. Copy the **API Read Access Token** (the long JWT-like token starting with `eyJ...`).
5. Save this as `TMDB_BEARER_TOKEN`.

---

## Step 4 — Deploy to Vercel

### One-time setup

1. Go to <https://vercel.com> and sign up (free Hobby plan).
2. Import your Git repository from GitHub/GitLab.
3. Vercel will detect it's a Next.js app. Set the **Root Directory** to `apps/web`.
4. Add all **Environment Variables** (Settings → Environment Variables):

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Supabase connection string |
   | `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
   | `BETTER_AUTH_URL` | Your Vercel deployment URL, e.g. `https://reels-abc123.vercel.app` |
   | `RESEND_API_KEY` | Your Resend API key (`re_...`) |
   | `SMTP_FROM` | `Reels <onboarding@resend.dev>` (or your custom domain) |
   | `TMDB_BEARER_TOKEN` | Your TMDB Bearer token |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |

5. Click **Deploy**.

### Update `BETTER_AUTH_URL` after first deploy

After your app is deployed, Vercel gives you a URL like `https://reels-abc123.vercel.app`. Set `BETTER_AUTH_URL` to this URL (without a trailing slash) so that magic link emails contain the correct redirect URL.

### Custom domain (optional)

In Vercel → Settings → Domains, add your custom domain. Update `BETTER_AUTH_URL` to match.

---

## Step 5 — Invite users by email

Once deployed, share your Vercel URL with testers. They sign up at `/signup`:

1. User enters their email address.
2. Reels sends a magic link via Resend.
3. User clicks the link → lands on the onboarding flow.
4. They enter their Letterboxd username and import their watchlist.
5. They can then browse **Discover**, find matches on shared film taste, and use **Buddy** to find film-going companions.

> **Google / Apple Sign-in (optional):** To enable Google OAuth, add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from [Google Cloud Console](https://console.cloud.google.com). The app works perfectly without social sign-in — magic link is the default.

---

## Step 6 — iOS App on Your Mac

### Requirements
- macOS Ventura 13+ or Sonoma 14+
- [Xcode 15+](https://apps.apple.com/app/xcode/id497799835) — free on the Mac App Store

### Open the project

1. Install Xcode from the Mac App Store if you haven't already.
2. Open Finder and navigate to `apps/ios/`.
3. Double-click **Reels.xcodeproj** to open in Xcode.

### Point the app at your deployed API

The app uses `localhost:3000` in Debug builds. For testing against your live Vercel deployment, edit `apps/ios/Reels/Core/Networking/Configuration.swift`:

```swift
static let apiBaseURL: String = {
    #if DEBUG
    return "https://YOUR-APP.vercel.app"   // ← change this while testing
    #else
    return "https://YOUR-APP.vercel.app"
    #endif
}()
```

Or simply run the Next.js dev server locally (`pnpm dev` in `apps/web/`) and leave it as `http://localhost:3000`.

### Run on iOS Simulator (Mac)

1. In Xcode, select the **Reels** scheme from the scheme selector at the top.
2. From the device selector, choose an **iPhone simulator** (e.g., iPhone 15 Pro).
3. Press **⌘R** (or click the ▶ Run button).
4. The iOS Simulator launches and the Reels app opens.

### Run on your iPhone (physical device)

1. Connect your iPhone via USB.
2. Trust the computer on your iPhone if prompted.
3. In Xcode, select your iPhone from the device selector.
4. You may need to add your Apple ID in Xcode → Settings → Accounts and set a **Development Team** in the target's Signing & Capabilities tab.
5. Press **⌘R** to install and run.

### Mac Catalyst (run as native Mac app)

The Xcode project has Mac Catalyst enabled. To run as a macOS app:

1. In Xcode, change the run destination to **My Mac (Mac Catalyst)**.
2. Press **⌘R**.
3. The app runs as a native Mac window.

> Note: When running on Mac, the app connects to `localhost:3000` by default (DEBUG build), so make sure your Next.js dev server is running (`pnpm dev`).

---

## Architecture Summary

```
User's browser / iOS app
        │
        ▼
  Vercel (Next.js)          ← web app + API
        │
        ├── BetterAuth      ← magic link auth sessions
        │       └── Resend  ← transactional emails
        │
        ├── tRPC API        ← type-safe endpoints
        │       ├── Discover feed, Matches, Buddy, Profile
        │       └── Letterboxd scraper → TMDB normalizer
        │
        └── Prisma ORM
                └── Supabase PostgreSQL  ← database
```

---

## Quick-Start Checklist

- [ ] Supabase project created, `DATABASE_URL` copied
- [ ] `prisma db push` run successfully
- [ ] Resend account created, `RESEND_API_KEY` copied
- [ ] TMDB account created, `TMDB_BEARER_TOKEN` copied
- [ ] All env vars set in Vercel
- [ ] First deployment succeeded (no build errors)
- [ ] `BETTER_AUTH_URL` updated to actual Vercel URL
- [ ] Signed up with a test email and received the magic link
- [ ] Completed onboarding with a Letterboxd username
- [ ] Discovered at least one match
- [ ] Used the Buddy feature to find a screening companion
- [ ] Xcode installed on Mac
- [ ] iOS app opened in Xcode and running in Simulator
- [ ] iOS app signed in via magic link (pointing at local or Vercel URL)
