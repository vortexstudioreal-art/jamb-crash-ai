## Plan: make offline login reliable before PWABuilder deployment

### 1. Fix the “offline login sometimes shows reset / wrong screen” issue
- Treat offline startup as a cached-session restore, not a fresh online login attempt.
- If the browser is offline and a previous session/email exists, immediately restore cached access + subjects and send the user to the dashboard.
- Prevent the trial/access checks from waiting on backend calls while offline, because that delay can leave users on the landing/reset/payment-type screen.

### 2. Cache trial state for offline use
- Save the user’s last known trial status locally when online.
- When offline, restore that cached trial state instead of calling the backend.
- This stops the app from thinking the user has no valid trial/access just because there is no internet.

### 3. Make service worker control stronger for hard refresh / cold start
- Register the service worker earlier instead of waiting for full page load.
- After first install, if the service worker is active but not controlling the page yet, do one safe reload only after caching is ready.
- Keep the existing Lovable preview/dev guards so offline caching only affects the published app, not the editor preview.

### 4. Improve PWABuilder service worker detection
- Ensure the published site exposes `/sw.js` through `vite-plugin-pwa` in production.
- Add a tiny diagnostic log only in production builds so we can confirm the worker registered and is controlling the page.
- Do not use PWABuilder’s generated worker; keep our app’s Workbox worker because it already understands the app shell and offline cache rules.

### 5. Offline checklist polish
- Update the onboarding checklist so it confirms not just “cache exists”, but also “service worker is controlling this app”.
- If setup is incomplete, show a clear action like “Open once online to finish offline setup”.

### Verification
- Confirm the app still runs normally online.
- Confirm offline hard refresh uses cached app shell and lands signed-in users on dashboard.
- Confirm PWABuilder can detect the service worker after the next production deployment.

### Notes
- Offline login can only work for users who already opened the app online once on that same device. A brand-new offline login cannot be verified securely without internet.