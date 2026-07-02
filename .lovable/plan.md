## Status

The web side is already correct — no repo changes needed.

- `https://jamb-crash-ai.vercel.app/.well-known/assetlinks.json` returns `200`, `Content-Type: application/json`, with both SHA-256 fingerprints.
- Google's Digital Asset Links API confirms both statements are valid for package `com.jambcrash.ai`:
  ```
  https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://jamb-crash-ai.vercel.app&relation=delegate_permission/common.handle_all_urls
  ```
  Returns 2 statements, both fingerprints accepted.

Since the fingerprints came from Play Console and PWABuilder, they should be the right ones (Play App Signing cert + PWABuilder upload cert). So the TWA verification should pass on a fresh install.

## What to do next (no code)

1. Uninstall the current app from your test device.
2. Install the latest build fresh from Play Store (or the internal test track).
3. Open it — the URL bar should be gone.

TWA only re-runs Digital Asset Links verification on install/update, and it caches the result. That's why an already-installed app can keep showing the bar even after the server file is fixed.

## If the bar still shows after a fresh install

Then it's an Android-side mismatch, not a web-side one. Report back and I'll help with:

- Confirming the TWA's `hostName` in the Android manifest is exactly `jamb-crash-ai.vercel.app` (no `www`, no path).
- Re-pulling both fingerprints from Play Console → Test and release → App integrity → **App signing key certificate** and **Upload key certificate**, and diffing against what's in `public/.well-known/assetlinks.json`.
- Checking Chrome on the device: `chrome://flags` → enable *Site engagement* logging, or use `adb logcat | grep -i "digital_asset"` to see the exact verification error.

## Optional cleanup

The Lovable-hosted mirror at `jamb.lovable.app` currently 404s on `/.well-known/assetlinks.json` because that build hasn't been re-published since the file was added. Not required for the Play Store app (it uses the Vercel host), but if you also want the Lovable URL usable as a TWA origin later, we'd re-publish the Lovable deployment.
