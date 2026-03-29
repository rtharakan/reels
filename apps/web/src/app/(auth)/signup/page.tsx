'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authClient.signIn.magicLink({ email, callbackURL: '/onboarding/privacy' });
      setSent(true);
    } catch {
      setError('Failed to send sign-up link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/onboarding/privacy' });
  };

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-stone-800">Check your email</h1>
          <p className="text-slate-500">
            We sent a sign-up link to <strong className="text-stone-800">{email}</strong>.
          </p>
          <p className="text-sm text-slate-400">The link expires in 10 minutes.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-800">Reels</h1>
          <p className="mt-2 text-slate-500">Create your account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-stone-500">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 placeholder-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Sign up with email'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-stone-50 px-2 text-slate-400">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-teal-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-stone-500 hover:text-stone-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
