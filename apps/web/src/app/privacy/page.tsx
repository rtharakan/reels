import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Effective Date: March 29, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-stone-500">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">1. Introduction</h2>
          <p className="mt-2">
            Reels (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
            your privacy. This Privacy Policy explains what information we collect, how we use
            it, who we share it with, and the rights and choices you have regarding your data.
          </p>
          <p className="mt-2">
            By using Reels, you agree to the collection and use of information in accordance
            with this policy. This policy should be read alongside our{' '}
            <Link href="/terms" className="text-stone-700 underline underline-offset-2 hover:text-stone-800">
              Terms of Service
            </Link>
            .
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">2. Information We Collect</h2>

          <h3 className="mt-4 font-medium text-stone-700">2.1 Information You Provide</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Account Information:</strong> Email address, name, and authentication credentials (via email magic link or OAuth through Google/Apple)</li>
            <li><strong className="text-stone-800">Profile Information:</strong> Age, location, bio, conversation prompts, profile photos, and connection intent (friends, dating, or both)</li>
            <li><strong className="text-stone-800">Film Preferences:</strong> Your top films, selected during onboarding</li>
            <li><strong className="text-stone-800">Letterboxd Data:</strong> With your explicit consent, we import your public Letterboxd watchlist, watched films, ratings, and liked films to power matching</li>
            <li><strong className="text-stone-800">Consent Records:</strong> Timestamp of your Privacy Policy consent</li>
          </ul>

          <h3 className="mt-4 font-medium text-stone-700">2.2 Information Generated Through Use</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Interaction Data:</strong> Interests expressed, matches made, blocks, and reports</li>
            <li><strong className="text-stone-800">Match Scores:</strong> Algorithmically computed compatibility scores based on film overlap, genre similarity, liked films, ratings, and watched history</li>
            <li><strong className="text-stone-800">Usage Data:</strong> Daily allocation counts and seen-user history for the Discover feed</li>
          </ul>

          <h3 className="mt-4 font-medium text-stone-700">2.3 Technical Information</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Session Data:</strong> IP address, user agent, session tokens, and expiration timestamps</li>
            <li><strong className="text-stone-800">Device Tokens:</strong> For push notifications on mobile devices, collected only with your permission</li>
          </ul>

          <h3 className="mt-4 font-medium text-stone-700">2.4 Information We Do Not Collect</h3>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>We do not collect precise geolocation data</li>
            <li>We do not scan or access your contacts, photos, or files beyond what you upload</li>
            <li>We do not collect financial or payment information</li>
            <li>We do not use tracking cookies for advertising purposes</li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">3. How We Use Your Information</h2>
          <p className="mt-2">We use the information we collect to:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Provide the Service:</strong> Create your account, display your profile, and generate match suggestions based on film compatibility</li>
            <li><strong className="text-stone-800">Improve Matching:</strong> Compute and refine match scores using film overlap, genre similarity, ratings, liked films, and watched history</li>
            <li><strong className="text-stone-800">Communicate:</strong> Send magic link emails for authentication and push notifications about new matches (with your consent)</li>
            <li><strong className="text-stone-800">Ensure Safety:</strong> Review reports, enforce Community Standards, detect fraud, and prevent abuse</li>
            <li><strong className="text-stone-800">Improve the Service:</strong> Analyze anonymized, aggregated usage patterns to improve features and fix issues</li>
          </ul>
          <p className="mt-2 font-medium text-stone-700">
            We will never sell your personal data to third parties. We will never use your data
            for targeted advertising. We will never share your data with data brokers.
          </p>
        </section>

        {/* 4. How We Share Your Information */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">4. How We Share Your Information</h2>
          <p className="mt-2">
            We share your information only in the following limited circumstances:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">With Other Users:</strong> Your profile information (name, age, location, bio, photos, prompts, and shared films) is visible to other users on the Discover feed and in matches. Your email address is never shared with other users.</li>
            <li><strong className="text-stone-800">Service Providers:</strong> We use trusted third-party services solely to operate the Platform:
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>Letterboxd — public watchlist, films, ratings, and likes data (with your consent)</li>
                <li>TMDB — film metadata and poster images</li>
                <li>Google / Apple — OAuth authentication</li>
                <li>Resend — magic link email delivery</li>
              </ul>
            </li>
            <li><strong className="text-stone-800">Legal Requirements:</strong> We may disclose your information only when required by a valid court order, subpoena, or legal process. We will notify you of such requests where legally permitted.</li>
            <li><strong className="text-stone-800">Safety:</strong> We may share information with law enforcement if we believe in good faith that disclosure is necessary to prevent imminent bodily harm or protect the safety of our users.</li>
          </ul>
        </section>

        {/* 5. Data Security */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">5. Data Security</h2>
          <p className="mt-2">
            We take the security of your data seriously and implement reasonable technical and
            organizational measures to protect it, including:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Encryption of data in transit using TLS/HTTPS</li>
            <li>Encryption of data at rest in our database</li>
            <li>Secure session management with automatic expiration</li>
            <li>No plaintext storage of passwords or authentication tokens</li>
            <li>Access controls limiting employee access to personal data</li>
          </ul>
          <p className="mt-2">
            While we strive to protect your information, no method of transmission over the
            Internet or electronic storage is 100% secure. We cannot guarantee absolute security
            and encourage you to use strong, unique passwords.
          </p>
        </section>

        {/* 6. Data Retention */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">6. Data Retention</h2>
          <p className="mt-2">
            We retain your personal data only for as long as necessary to provide the Service
            and fulfill the purposes described in this policy:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Active Accounts:</strong> Your data is retained while your account is active</li>
            <li><strong className="text-stone-800">Deleted Accounts:</strong> When you delete your account, your data is immediately soft-deleted (hidden from all users) and permanently erased within 30 days</li>
            <li><strong className="text-stone-800">Reports and Safety Data:</strong> Data related to reports and safety actions may be retained for up to 12 months after account deletion for abuse prevention</li>
            <li><strong className="text-stone-800">Anonymized Data:</strong> Aggregated, anonymized data that can no longer identify you may be retained indefinitely for analytics and service improvement</li>
          </ul>
        </section>

        {/* 7. Your Rights and Choices */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">7. Your Rights and Choices</h2>
          <p className="mt-2">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Right to Access:</strong> Request a copy of all personal data we hold about you. You can export your data in JSON format from your profile settings.</li>
            <li><strong className="text-stone-800">Right to Rectification:</strong> Update or correct your profile information at any time through your profile settings</li>
            <li><strong className="text-stone-800">Right to Erasure:</strong> Delete your account and all associated data at any time from your profile settings, or by contacting us</li>
            <li><strong className="text-stone-800">Right to Restriction:</strong> Request that we limit processing of your data in certain circumstances</li>
            <li><strong className="text-stone-800">Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong className="text-stone-800">Right to Object:</strong> Object to certain processing of your data</li>
            <li><strong className="text-stone-800">Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at the email address below. We will
            respond to verified requests within 30 days.
          </p>
        </section>

        {/* 8. EU/EEA Users (GDPR) */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">8. EU/EEA Users (GDPR)</h2>
          <p className="mt-2">
            If you are located in the European Union or European Economic Area, the following
            additional provisions apply:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-stone-800">Legal Basis:</strong> We process your data based on: (a) your consent (e.g., importing Letterboxd data), (b) contractual necessity (e.g., providing the matching service), (c) legitimate interests (e.g., preventing abuse), and (d) legal obligations</li>
            <li><strong className="text-stone-800">Data Transfers:</strong> If your data is transferred outside the EU/EEA, we ensure appropriate safeguards are in place, including Standard Contractual Clauses</li>
            <li><strong className="text-stone-800">Supervisory Authority:</strong> You have the right to lodge a complaint with your local data protection authority</li>
          </ul>
        </section>

        {/* 9. California Users (CCPA) */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">9. California Users (CCPA)</h2>
          <p className="mt-2">
            If you are a California resident, you have the right to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Know what personal information is collected, used, shared, or sold</li>
            <li>Delete your personal information held by us</li>
            <li>Opt-out of the sale of your personal information — <strong className="text-stone-800">we do not sell your personal information</strong></li>
            <li>Exercise these rights without discrimination</li>
          </ul>
          <p className="mt-2">
            We do not sell, rent, or share personal information with third parties for their
            direct marketing purposes.
          </p>
        </section>

        {/* 10. Children's Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">10. Children&apos;s Privacy</h2>
          <p className="mt-2">
            Reels is not directed at anyone under the age of 18. We do not knowingly collect
            personal information from children under 18. If we learn that we have collected
            information from a child under 18, we will take steps to delete that information as
            quickly as possible. If you believe a child under 18 has provided us with personal
            information, please contact us immediately.
          </p>
        </section>

        {/* 11. Third-Party Links */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">11. Third-Party Links</h2>
          <p className="mt-2">
            Our Service may contain links to third-party websites or services (such as
            Letterboxd profiles or TMDB). We are not responsible for the privacy practices of
            these third parties. We encourage you to review the privacy policies of any
            third-party services you access through Reels.
          </p>
        </section>

        {/* 12. Changes to This Policy */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">12. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. When we make material changes,
            we will notify you through the Service or by email at least 30 days before the
            changes take effect. The &quot;Effective Date&quot; at the top of this page indicates the date
            of the most recent revision.
          </p>
          <p className="mt-2">
            Your continued use of the Service after the effective date constitutes your
            acceptance of the updated policy. If you do not agree with the revised policy, you
            must stop using the Service and delete your account.
          </p>
        </section>

        {/* 13. Contact Us */}
        <section>
          <h2 className="text-lg font-semibold text-stone-800">13. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, wish to exercise your data rights,
            or have concerns about how your data is handled, please contact us at:
          </p>
          <p className="mt-2 text-stone-700">
            privacy@reelsapp.com
          </p>
          <p className="mt-2">
            For EU/EEA residents, you may also contact your local data protection authority if
            you believe your rights under the GDPR have not been adequately addressed.
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-emerald-100 pt-6 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <Link href="/terms" className="hover:text-slate-500 transition-colors">
            Terms of Service
          </Link>
          <span>&copy; {new Date().getFullYear()} Reels. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
