import { test, expect } from '@playwright/test';

/**
 * PIN redemption — /redeem-pin
 *
 * Structural coverage: the route resolves and the redemption form renders its
 * required controls. Asserting a successful redemption would need the
 * b2b-redeem-pin edge function plus a live pin_codes row (inactive project).
 */
test.describe('PIN redemption', () => {
  test('route resolves and renders the redemption form', async ({ page }) => {
    await page.goto('/redeem-pin');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('exposes the PIN entry inputs', async ({ page }) => {
    await page.goto('/redeem-pin');

    // PIN is entered as individual digit boxes with XXXX-style placeholders.
    const pinBoxes = page.getByPlaceholder(/X{3,4}/);
    await expect(pinBoxes.first()).toBeVisible();
    await expect(await pinBoxes.count()).toBeGreaterThan(1);
  });

  test('does not navigate away from the redemption route', async ({ page }) => {
    await page.goto('/redeem-pin');
    await page.waitForLoadState('networkidle').catch(() => undefined);

    expect(page.url()).toContain('/redeem-pin');
    // No NotFound catch-all content.
    await expect(page.getByText('404')).toHaveCount(0);
  });
});
