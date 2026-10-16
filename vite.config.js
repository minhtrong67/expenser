import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// https://vite.dev/config/
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: {
    rolldownOptions: {
      output: {
        // Stable vendor chunks: better long-term caching, and the heavy
        // libraries stay out of the pages that never use them.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'firebase-auth', test: /node_modules[\\/](@firebase[\\/]auth|firebase[\\/]auth)[\\/]/, priority: 25 },
            { name: 'firebase-db', test: /node_modules[\\/](@firebase[\\/]firestore|firebase[\\/]firestore|@grpc|protobufjs)[\\/]/, priority: 25 },
            { name: 'firebase-core', test: /node_modules[\\/](@firebase|firebase|idb)[\\/]/, priority: 20 },
            { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|recharts-scale|decimal\.js-light|es-toolkit|immer|reselect|redux|@reduxjs)[\\/]/, priority: 20 },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'favicon.svg', 'landing.html', 'og-image.png'],
      manifest: {
        id: '/',
        name: 'Expenser - Quản lý chi tiêu cá nhân',
        short_name: 'Expenser',
        description: 'Expenser - quản lý chi tiêu cá nhân: theo dõi thu chi, ví và thống kê. Personal expense tracker.',
        lang: 'vi',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F8F9FF',
        theme_color: '#36618E',
        categories: ['finance', 'productivity'],
        // Dark-mode override for splash colours (ignored by browsers without support)
        color_scheme_dark: { background_color: '#111418', theme_color: '#111418' },
        icons: [
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        // Export libraries + the embedded PDF font are large and rarely used:
        // fetch them on demand (then cache) instead of pre-caching on install.
        globIgnores: ['**/exceljs*', '**/jspdf*', '**/html2canvas*', '**/robotoVietnamese*', '**/generateScheme*', '**/purify*', '**/index.es*', '**/og-image.png'],
        // landing.html is a standalone page, not part of the SPA
        navigateFallbackDenylist: [/^\/__/, /^\/landing\.html/, /^\/robots\.txt/, /^\/sitemap\.xml/],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /\/assets\/(exceljs|jspdf|html2canvas|robotoVietnamese|generateScheme|purify|index\.es)[^/]*\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'lazy-export-libs', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
