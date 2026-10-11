/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const BASE_PATH = '/kholysthenics-app/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    // Must come before react(); lazy routes use the .lazy.tsx suffix, so no auto-splitting.
    tanstackRouter({ target: 'react', autoCodeSplitting: false }),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
