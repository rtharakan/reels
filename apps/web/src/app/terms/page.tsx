import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500">Effective Date: March 29, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-300">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
          <p className="mt-2">
            Welcome to Reels (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Reels is a
            film-driven social matching platform that connects people through shared cinema
            taste. By creating an account, accessing, or using our Service, you agree to be
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of
            these Terms, you must not use Reels.
          </p>
          <p className="mt-2">
            These Terms constitute a legally binding agreement between you and Reels. Please
            read them carefully alongside our{' '}
            <Link href="/privacy" className="text-zinc-100 underline underline-offset-2 hover:text-white">
              Privacy Policy
            </Link>
            , which explains how we collect, use, and protect your information.
          </p>
        </section>

        {/* 2. Eligibility */}
        <section>
          <h2 className="text-lg font-semibold text-white">2. Eligibility</h2>
          <p className="mt-2">To use Reels, you must:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Be at least 18 years of age</li>
            <li>Be legally able to enter into a binding contract</li>
            <li>Not be prohibited from using the Service under the laws of your jurisdiction</li>
            <li>Not have been previously removed or banned from the Service</li>
            <li>Not be a registered sex offender in any jurisdiction</li>
          </ul>
          <p className="mt-2">
            By creating an account, you represent and warrant that you meet all eligibility
            requirements. We may request verification of your age at any time and reserve the
            right to terminate accounts that do not meet these criteria.
          </p>
        </section>

        {/* 3. Your Account */}
        <section>
          <h2 className="text-lg font-semibold text-white">3. Your Account</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your login credentials
            and for all activity that occurs under your account. You agree to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Create only one account per person</li>
            <li>Provide accurate, current, and complete information on your profile</li>
            <li>Not transfer or share your account with any other person</li>
            <li>Notify us immediately if you suspect unauthorized access to your account</li>
            <li>Not create an account on behalf of someone else</li>
          </ul>
          <p className="mt-2">
            We reserve the right to suspend or terminate accounts that contain false
            information, duplicate accounts, or accounts used in violation of these Terms.
          </p>
        </section>

        {/* 4. How Reels Works */}
        <section>
          <h2 className="text-lg font-semibold text-white">4. How Reels Works</h2>
          <p className="mt-2">
            Reels connects users based on shared film taste. When you use the Service, you may:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Import your public Letterboxd data (watchlist, watched films, ratings, and likes) to build your film profile</li>
            <li>Receive up to 10 curated match suggestions per day based on film compatibility</li>
            <li>Express interest in other users; mutual interest creates a match</li>
            <li>Use the Explore feature to compare Letterboxd profiles without an account</li>
            <li>Block or report users who violate community standards</li>
          </ul>
          <p className="mt-2">
            We do not guarantee any particular number of matches or that you will find a
            compatible connection. Match suggestions are generated algorithmically and do not
            constitute endorsement of any user.
          </p>
        </section>

        {/* 5. Community Standards */}
        <section>
          <h2 className="text-lg font-semibold text-white">5. Community Standards</h2>
          <p className="mt-2">
            Reels is built on respect. To maintain a safe and welcoming environment, you agree
            not to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Harass, bully, intimidate, stalk, or threaten any user</li>
            <li>Post or transmit content that is hateful, discriminatory, sexually explicit, or violent</li>
            <li>Impersonate another person or misrepresent your identity, age, or affiliation</li>
            <li>Solicit money, promote commercial services, or engage in spam</li>
            <li>Use the Service for any illegal purpose or to facilitate illegal activity</li>
            <li>Upload viruses, malware, or other harmful code</li>
            <li>Scrape, crawl, or collect other users&apos; data through automated means</li>
            <li>Attempt to circumvent safety features, blocks, or reports</li>
            <li>Share another user&apos;s personal information without their consent</li>
            <li>Use the Service while under the age of 18</li>
          </ul>
          <p className="mt-2">
            We review all reports and may take action including warning, suspending, or
            permanently banning accounts that violate these standards. Severe violations may be
            reported to law enforcement.
          </p>
        </section>

        {/* 6. Content and Intellectual Property */}
        <section>
          <h2 className="text-lg font-semibold text-white">6. Content and Intellectual Property</h2>
          <p className="mt-2">
            <strong className="text-white">Your Content.</strong> You retain ownership of all content you create
            and share on Reels (photos, bio text, conversation prompts). By posting content, you
            grant Reels a limited, non-exclusive, royalty-free license to display, distribute,
            and reproduce that content solely for the purpose of operating and improving the
            Service. This license ends when you delete your content or account.
          </p>
          <p className="mt-2">
            <strong className="text-white">Third-Party Content.</strong> Film metadata and poster images are
            sourced from The Movie Database (TMDB). Letterboxd data is imported from publicly
            accessible profiles with your explicit consent. We do not claim ownership of
            third-party content.
          </p>
          <p className="mt-2">
            <strong className="text-white">Our Content.</strong> The Reels name, logo, design, and software are
            owned by Reels. You may not copy, modify, distribute, or create derivative works
            based on our intellectual property without prior written consent.
          </p>
        </section>

        {/* 7. Safety and Reporting */}
        <section>
          <h2 className="text-lg font-semibold text-white">7. Safety and Reporting</h2>
          <p className="mt-2">
            Your safety is a priority. Reels provides the following safety tools:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong className="text-white">Block:</strong> Prevent a user from seeing your profile or contacting you. Blocking is immediate and discreet — the blocked user is not notified.</li>
            <li><strong className="text-white">Report:</strong> Flag a user for spam, harassment, inappropriate content, fake profiles, or other violations. Reports are reviewed by our team.</li>
            <li><strong className="text-white">Unmatch:</strong> Remove a match at any time. The other user will no longer be able to contact you.</li>
          </ul>
          <p className="mt-2">
            While we take reasonable measures to promote safety, we cannot guarantee the conduct
            of any user on or off the Platform. You are solely responsible for your interactions
            with other users. Always exercise caution when communicating with people you have met
            online and never share financial information or personal addresses.
          </p>
        </section>

        {/* 8. Interactions Between Users */}
        <section>
          <h2 className="text-lg font-semibold text-white">8. Interactions Between Users</h2>
          <p className="mt-2">
            Reels is not responsible for the conduct of any user, whether on or off the
            Platform. You agree to use caution in all interactions, especially if you decide to
            communicate off-platform or meet in person. You acknowledge that:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Reels does not conduct criminal background checks on users</li>
            <li>Reels does not verify the identity, statements, or claims made by users</li>
            <li>You are responsible for taking reasonable precautions in all interactions</li>
          </ul>
        </section>

        {/* 9. Account Deletion and Data */}
        <section>
          <h2 className="text-lg font-semibold text-white">9. Account Deletion and Data</h2>
          <p className="mt-2">
            You may delete your account at any time from your profile settings. When you delete
            your account:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Your account is immediately deactivated and hidden from other users</li>
            <li>Your data is soft-deleted and permanently erased within 30 days</li>
            <li>Matches, interests, and interactions associated with your account are removed</li>
            <li>Data that has been anonymized or aggregated for analytics may be retained</li>
          </ul>
          <p className="mt-2">
            You may also request a copy of your data or request deletion by contacting us at the
            email address listed below. See our{' '}
            <Link href="/privacy" className="text-zinc-100 underline underline-offset-2 hover:text-white">
              Privacy Policy
            </Link>{' '}
            for full details on data retention and your rights.
          </p>
        </section>

        {/* 10. Termination */}
        <section>
          <h2 className="text-lg font-semibold text-white">10. Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your account at any time, with or without notice, if we
            reasonably believe:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>You have violated these Terms or our Community Standards</li>
            <li>Your conduct poses a risk to the safety of other users</li>
            <li>Your use of the Service is fraudulent, abusive, or harmful</li>
            <li>We are required to do so by law or a legal order</li>
          </ul>
          <p className="mt-2">
            If your account is terminated, you may not create a new account without our
            permission. You may appeal a suspension by contacting us at the email address below.
          </p>
        </section>

        {/* 11. Disclaimers */}
        <section>
          <h2 className="text-lg font-semibold text-white">11. Disclaimers</h2>
          <p className="mt-2">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-2">
            We do not warrant that the Service will be uninterrupted, error-free, or secure. We
            do not make any representations regarding the accuracy, reliability, or completeness
            of any content on the Platform, including match scores and film data.
          </p>
        </section>

        {/* 12. Limitation of Liability */}
        <section>
          <h2 className="text-lg font-semibold text-white">12. Limitation of Liability</h2>
          <p className="mt-2">
            TO THE FULLEST EXTENT PERMITTED BY LAW, REELS AND ITS OFFICERS, DIRECTORS,
            EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, GOODWILL, OR
            OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Your access to, use of, or inability to use the Service</li>
            <li>Any conduct or content of any user on the Platform</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Any third-party conduct related to the Service</li>
          </ul>
          <p className="mt-2">
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU HAVE PAID US IN
            THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
          </p>
        </section>

        {/* 13. Indemnification */}
        <section>
          <h2 className="text-lg font-semibold text-white">13. Indemnification</h2>
          <p className="mt-2">
            You agree to indemnify and hold harmless Reels and its affiliates, officers,
            directors, employees, and agents from any claims, liabilities, damages, losses, or
            expenses (including reasonable legal fees) arising from your use of the Service,
            your violation of these Terms, or your violation of any rights of a third party.
          </p>
        </section>

        {/* 14. Dispute Resolution */}
        <section>
          <h2 className="text-lg font-semibold text-white">14. Dispute Resolution</h2>
          <p className="mt-2">
            We want to address your concerns without the need for formal legal proceedings. If
            you have a dispute, please contact us first and we will attempt to resolve it
            informally within 30 days.
          </p>
          <p className="mt-2">
            If we cannot resolve the dispute informally, you and Reels agree that any dispute
            arising out of or relating to these Terms or the Service shall be resolved through
            binding arbitration, except that either party may seek injunctive relief in court
            for intellectual property violations. You agree to waive any right to participate in
            a class action lawsuit or class-wide arbitration.
          </p>
        </section>

        {/* 15. Governing Law */}
        <section>
          <h2 className="text-lg font-semibold text-white">15. Governing Law</h2>
          <p className="mt-2">
            These Terms are governed by and construed in accordance with the laws of the
            Netherlands, without regard to conflict of law principles. If you are located in the
            European Union, nothing in these Terms affects your rights as a consumer under
            applicable EU law.
          </p>
        </section>

        {/* 16. Changes to These Terms */}
        <section>
          <h2 className="text-lg font-semibold text-white">16. Changes to These Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. When we make material changes, we will
            notify you through the Service or by email at least 30 days before the changes take
            effect. Your continued use of the Service after the effective date constitutes your
            acceptance of the updated Terms.
          </p>
          <p className="mt-2">
            If you do not agree with the revised Terms, you must stop using the Service and
            delete your account before the effective date of the changes.
          </p>
        </section>

        {/* 17. Severability */}
        <section>
          <h2 className="text-lg font-semibold text-white">17. Severability</h2>
          <p className="mt-2">
            If any provision of these Terms is found to be unenforceable or invalid, that
            provision will be limited or eliminated to the minimum extent necessary, and the
            remaining provisions will continue in full force and effect.
          </p>
        </section>

        {/* 18. Contact */}
        <section>
          <h2 className="text-lg font-semibold text-white">18. Contact Us</h2>
          <p className="mt-2">
            If you have questions about these Terms, wish to report a violation, or need to
            appeal an account action, please contact us at:
          </p>
          <p className="mt-2 text-zinc-100">
            legal@reelsapp.com
          </p>
        </section>
      </div>

      <footer className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-600">
        <div className="flex items-center justify-between">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
            Privacy Policy
          </Link>
          <span>&copy; {new Date().getFullYear()} Reels. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
