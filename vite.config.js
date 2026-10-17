import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// ---------------------------------------------------------------------------
// Adaptive splash screen (light + dark)
//
//  - <meta name="theme-color"> pair with a prefers-color-scheme media query, so
//    the status bar / title bar already matches the OS theme before any JS runs
//    (the inline script in index.html then lets the in-app theme win).
//  - iOS has no manifest splash: it shows <link rel="apple-touch-startup-image">
//    images picked by media query, including prefers-color-scheme. Those images
//    are rendered here at build time (served on the fly by the dev server) for
//    every common iPhone/iPad size, once per colour scheme.
//  - Android builds its splash from the manifest background_color + icon. The
//    manifest spec has no dark variant yet, so the light colour stays there and
//    the WICG `user_preferences` override is added for browsers that adopt it.
// ---------------------------------------------------------------------------
const SPLASH_COLORS = {
  light: { bg: '#F8F9FF', theme: '#F8F9FF' },
  dark: { bg: '#111418', theme: '#111418' },
};

// [CSS width, CSS height, device pixel ratio] - portrait
const SPLASH_DEVICES = [
  [440, 956, 3], // iPhone 16 Pro Max
  [402, 874, 3], // iPhone 16 Pro
  [430, 932, 3], // iPhone 14/15 Pro Max, 15/16 Plus
  [393, 852, 3], // iPhone 14 Pro, 15, 16
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [390, 844, 3], // iPhone 12/13/14
  [375, 812, 3], // iPhone X/XS/11 Pro, 12/13 mini
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [414, 896, 2], // iPhone XR, 11
  [375, 667, 2], // iPhone SE / 8
  [1024, 1366, 2], // iPad Pro 12.9"
  [834, 1194, 2], // iPad Pro 11"
  [820, 1180, 2], // iPad Air / 10th gen
  [810, 1080, 2], // iPad 10.2"
  [768, 1024, 2], // iPad mini / 9.7"
];

const splashName = (scheme, w, h) => `splash/${scheme}-${w}x${h}.png`;
const splashSize = ([w, h, r]) => [w * r, h * r];

function adaptiveSplash() {
  let iconPromise;
  const cache = new Map();

  async function render(scheme, w, h) {
    iconPromise ||= loadImage(fileURLToPath(new URL('./public/icons/icon-512.png', import.meta.url)));
    const icon = await iconPromise;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = SPLASH_COLORS[scheme].bg;
    ctx.fillRect(0, 0, w, h);
    const size = Math.round(Math.min(w, h) * 0.26);
    ctx.drawImage(icon, Math.round((w - size) / 2), Math.round((h - size) / 2), size, size);
    return canvas.toBuffer('image/png');
  }

  return {
    name: 'expenser-adaptive-splash',

    transformIndexHtml() {
      const tags = [
        { tag: 'meta', attrs: { name: 'theme-color', media: '(prefers-color-scheme: light)', content: SPLASH_COLORS.light.theme }, injectTo: 'head-prepend' },
        { tag: 'meta', attrs: { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: SPLASH_COLORS.dark.theme }, injectTo: 'head-prepend' },
      ];
      for (const scheme of ['light', 'dark']) {
        for (const device of SPLASH_DEVICES) {
          const [dw, dh, ratio] = device;
          const [w, h] = splashSize(device);
          tags.push({
            tag: 'link',
            attrs: {
              rel: 'apple-touch-startup-image',
              media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait) and (prefers-color-scheme: ${scheme})`,
              href: `/${splashName(scheme, w, h)}`,
            },
            injectTo: 'head',
          });
        }
      }
      return tags;
    },

    // Dev server: render the PNGs on demand.
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/splash\/(light|dark)-(\d+)x(\d+)\.png/.exec(req.url || '');
        if (!m) return next();
        try {
          const key = `${m[1]}-${m[2]}x${m[3]}`;
          if (!cache.has(key)) cache.set(key, await render(m[1], Number(m[2]), Number(m[3])));
          res.setHeader('Content-Type', 'image/png');
          res.end(cache.get(key));
        } catch (err) {
          next(err);
        }
      });
    },

    // Build: emit every image as a static asset.
    async generateBundle() {
      const seen = new Set();
      for (const scheme of ['light', 'dark']) {
        for (const device of SPLASH_DEVICES) {
          const [w, h] = splashSize(device);
          const fileName = splashName(scheme, w, h);
          if (seen.has(fileName)) continue;
          seen.add(fileName);
          this.emitFile({ type: 'asset', fileName, source: await render(scheme, w, h) });
        }
      }
    },
  };
}

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
    adaptiveSplash(),
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
        // Dark-mode override for splash colours (WICG manifest-incubations
        // "user_preferences"; unsupported browsers just ignore it and use the
        // light colours above). iOS uses the generated startup images instead.
        user_preferences: { color_scheme: { dark: { background_color: '#111418', theme_color: '#111418' } } },
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
        globIgnores: ['**/splash/**', '**/exceljs*', '**/jspdf*', '**/html2canvas*', '**/robotoVietnamese*', '**/generateScheme*', '**/purify*', '**/index.es*', '**/og-image.png'],
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
