import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_LIVE_RELOAD=1 when you want the native app to hot-reload from the
// Lovable preview during development. Leave it unset for production builds so
// the APK/IPA loads the bundled `dist/` assets and works fully offline.
const useLiveReload = process.env.CAP_LIVE_RELOAD === '1';

const config: CapacitorConfig = {
  appId: 'com.jambcrash.app',
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
      appId: 'ca-app-pub-3175040135445213~2811266017',
    },
    BackgroundRunner: {
      label: 'com.jambcrash.app.background',
      src: 'background.js',
      event: 'jambSyncEvent',
      repeat: true,
      interval: 30,
      autoStart: true,
    },
  },
};

export default config;
