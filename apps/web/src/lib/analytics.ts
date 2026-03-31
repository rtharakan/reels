/**
 * Privacy-respecting, first-party analytics event emitter. (NFR-006)
 *
 * Emits events: onboarding.completed, discover.interest, discover.skip,
 * match.created, session.started.
 *
 * No PII is collected. Events are sent to a first-party endpoint.
 * In development, events are logged to the console.
 */

type AnalyticsEvent =
  | { name: 'onboarding.completed'; properties?: { hasWatchlist: boolean } }
  | { name: 'discover.interest'; properties?: { matchScore: number } }
  | { name: 'discover.skip'; properties?: Record<string, never> }
  | { name: 'match.created'; properties?: { sharedFilmCount: number } }
  | { name: 'session.started'; properties?: { platform: string } };

const ANALYTICS_ENDPOINT = '/api/analytics';

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

/**
 * Track an analytics event. Privacy-respecting: no PII, no cookies, no fingerprinting.
 */
export function track(event: AnalyticsEvent): void {
  const payload = {
    event: event.name,
    properties: event.properties ?? {},
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    // No PII fields — intentionally omitted
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', payload);
    return;
  }

  // Fire-and-forget beacon
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never break the app
    });
  }
}

/**
 * Track session start on app load.
 */
export function trackSessionStart(): void {
  track({
    name: 'session.started',
    properties: { platform: typeof window !== 'undefined' ? 'web' : 'server' },
  });
}
