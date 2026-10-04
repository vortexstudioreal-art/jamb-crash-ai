# Jamb Crash AI

JAMB exam preparation app — practice questions, mock exams, study plans,
interactive lessons and a B2B reseller/collaborator programme, targeting the
Nigerian JAMB UTME.

Runs as a web app, a PWA (offline-capable) and a native app via Capacitor.

## Tech stack

- **React 18 + TypeScript** (Vite 5, strict mode)
- **Supabase** — Postgres, Auth, Edge Functions, RLS
- **Tailwind CSS + shadcn-ui** (Radix primitives)
- **Capacitor** — Android/iOS packaging, background runner, AdMob
- **Vitest** (unit) · **Playwright** (e2e)

## Getting started

```sh
npm i
cp .env.example .env      # then fill in your Supabase values
npm run dev               # http://localhost:8080
```

Required environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon/publishable key (client-safe) |
| `VITE_SUPABASE_PROJECT_ID` | project id |

Only `VITE_*` values belong here — anything prefixed `VITE_` is bundled into
the client. Secret keys (`SERVICE_ROLE`, Paystack secret) belong in Supabase
Edge Function secrets, never in this repo.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on :8080 |
| `npm run build` | **Typecheck, then bundle** — `tsc --noEmit && vite build` |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm test` | Vitest unit suite |
| `npm run test:e2e` | Playwright money-path specs (see `e2e/README.md`) |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production bundle |

> `build` runs the typecheck first, so a bundle that builds is a bundle that
> typechecks. Keep it that way.

## Project layout

```
src/
  pages/            Routes (Index, Auth, AdminPanel, ResellerDashboard, …)
  components/       UI, incl. interactive/ lesson renderers
  contexts/         AuthContext, TrialContext, DashboardContext
  hooks/            usePaystack, useB2BOrder, feature usage, SEO
  services/         errorLogger, sync, domain services
  integrations/
    supabase/       client + hand-maintained Database types
  config/           admob.ts, ads.ts
supabase/
  functions/        Deployed Edge Functions (payments, B2B, seeding, AI)
  seed-scripts/     One-off seeding scripts NOT deployed as functions
  migrations/       SQL migrations — source of truth for schema
e2e/                Playwright specs
docs/               Known gaps and deferred decisions
```

**Schema source of truth is `supabase/migrations/`.** The TypeScript types in
`src/integrations/supabase/types.ts` are maintained by hand to match them —
`supabase gen types` could not be run while the project was inactive.

## Edge functions vs. seed scripts

Supabase only deploys `supabase/functions/<name>/`. Scripts under
`supabase/seed-scripts/` are **not** deployed — invoking them from the app will
404. The AdminPanel seed buttons invoke functions that live in
`supabase/functions/`.

`supabase/config.toml` declares `verify_jwt` per function; keep the file in
sync when adding or removing functions, or they silently inherit the default.

## Testing

```sh
npm test                    # unit — no backend required
npm run test:e2e            # e2e — structural, no backend required
E2E_LIVE_BACKEND=1 npm run test:e2e   # un-skips live assertions
npx playwright install chromium        # one-time browser install
```

## Documentation

- [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md) — features configured but not
  wired, environment blockers, deferred decisions, cleanup follow-ups
- [`e2e/README.md`](e2e/README.md) — e2e scope and requirements
