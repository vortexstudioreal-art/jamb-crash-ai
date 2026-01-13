import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0372378d7ca54902bea485260ad24c62',
  appName: 'jamb',
  webDir: 'dist',
  server: {
    url: 'https://0372378d-7ca5-4902-bea4-85260ad24c62.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    AdMob: {
      // App ID for AdMob (update this with your actual App ID)
      appId: 'ca-app-pub-3175040135445213~XXXXXXXXXX',
    },
  },
};

export default config;
