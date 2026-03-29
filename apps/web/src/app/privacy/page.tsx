export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-6 text-sm text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-white">What data we collect</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Email address for authentication</li>
            <li>Profile information you provide (name, age, location, bio, conversation prompts)</li>
            <li>Your public Letterboxd watchlist data (film titles and slugs, imported with your explicit consent)</li>
            <li>Match and interaction data (interests expressed, matches made)</li>
            <li>Device tokens for push notifications (iOS only, with your permission)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">How we use your data</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>To match you with people who share your film taste</li>
            <li>To display your profile to potential matches on the Discover feed</li>
            <li>To send push notifications about new matches</li>
            <li>To improve the matching algorithm</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Your rights</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong>Right to access</strong>: Export all your data in JSON format from your profile</li>
            <li><strong>Right to erasure</strong>: Delete your account and all associated data at any time</li>
            <li><strong>Right to rectification</strong>: Edit your profile information at any time</li>
            <li>We never sell your data to third parties</li>
            <li>Data is encrypted in transit and at rest</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Data retention</h2>
          <p className="mt-2">
            When you delete your account, all your data is soft-deleted immediately and permanently
            removed after 30 days in compliance with GDPR requirements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Third-party services</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Letterboxd (public watchlist scraping with your consent)</li>
            <li>TMDB (film metadata and poster images)</li>
            <li>Google/Apple (OAuth authentication)</li>
            <li>Resend (magic link email delivery)</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
