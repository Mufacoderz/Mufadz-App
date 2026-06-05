import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },

      manifest: {
        name: "Mufadz Portal",
        short_name: "Mufadz",
        description: "Web App Islamic Multi Fitur - Al-Qur'an, Doa, Adzan, Kiblat, dan lain-lain",
        start_url: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        orientation: "any",
        categories: ["lifestyle", "productivity", "religion"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => 
              ['image', 'style', 'script'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
          }
        ]
      }
    })
  ]
})