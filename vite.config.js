import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  // Default to false (HTTP). Only set in dev if certs exist.
  let https = false
  if (isDev) {
    try {
      const keyPath = path.resolve(__dirname, 'certs/key.pem')
      const certPath = path.resolve(__dirname, 'certs/cert.pem')
      https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    } catch {
      console.warn('[vite] HTTPS certs not found. Falling back to HTTP for dev.')
      https = false
    }
  }

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      https,
      host: true,
      port: 5173,
    },
  }
})
