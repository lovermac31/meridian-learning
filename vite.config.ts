import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';
import {defineConfig} from 'vite';

/**
 * P1-A: Convert Vite's render-blocking CSS <link rel="stylesheet"> into an
 * async preload so FCP fires immediately after HTML parse rather than waiting
 * for the 97KB stylesheet to download. The stylesheet loads in parallel with
 * JS but no longer gates first paint.
 *
 * A tiny inline <style> covers the dark background so there is no FOUC:
 * the loading spinner already uses 100% inline styles, and the CSS file
 * finishes downloading well before React mounts on any real connection.
 */
function asyncCssPlugin(): Plugin {
  return {
    name: 'async-css',
    apply: 'build',
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        (_, href: string) =>
          `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
      );
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), asyncCssPlugin()],
    // SECURITY: No API keys are injected into the client bundle.
    // All Gemini API calls go through the Express server proxy at /api/*.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          /**
           * P1-B: Split long-lived vendor libraries into separate hashed chunks.
           * These are stable across app code deploys — browsers cache them
           * independently, so returning visitors pay zero download cost for
           * vendor code after the first visit.
           *
           * motion/react is ~132KB source and used by Navbar, Hero,
           * InstitutionalDecisionSnapshot, and Services (all synchronous).
           * Splitting it means the browser can start parsing react first and
           * then motion, rather than one monolithic 702KB parse task.
           */
          manualChunks: {
            'vendor-react':  ['react', 'react-dom', 'react-dom/client'],
            'vendor-motion': ['motion', 'motion/react'],
            'vendor-lucide': ['lucide-react'],
          },
        },
      },
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      // Proxy API requests to the Express backend during development
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
