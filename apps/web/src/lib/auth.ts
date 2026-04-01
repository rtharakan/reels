import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from './prisma';

// Guard against weak auth secrets in production runtime (skip during build)
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
if (
  process.env.NODE_ENV === 'production' &&
  !isBuilding &&
  (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.includes('dev-secret'))
) {
  throw new Error('BETTER_AUTH_SECRET must be a strong random value in production');
}

// Social providers are optional — only included when env vars are present.
// For go-live with email magic link only, you do NOT need Google or Apple credentials.
const socialProviders: Record<string, unknown> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = {
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Magic Link] ${email}: ${url}`);
          return;
        }
        // In production, send via Resend
        const { sendMagicLinkEmail } = await import('./email');
        await sendMagicLinkEmail(email, url);
      },
      expiresIn: 600, // 10 minutes
    }),
    nextCookies(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 15, // 15 minutes
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: 'reels',
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
});

export type Session = typeof auth.$Infer.Session;
