import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      includeAssets: ["favicon.ico", "favicon.png", "robots.txt"],
      manifest: false, // We use our own manifest.webmanifest
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/],
        navigationPreload: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: [
          "index.html",
          "favicon.ico",
          "favicon.png",
          "robots.txt",
          "*.webmanifest",
        ],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Same-origin SPA navigations — keep recent pages available offline
          {
            urlPattern: ({ request, url, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) =>
              request.mode === "navigate" &&
              sameOrigin &&
              !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Same-origin hashed JS/CSS chunks loaded at runtime (lazy routes)
          {
            urlPattern: ({ request, sameOrigin }: { request: Request; sameOrigin: boolean }) =>
              sameOrigin &&
              (request.destination === "script" || request.destination === "style"),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images — keep covers/thumbs available offline
          {
            urlPattern: ({ request }: { request: Request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
    process.env.ANALYZE && visualizer({ open: true, gzipSize: true }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "radix-ui": [
            "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar", "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible", "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card", "@radix-ui/react-label",
            "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover", "@radix-ui/react-progress",
            "@radix-ui/react-radio-group", "@radix-ui/react-scroll-area",
            "@radix-ui/react-select", "@radix-ui/react-separator",
            "@radix-ui/react-slider", "@radix-ui/react-slot",
            "@radix-ui/react-switch", "@radix-ui/react-tabs",
            "@radix-ui/react-toast", "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group", "@radix-ui/react-tooltip",
          ],
          "framer-motion": ["framer-motion"],
          "supabase": ["@supabase/supabase-js"],
          "markdown": ["react-markdown"],
          "icons": ["lucide-react"],
          "charts": ["recharts"],
          "forms": ["react-hook-form", "zod"],
          "query": ["@tanstack/react-query"],
          "ui-extra": [
            "sonner",
            "vaul",
            "cmdk",
            "date-fns",
            "canvas-confetti",
            "idb",
            "embla-carousel-react",
            "next-themes",
            "react-day-picker",
            "react-resizable-panels",
            "input-otp",
          ],
        },
      },
    },
  },
}));
