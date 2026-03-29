export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-6 text-sm text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-white">Acceptance of Terms</h2>
          <p className="mt-2">
            By using Reels, you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Eligibility</h2>
          <p className="mt-2">You must be at least 17 years old to use Reels.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Your Account</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must provide accurate profile information</li>
            <li>One account per person</li>
            <li>You can delete your account at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Community Standards</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Be respectful to other users</li>
            <li>Do not harass, spam, or impersonate others</li>
            <li>Do not share inappropriate content</li>
            <li>Reports are reviewed and may result in account suspension</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Intellectual Property</h2>
          <p className="mt-2">
            Film data is provided by TMDB. Letterboxd watchlist data is imported with user consent
            from public profiles only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Limitation of Liability</h2>
          <p className="mt-2">
            Reels is provided &quot;as is&quot; without warranties. We are not liable for any damages arising
            from your use of the service.
          </p>
        </section>
      </div>
    </main>
  );
}
