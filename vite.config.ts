/**
 * TR: Vite yapılandırması.
 *     - `/api` ile başlayan istekler geliştirmede Rust backend'ine (iam-server,
 *       127.0.0.1:8080) proxy'lenir. Tarayıcı her şeyi aynı origin'den gördüğü
 *       için CORS ayarına gerek kalmaz; üretimde de aynı yapı bir reverse proxy
 *       (nginx / ingress) ile kurulur.
 *     - `test` bloğu Vitest içindir (jsdom = tarayıcı taklidi).
 * EN: Vite configuration.
 *     - Requests under `/api` are proxied to the Rust backend (iam-server,
 *       127.0.0.1:8080) during development. The browser sees a single origin,
 *       so no CORS setup is needed; production uses the same layout behind a
 *       reverse proxy (nginx / ingress).
 *     - The `test` block is for Vitest (jsdom = browser emulation).
 */
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const backend = process.env.IAM_BACKEND_URL ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': backend },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
