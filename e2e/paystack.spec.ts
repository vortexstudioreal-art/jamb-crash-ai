import { test, expect } from '@playwright/test';

/**
 * Paystack payment verification — /payment-success
 *
 * The verify step calls the paystack-verify edge function, so a real
 * verification outcome cannot be asserted without an active Supabase project.
 * These specs pin the three render states the page can enter so regressions in
 * routing or state handling are caught.
 */
test.describe('Payment verification callback', () => {
  test('route resolves and enters a verification state', async ({ page }) => {
    await page.goto('/payment-success');

    // On mount the page attempts verification, so it must show one of the
    // three known states rather than crashing or falling through to NotFound.
    const states = [
      page.getByRole('heading', { name: 'Verifying Payment' }),
      page.getByRole('heading', { name: 'Payment Successful!' }),
      page.getByRole('heading', { name: 'Payment Failed' }),
    ];

    const visible = await Promise.all(states.map((s) => s.isVisible().catch(() => false)));
    expect(visible.some(Boolean)).toBeTruthy();
  });

  test('does not fall through to the 404 catch-all', async ({ page }) => {
    await page.goto('/payment-success');
    await page.waitForLoadState('networkidle').catch(() => undefined);

    await expect(page.getByText('404')).toHaveCount(0);
    expect(page.url()).toContain('/payment-success');
  });
});
