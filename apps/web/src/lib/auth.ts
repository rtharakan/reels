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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // In dev, log to console
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Magic Link] ${email}: ${url}`);
          return;
        }
        // In production, use Resend
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
  },
});

export type Session = typeof auth.$Infer.Session;
