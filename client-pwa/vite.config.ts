import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      cssModules: true,
    },
  },
  plugins: [
    react(),
    process.env.ANALYZE === '1'
      ? analyzer({
          analyzerPort: 3003,
          openAnalyzer: false,
        })
      : undefined,
    VitePWA({
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ sameOrigin }) => {
              return sameOrigin;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
            },
          },
        ],
      },
      manifest: {
        id: 'arjya-pwa',
        name: 'Arjya PWA',
        short_name: 'Arjya PWA',
        start_url: '.',
        display: 'standalone',
        categories: ['entertainment'],
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        theme_color: '#ffffff',
      },
    }),
  ],
});
