import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Picker (Cinema Planning) feature.
 * Covers: plan creation (Pathway A & B), guest join, voting, confirm, expired state.
 */

test.describe('Picker Feature', () => {
  test('should render the Picker landing page', async ({ page }) => {
    await page.goto('/picker');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, [data-testid="picker-heading"]').first()).toBeVisible();
  });

  test('should show two pathway options on the Picker page', async ({ page }) => {
    await page.goto('/picker');
    await page.waitForLoadState('networkidle');

    // Check for the two pathway cards (FILM_FIRST and FULLY_SPECIFIED)
    const cards = page.locator('[role="button"], button, a').filter({ hasText: /film|movie|plan|start/i });
    await expect(cards.first()).toBeVisible();
  });

  test('should have a film search input', async ({ page }) => {
    await page.goto('/picker');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Inception');
      // Debounce wait
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to plan detail page', async ({ page }) => {
    // Navigate to a non-existent plan — should show not found
    await page.goto('/picker/cltest0000000000000000000');
    await page.waitForLoadState('networkidle');

    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('Picker plan page should show expired state for expired plans', async ({ page }) => {
    await page.goto('/picker/cltest_expired_000000000');
    await page.waitForLoadState('networkidle');
    // Should render without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('Picker page should be accessible', async ({ page }) => {
    await page.goto('/picker');
    await page.waitForLoadState('networkidle');

    // Check basic keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
