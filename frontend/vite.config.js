import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'icons/icon-192x192.png', 'icons/icon-512x512.png', 'icons/icon-maskable-192x192.png', 'icons/icon-maskable-512x512.png'],
        manifest: {
          name: 'Sustentabilizar — Certificação Ambiental',
          short_name: 'Sustentabilizar',
          description: 'Plataforma de certificação ambiental para quem recicla com responsabilidade.',
          theme_color: '#15803D',
          background_color: '#15803D',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/icon-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icons/icon-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
    server: {
      port: 5173,
      host: true, // necessário para funcionar dentro do Docker
      allowedHosts: env.ALLOWED_HOSTS
        ? env.ALLOWED_HOSTS.split(',').map(h => h.trim()).filter(Boolean)
        : [],
    },
  }
})
