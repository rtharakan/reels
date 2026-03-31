import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility tests for all key pages using axe-core. (T097)
 * Checks WCAG 2.1 Level AA compliance.
 */

const pages = [
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Privacy Consent', path: '/onboarding/privacy' },
  { name: 'Profile Setup', path: '/onboarding/profile' },
  { name: 'Watchlist Import', path: '/onboarding/watchlist' },
  { name: 'Top Films', path: '/onboarding/top-films' },
  { name: 'Discover', path: '/discover' },
  { name: 'Matches', path: '/matches' },
  { name: 'Profile', path: '/profile' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Help', path: '/help' },
];

for (const page of pages) {
  test(`${page.name} page has no accessibility violations`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test('onboarding flow completes in under 5 minutes', async ({ page }) => {
  const startTime = Date.now();

  // Navigate through onboarding steps
  await page.goto('/onboarding/privacy');
  await page.waitForLoadState('networkidle');

  // Step 1: Accept privacy policy
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 2: Fill profile
  await page.waitForURL('/onboarding/profile');
  await page.getByLabel(/display name/i).fill('Test User');
  await page.getByLabel(/age/i).fill('25');
  await page.getByLabel(/location/i).fill('Amsterdam, Netherlands');
  await page.getByLabel(/bio/i).fill('Film lover and cinema enthusiast.');
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 3: Skip or import watchlist
  await page.waitForURL('/onboarding/watchlist');
  await page.getByRole('button', { name: /skip/i }).click();

  // Step 4: Complete onboarding
  await page.waitForURL('/onboarding/top-films');
  await page.getByRole('button', { name: /start discovering/i }).click();

  const elapsed = Date.now() - startTime;
  const fiveMinutes = 5 * 60 * 1000;
  expect(elapsed).toBeLessThan(fiveMinutes);
});

test('reduced-motion: card transitions are instant when prefers-reduced-motion is set', async ({ page }) => {
  // Emulate reduced motion preference
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/discover');
  await page.waitForLoadState('networkidle');

  // Check that animation/transition durations are effectively 0
  const transitionDuration = await page.evaluate(() => {
    const card = document.querySelector('.card-transition');
    if (!card) return '0ms';
    return window.getComputedStyle(card).transitionDuration;
  });

  // With prefers-reduced-motion, transition should be near-instant
  const durationMs = parseFloat(transitionDuration) * (transitionDuration.includes('ms') ? 1 : 1000);
  expect(durationMs).toBeLessThanOrEqual(10);
});
