'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { LanguageToggle } from '@/components/language-toggle';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authClient.signIn.magicLink({ email, callbackURL: '/discover' });
      setSent(true);
    } catch {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/discover' });
  };

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.auth.checkEmail}</h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t.auth.sentLink} <strong className="text-[var(--text-primary)]">{email}</strong>
          </p>
          <p className="text-sm text-[var(--text-muted)]">{t.auth.expires}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">Reels</Link>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t.auth.welcomeBack}</p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.auth.email}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
              placeholder={t.auth.emailPlaceholder}
            />
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? t.auth.sending : t.auth.sendMagicLink}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-default)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--bg-primary)] px-3 text-[var(--text-muted)]">{t.auth.or}</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t.auth.signInGoogle}
        </button>

        <div className="space-y-2 text-center text-sm text-[var(--text-muted)]">
          <div className="flex justify-center"><LanguageToggle /></div>
          <p>
            {t.auth.noAccount}{' '}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              {t.common.signup}
            </Link>
          </p>
          <p className="text-xs">
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.explore}</Link>
            {' · '}
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.home}</Link>
            {' · '}
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.privacy}</Link>
            {' · '}
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.terms}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
