# Known gaps & deferred decisions

Status of this document: written during the Phase 1–3 "ship the core app"
pass. Items here were **investigated and deliberately left alone** — they are
not oversights.

---

## 1. Features that are configured but not wired

Each of these looks live from configuration, but no reachable code path uses
them. **No runtime behaviour changed when they were identified**; they were
removed only where they were provably unreachable from `src/main.tsx`.

### 1.1 Banner ads never render

- `src/config/admob.ts` and `src/config/ads.ts` hold valid, committed ad unit
  IDs, and `index.html` loads the AdSense script.
- The component that would display a banner (`BannerAd.tsx`, 211 LOC) had **no
  importers** — it was unreachable, so no banner was ever mounted.
- **Consequence:** ad impressions were not being served through the app.
- **To restore:** re-create the banner component and mount it in the app shell,
  keeping the existing IDs from `src/config/admob.ts` / `src/config/ads.ts`.
- Also worth verifying: `index.html` passes `ca-app-pub-…` (an AdMob-style ID)
  as the AdSense `client` parameter, where AdSense normally expects `ca-pub-…`.
  Left untouched deliberately — the IDs belong to the project owner.

### 1.2 Free trial can be read, but never started

- `TrialContext` **is** live: `TrialProvider` wraps the app in `App.tsx`, and
  `FeatureGate` + `Index` read `canStartTrial` / trial state from it.
- `startTrial()` was called from exactly two files (`TrialBanner`,
  `FreeTrialBanner`), **both unreachable**.
- **Consequence:** trial state gates content, but nothing a user can reach
  starts a trial. The supporting UI (`TrialQuiz`, `TrialDashboard`,
  `FreeTrialFlow`, `FreeTrialSubjectPicker`, screens and modals — ~2,000 LOC)
  was unreachable and has been removed.
- **To restore:** re-implement the trial UI and call `startTrial()` from a
  reachable entry point; the `TrialContext` API and `user_trials` /
  `demo_usage` tables are intact.

### 1.3 Capacitor background runner points at a file that is never built

- `capacitor.config.ts` sets `BackgroundRunner.src: 'background.js'`.
- **No `background.js` exists anywhere in the repo, and no npm script builds
  one.** The source (`src/background.ts`, 87 LOC — offline quiz sync via
  `@capacitor/background-runner`) was unreachable from `main.tsx` and has been
  removed.
- **Consequence:** the background sync feature was never functional.
- **To restore:** re-create the source and add a build step that emits
  `background.js` where `capacitor.config.ts` expects it.

---

## 2. Environment blocker: inactive Supabase project

The Supabase project `pjdgzqnyyobtiwplatni` is **inactive**, which blocks:

| Blocked | Impact |
|---|---|
| `supabase gen types` | Table types are hand-maintained in `src/integrations/supabase/types.ts` (7 tables + 3 enums written from migrations) |
| Question-count audits | Cannot read live `jamb_questions` row counts |
| Deploying / invoking edge functions | Seed and payment functions cannot be tested |
| Running e2e against a live backend | See §3 |

Nothing in Phases 1–3 required live DB access, but re-enabling the project is
the first step for any of the above.

---

## 3. E2E is written but not executed

`playwright.config.ts` + `e2e/` cover the three money paths (Paystack verify,
B2B reseller ordering, PIN redemption) — **8 tests in 3 files**.

They are **structural**: routes resolve, controls render, and protected routes
do not leak content to signed-out visitors. They intentionally do not assert
successful payment/order/redemption outcomes.

**Why they have not been run:** they require an active Supabase project with
the `paystack-*` and `b2b-*` edge functions deployed (§2), plus browser
binaries (`npx playwright install chromium`). See `e2e/README.md`.

```sh
npm run test:e2e                 # structural specs
E2E_LIVE_BACKEND=1 npm run test:e2e   # un-skips live assertions
```

---

## 4. Deferred by decision (out of "ship the core app")

Explicitly **not** part of this pass, per the agreed target bar:

1. **Push notifications.** `@capacitor/push-notifications` is installed and
   service-worker/`Notification` plumbing exists in `main.tsx`, `registerSW.ts`
   and `Settings.tsx`, but the `usePushNotifications` hook was unreachable and
   has been removed. Push remains a deferred feature.
2. **Agricultural Science materials.**
3. **Scholarship engine.**

---

## 5. Cleanup follow-ups (optional, not required to ship)

- **Unused dependencies.** Deleting the unreachable shadcn/ui components left
  some packages without a live importer (`input-otp`, `react-day-picker`,
  `embla-carousel-react`, `cmdk`, `vaul`, `react-resizable-panels`,
  `@radix-ui/react-toast`, …). They are **not bundled** — nothing imports them —
  but they still occupy `node_modules`. A dep-audit + `npm prune` would tidy
  this; deliberately not done here to keep the green build untouched.
- **`vite.config.ts` `manualChunks`** still lists a few of those packages.
  Harmless: Rollup only chunks modules present in the graph.
- **`vitest.config.ts` warning:** uses `__dirname`, which Vite flags as
  unsupported under the future native config loader. Cosmetic today.
