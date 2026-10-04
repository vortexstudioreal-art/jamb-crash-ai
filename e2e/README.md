# E2E tests (money paths)

Playwright coverage for the three money paths: **Paystack checkout/verify**,
**B2B reseller ordering**, and **PIN redemption**.

## Status: written, not executable in this environment

The suite was authored while the Supabase project (`pjdgzqnyyobtiwplatni`) was
**inactive**, so it could not be run against a live backend. The specs are
therefore **structural**: they assert that routes resolve, that the expected
controls render, and — importantly — that protected routes do not leak their
content to signed-out visitors.

They deliberately do **not** assert successful payment, order, or redemption
outcomes, because those depend on deployed edge functions
(`paystack-initialize`, `paystack-verify`, `b2b-initialize-order`,
`b2b-verify-order`, `b2b-redeem-pin`) plus seeded rows.

## Running

```sh
# Starts the dev server on :8080 automatically (see playwright.config.ts).
npm run test:e2e

# Point at an already-running server instead
E2E_BASE_URL=http://localhost:8080 npm run test:e2e

# Unlock the specs that need a real backend
E2E_LIVE_BACKEND=1 npm run test:e2e
```

Browsers are not installed by default:

```sh
npx playwright install chromium
```

## Requirements for full (non-structural) coverage

1. Supabase project active and healthy.
2. `supabase functions deploy` for the `paystack-*` and `b2b-*` functions.
3. A seeded buyer + `pin_codes` row, and a Paystack test key.
4. Set `E2E_LIVE_BACKEND=1` to un-skip the live assertions.

## Files

| File | Covers |
|---|---|
| `paystack.spec.ts` | `/payment-success` verify callback: all three render states |
| `reseller.spec.ts` | `/reseller` auth guard + buyer registration controls |
| `pin-redeem.spec.ts` | `/redeem-pin` form rendering and route stability |
