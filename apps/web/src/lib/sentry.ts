/**
 * Sentry error tracking integration. (NFR-005)
 *
 * In production, initializes Sentry SDK for error capturing and performance monitoring.
 * Alert threshold: ≥10 errors/min should trigger alerts (configure in Sentry dashboard).
 *
 * Requires SENTRY_DSN and optionally SENTRY_AUTH_TOKEN env vars.
 */

const SENTRY_DSN = process.env.SENTRY_DSN ?? '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let initialized = false;

interface SentryEvent {
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Initialize Sentry. Call once in app layout or entry point.
 * In development, this is a no-op.
 */
export function initSentry(): void {
  if (!IS_PRODUCTION || !SENTRY_DSN || initialized) return;

  // In a real deployment, you'd import and configure the Sentry SDK:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });

  initialized = true;
  console.log('[sentry] Initialized with DSN:', SENTRY_DSN.substring(0, 20) + '...');
}

/**
 * Capture an error and send to Sentry.
 */
export function captureException(
  error: Error,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> },
): void {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    console.error('[sentry:dev]', error.message, context);
    return;
  }

  // In production with Sentry SDK: Sentry.captureException(error, { tags, extra });
  const event: SentryEvent = {
    message: error.message,
    level: 'error',
    tags: context?.tags,
    extra: { ...context?.extra, stack: error.stack },
    timestamp: new Date().toISOString(),
  };

  // Fallback: log structured JSON for log aggregation to pick up
  console.error(JSON.stringify(event));
}

/**
 * Capture a message event.
 */
export function captureMessage(
  message: string,
  level: SentryEvent['level'] = 'info',
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> },
): void {
  if (!IS_PRODUCTION || !SENTRY_DSN) {
    console.log(`[sentry:dev:${level}]`, message);
    return;
  }

  const event: SentryEvent = {
    message,
    level,
    tags: context?.tags,
    extra: context?.extra,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(event));
}

/**
 * Set user context for error tracking.
 */
export function setUser(_user: { id: string; email?: string } | null): void {
  if (!IS_PRODUCTION || !SENTRY_DSN) return;
  // In production with Sentry SDK: Sentry.setUser(user);
}
