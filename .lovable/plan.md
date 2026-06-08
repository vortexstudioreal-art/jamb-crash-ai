## Context

Your APK is an **appbuilder24 WebView wrapper** pointing at `https://jamb.lovable.app`. It is NOT a Capacitor build, so:

- The wrapper loads the live URL on every cold start.
- If the user is offline on cold start with no cached HTML, they see a white screen / "no internet" error from the WebView.
- Offline therefore depends entirely on the **service worker registered inside that URL** during the user's first online visit.

The current setup already has `vite-plugin-pwa` + `/sw.js` + `NetworkFirst` for HTML, but a few gaps stop the wrapper from being reliably usable offline.

---

## Part 1 — Offline that actually works in the wrapper

### 1. App shell + navigation (no white screen)

- Confirm `navigateFallback: "/index.html"` is producing a precached `index.html` (it is, but verify Workbox precache list includes it after build).
- Widen `globPatterns` to include `json` and `webmanifest` so the manifest and any static JSON load offline.
- Add a tiny **offline fallback page** (`public/offline.html`) and wire it via `navigateFallback` so if even `index.html` is missing on first-ever offline open, the user sees a branded "You're offline — open the app once online to install it" screen instead of a WebView error. This matters specifically for the wrapper.

### 2. Last-viewed pages auto-cached

- Add a `runtimeCaching` rule for same-origin navigations using `NetworkFirst` with a small `pages-cache` (already partially covered by navigateFallback, but make it explicit with a 7-day expiration so revisits to recently-seen routes work offline).
- Add `CacheFirst` for same-origin hashed JS/CSS chunks (Workbox precache already covers built assets, but lazy-loaded route chunks visited at runtime need a runtime rule).
- Add `StaleWhileRevalidate` for images under `/assets/` and Supabase storage public URLs (so downloaded book covers / PDFs thumbnails stay visible offline).

### 3. Downloaded quizzes / flashcards / syllabus

- Already handled by `DownloadManager` → IndexedDB via `src/services/offlineStorage.ts`. No change needed; verify reads work when `navigator.onLine === false`.
- Add a small audit pass: every screen that calls Supabase for "downloaded" content should fall back to `offlineStorage` when offline. Targets to check: `TimedQuiz`, `Flashcards`, `SyllabusReader`, `StudyMaterials`, `NovelReader`.

### 4. Auth/session persistence offline

- Supabase client already persists session in `localStorage` by default — survives offline.
- Guard `AuthContext` so it does **not** sign the user out when `getUser()` fails due to network error (only sign out on explicit 401). This is the main reason users get bounced to the login screen offline.
- `ProtectedRoute` should treat "session exists in storage + offline" as authenticated and render cached content instead of redirecting to `/auth`.

### 5. First-install UX for wrapper users

- On the landing page, show a one-time banner: *"Open the app once with internet to enable offline mode."* Dismiss after the SW has activated (`navigator.serviceWorker.ready`).
- Suppress the existing `InstallPrompt` PWA card when running inside the wrapper (detect via UA string `appbuilder24` or absence of `beforeinstallprompt`).

### 6. Cache hygiene

- Keep `registerType: "autoUpdate"` (already set) so the wrapper picks up new builds automatically next time it's online.
- Add a "Clear offline cache" button in Settings → calls `caches.keys()` + `indexedDB` clears, for support cases.

---

## Part 2 — Dashboard polish (after offline ships)

Queued for the follow-up turn, not this one:

- **Recent Progress**: add empty state + week-over-week delta badge.
- **Subject Performance**: tap a row → opens a sheet with "Weakest topics in {subject}" pulled from Topic Mastery.
- **Topic Mastery**: filter by subject, sort by mastery, "Practice weak topics" CTA wired to `TimedQuiz`.
- Visual consistency pass: shared card header style, consistent muted/primary semantic tokens, motion on data load.

---

## Technical details

**Files to change for Part 1:**

```text
vite.config.ts                  – widen globPatterns; add runtimeCaching for
                                  navigations, hashed assets, images, storage
public/offline.html             – new branded offline fallback
src/registerSW.ts               – on activation, prefetch /offline.html + /
src/contexts/AuthContext.tsx    – don't sign out on network error
src/components/ProtectedRoute.tsx – allow cached session when offline
src/components/InstallPrompt.tsx – hide inside appbuilder24 wrapper
src/components/OfflineIndicator.tsx – reuse for the first-install hint
src/pages/Settings.tsx          – "Clear offline cache" button
```

**No backend / DB / edge-function changes.** Pure frontend + service-worker config.

**Verification after build:**
1. Open published URL once online → DevTools → Application → Service Workers shows `/sw.js` active.
2. Throttle to Offline → hard refresh → app shell loads, downloaded quizzes accessible, session intact.
3. Cold-start wrapper offline (never opened before) → branded offline page, not WebView error.
4. Cold-start wrapper offline (opened once online) → full app loads with cached content.

Part 2 dashboard work will be planned separately once Part 1 is verified.
