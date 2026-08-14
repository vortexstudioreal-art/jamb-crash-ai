# Bringing your local changes back in, on your own Supabase

## Direct answers

**Will the backend follow the updated code?**
Not by itself. Git sync carries files — `src/`, `supabase/functions/`, `supabase/migrations/`.
It does not run migrations or deploy functions. Right now this project is still wired to the
Lovable Cloud backend, so even after your push lands, the live database and deployed functions
here are the old managed ones until the backend is switched over.

**Will your changes reflect here?**
Yes. The repo is already two-way synced, so once you push to the default branch the files appear
in this project. Latest commit currently here is `64f1045` — your local work has not landed yet.

One warning: `.env`, `src/integrations/supabase/client.ts`, and `src/integrations/supabase/types.ts`
are Lovable-managed while Lovable Cloud is on. If your local copies point at your own Supabase,
Lovable will keep overwriting them. That conflict is exactly what step 1 below removes.

**Can you still use the Lovable AI key?**
Yes, but only if Lovable is the one deploying your edge functions. `LOVABLE_API_KEY` is never
readable — it is injected into functions Lovable deploys. So the way to keep it while using your
own Supabase is to connect your Supabase project to Lovable (option A), not to run functions
outside Lovable's reach.

## Recommended setup for what you asked (Vercel + your Supabase + Lovable AI)

```text
GitHub repo  <-->  Lovable (editor, deploys functions + migrations)
     |                        |
     v                        v
  Vercel (frontend)     Your Supabase project
                        (LOVABLE_API_KEY injected here by Lovable)
```

### Step 1 - Push your local work first
Push your branch to the synced repo before anything else, so Lovable has your code as the
starting point. Do not push a `.env` containing your Supabase service role key.

### Step 2 - Switch this project from Lovable Cloud to your Supabase
Disable Lovable Cloud and connect your own Supabase project instead (Settings, Cloud/Backend).
This makes Lovable regenerate `.env`, `client.ts`, and `types.ts` against *your* project, so the
overwrite conflict disappears and the files stop fighting your local versions.

### Step 3 - Apply schema and deploy functions to your project
Once connected, I re-run the migrations in `supabase/migrations/` against your project and deploy
everything under `supabase/functions/`. Anything you already created by hand in your Supabase
dashboard needs to either be reflected as a migration or skipped, so we do not double-apply.

### Step 4 - Re-provision LOVABLE_API_KEY
After the switch, the AI key is provisioned as a secret on your Supabase project's functions, so
`Deno.env.get("LOVABLE_API_KEY")` keeps working in `chat`, `generate-topic-content`,
`enrich-novel-chapters`, and the rest. No code change needed in those functions.

### Step 5 - Vercel env vars
Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` in Vercel
to your project's values so the deployed frontend talks to your backend.

## If you would rather not connect your Supabase to Lovable

Then Lovable cannot deploy to it, and the AI key cannot be injected. In that case the functions
need to switch from `LOVABLE_API_KEY` + `ai.gateway.lovable.dev` to your own provider key
(Google AI Studio / OpenAI) read from a secret you set in your own Supabase dashboard. I can do
that rewrite instead — say the word and I will plan that variant.

## What I need from you before implementing

1. Push your local commits to the synced repo.
2. Confirm you want option A (connect your Supabase to Lovable) rather than the own-provider-key
   variant.
3. Tell me whether your Supabase project already has the schema applied, or is empty.
