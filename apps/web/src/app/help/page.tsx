'use client';

import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Film,
  Heart,
  Search,
  Users,
  Shield,
  HelpCircle,
  Lightbulb,
  Mail,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_SECTIONS: { title: string; icon: React.ElementType; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    icon: Sparkles,
    items: [
      {
        question: 'What is Reels?',
        answer:
          "Reels is a social matching platform for film lovers. Instead of swiping on photos, your actual taste in cinema does the talking. We look at what you've watched, loved, and want to see — then connect you with fellow cinephiles who share your world.",
      },
      {
        question: 'Do I need a Letterboxd account?',
        answer:
          "Yes — Letterboxd is how we understand your film taste. It's free to sign up at letterboxd.com. The more you've logged, liked, and listed on Letterboxd, the richer your matches will be. Even a modest watchlist goes a long way.",
      },
      {
        question: 'Is Reels free?',
        answer:
          "Yes, completely free. We believe great connections shouldn't cost anything. Create an account, import your Letterboxd watchlist, and start discovering film people near you.",
      },
      {
        question: 'What platforms does Reels support?',
        answer:
          "Reels is available as a web app (works beautifully on any browser) and as a native iOS app. Android is coming soon. The web app can also be installed as a Progressive Web App on your home screen for a near-native experience.",
      },
    ],
  },
  {
    title: 'Matching & Discover',
    icon: Heart,
    items: [
      {
        question: 'How does the matching work?',
        answer:
          "We use a 5-signal algorithm that looks at: which films you've both liked (30%), films you've both rated highly (25%), how similar your genre tastes are (20%), films you've both watched (15%), and films on both your watchlists (10%). The result is a single compatibility score that reflects genuine film kinship.",
      },
      {
        question: 'Why do I only see 10 matches per day?',
        answer:
          "Intentionally. We think the best connections come from real attention, not endless scrolling. Ten thoughtfully selected matches per day — that's plenty to explore, and it keeps the experience feeling meaningful rather than mechanical. Your daily feed resets at midnight.",
      },
      {
        question: 'What if I have no watchlist on Letterboxd?',
        answer:
          "No worries. If you haven't built a watchlist yet, we use your viewing history, ratings, and liked films to find your match. The signals adapt to what's available. Of course, a watchlist adds richness — even a handful of films waiting to be seen tells us something real about you.",
      },
      {
        question: "Why hasn't my new Letterboxd activity shown up yet?",
        answer:
          "Your taste profile is based on the watchlist snapshot imported when you joined. To refresh it with new activity, head to your Profile and tap \"Re-import Watchlist\". We'll pull the latest and recalculate your matches.",
      },
      {
        question: 'What does the match score percentage mean?',
        answer:
          "It's a measure of how closely your film taste overlaps — from your liked films and ratings to your genre sensibility and watchlist overlap. Think of it less as a grade and more as a conversation starter. Opposites attract too, and sometimes the most interesting connections are with people who broaden your cinema world.",
      },
    ],
  },
  {
    title: 'Watchlist Import',
    icon: Film,
    items: [
      {
        question: "My watchlist didn't import properly. What do I do?",
        answer:
          "A few things to check: make sure your Letterboxd profile and watchlist are set to public (Letterboxd Settings → Privacy), then try the import again from your Profile page. If some films are missing or have no poster, it may be a rare title that our film database hasn't resolved yet — most films import reliably.",
      },
      {
        question: "Some film posters aren't showing. Is that normal?",
        answer:
          "For the vast majority of films, posters load beautifully. Occasionally, very obscure titles or films with unusual punctuation in their names can take a moment to resolve. We handle hundreds of punctuation patterns automatically (apostrophes, dashes, colons...), but a handful of niche titles may still slip through. We're always improving this.",
      },
      {
        question: 'Can I import a watchlist without a Letterboxd account?',
        answer:
          "Not currently — Letterboxd is the data source we use. If you don't have a Letterboxd account yet, it's worth setting one up. Even an afternoon of logging films you love will give us enough to find you some wonderful matches.",
      },
    ],
  },
  {
    title: 'The Explore & Scan Tools',
    icon: Search,
    items: [
      {
        question: 'What is the Explore feature?',
        answer:
          "Explore lets you compare any two Letterboxd profiles directly — see your compatibility score, shared films, and find cinema dates for films you both want to see. You can use it before signing up, with any public Letterboxd profiles. It's a great way to settle the \"do we have the same taste?\" question once and for all.",
      },
      {
        question: 'How does the Compare button work on Scan results?',
        answer:
          "Once the Scan has found your compatible profiles, hitting Compare on any result will take you directly to Explore — with both usernames pre-filled and the comparison running automatically. No extra steps.",
      },
      {
        question: 'What is the Scan feature?',
        answer:
          "Scan is for the explorers. Enter your Letterboxd username and our agent crawls the platform to find real cinephiles with similar taste — people who have reviewed the same films, loved the same directors, haunted the same obscure corners of cinema. The deeper the scan, the more people we surface.",
      },
    ],
  },
  {
    title: 'Privacy & Safety',
    icon: Shield,
    items: [
      {
        question: 'What data do you store?',
        answer:
          "We store your email address, profile information you provide during onboarding, and the film data imported from your public Letterboxd profile. We never access your private Letterboxd data or store your password — authentication is handled via secure magic links or OAuth providers.",
      },
      {
        question: 'Can I delete my account?',
        answer:
          "Yes, always. Head to Settings → Delete Account. Your data is permanently removed within 30 days — including your profile, matches, and imported film data. You can also export everything beforehand from Settings → Export My Data.",
      },
      {
        question: 'How do I block or report someone?',
        answer:
          "On any profile card or match detail, tap the ⋯ menu and choose Block or Report. Blocking removes them from your feed immediately and permanently. Reports go to our moderation team. Both actions are private — the other person is never notified.",
      },
      {
        question: 'Is my Letterboxd data used for anything else?',
        answer:
          "No. We use your Letterboxd data only to compute your compatibility with other Reels members. We don't sell it, share it with third parties, or use it for advertising. Your watchlist is your own.",
      },
    ],
  },
  {
    title: 'Cinema Buddy & Plan',
    icon: Users,
    items: [
      {
        question: 'What is Cinema Buddy?',
        answer:
          "Cinema Buddy connects you with someone to watch a film with — right now. Post a request for a specific film and showtime in your city, and other cinephiles who want to join can respond. Perfect for those times when none of your friends want to see that three-hour Tarkovsky film.",
      },
      {
        question: 'What is the Plan feature?',
        answer:
          "Plan cross-references your Letterboxd watchlist with what's currently screening at Dutch cinemas. Instantly see which films on your list you can actually catch right now, sorted by city and showtime. No more missing a film you've been waiting years to see on the big screen.",
      },
    ],
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-default)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--accent)]"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">{item.question}</span>
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[var(--text-secondary)]">{item.answer}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
            <HelpCircle className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Help &amp; <span className="text-[var(--accent)]">FAQ</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)]">
            Answers to the questions most cinephiles ask. If you can&apos;t find what you need, our team is happy to help.
          </p>
        </div>

        {/* Quick links */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FAQ_SECTIONS.map((section) => (
            <a
              key={section.title}
              href={`#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
            >
              <section.icon className="h-4 w-4 text-[var(--accent)] shrink-0" />
              {section.title}
            </a>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQ_SECTIONS.map((section) => (
            <Card
              key={section.title}
              id={section.title.toLowerCase().replace(/\s+/g, '-')}
              className="scroll-mt-20"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <section.icon className="h-4 w-4 text-[var(--accent)]" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.items.map((item) => (
                  <FAQAccordion key={item.question} item={item} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Still have a question?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            We&apos;re a small team of cinephiles who care deeply about this product. Drop us a message and we&apos;ll get back to you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:hello@reels.film">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email us
              </Button>
            </a>
            <Link href="/features">
              <Button className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Request a feature
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
