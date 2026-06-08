import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_LIVE_RELOAD=1 when you want the native app to hot-reload from the
// Lovable preview during development. Leave it unset for production builds so
// the APK/IPA loads the bundled `dist/` assets and works fully offline.
const useLiveReload = process.env.CAP_LIVE_RELOAD === '1';

const config: CapacitorConfig = {
  appId: 'app.lovable.0372378d7ca54902bea485260ad24c62',
  appName: 'jamb',
  webDir: 'dist',
  server: useLiveReload
    ? {
        url: 'https://0372378d-7ca5-4902-bea4-85260ad24c62.lovableproject.com?forceHideBadge=true',
        cleartext: true,
      }
    : {
        androidScheme: 'https',
        cleartext: false,
      },
  plugins: {
    AdMob: {
      // App ID for AdMob (update this with your actual App ID)
      appId: 'ca-app-pub-3175040135445213~XXXXXXXXXX',
    },
  },
};

export default config;
