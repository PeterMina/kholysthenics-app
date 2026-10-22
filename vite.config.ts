/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE_PATH = '/kholysthenics-app/';
const THEME_COLOR = '#14181d';
const BACKGROUND_COLOR = '#eef1f4';
const FONT_CACHE_SECONDS = 60 * 60 * 24 * 365;
const FONT_CACHE_ENTRIES = 20;
const GOOGLE_FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    // Must come before react(); lazy routes use the .lazy.tsx suffix, so no auto-splitting.
    tanstackRouter({ target: 'react', autoCodeSplitting: false }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'Kholysthenics',
        short_name: 'Kholy',
        description: 'Training log for the Kholysthenics program.',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        display: 'standalone',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        // GitHub API calls are never cached here; offline data comes from the app's own copy.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => GOOGLE_FONT_ORIGINS.includes(url.origin),
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: FONT_CACHE_ENTRIES, maxAgeSeconds: FONT_CACHE_SECONDS },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
