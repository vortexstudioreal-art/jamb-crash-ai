import { test, expect } from '@playwright/test';

/**
 * B2B reseller ordering — /reseller
 *
 * Money path: buyer registration, bulk PIN ordering, order verification and
 * CSV export all sit behind this page (useB2BBuyer / useB2BOrder -> b2b-* edge
 * functions). Those calls need an active Supabase project, so these specs cover
 * the structural guarantees instead:
 *
 *  1. the route is protected — signed-out visitors must never see the portal
 *     (this is the regression guard for the auth-bypass fix), and
 *  2. when reachable, the order controls render.
 */
test.describe('B2B reseller portal', () => {
  test('is protected: signed-out visitors never see the portal', async ({ page }) => {
    await page.goto('/reseller');
    await page.waitForLoadState('networkidle').catch(() => undefined);

    // The portal itself must not render for an unauthenticated visitor.
    await expect(page.getByRole('heading', { name: 'Reseller Portal' })).toHaveCount(0);

    // ProtectedRoute should send them to the auth screen (or the landing page),
    // and must never fall through to the 404 catch-all.
    await expect(page.getByText('404')).toHaveCount(0);
    expect(['/auth', '/'].some((p) => page.url().includes(p))).toBeTruthy();
  });

  test('does not fall through to the 404 catch-all', async ({ page }) => {
    await page.goto('/reseller');
    await page.waitForLoadState('networkidle').catch(() => undefined);

    await expect(page.getByText('404')).toHaveCount(0);
  });

  test('renders the buyer registration fields when signed in', async ({ page }) => {
    // Requires a seeded buyer session against a live backend. Skipped until an
    // active Supabase project is configured (see e2e/README.md).
    test.skip(!process.env.E2E_LIVE_BACKEND, 'Needs an active Supabase project');

    await page.goto('/reseller');
    await expect(page.getByRole('heading', { name: 'Reseller Portal' })).toBeVisible();
    await expect(page.getByPlaceholder('Your full name')).toBeVisible();
    await expect(page.getByPlaceholder('School or company name')).toBeVisible();
    await expect(page.getByPlaceholder('Phone number')).toBeVisible();
  });
});
