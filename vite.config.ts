import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Keep in sync with public/_headers, which production hosts read.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': csp,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// Vite's dev server injects inline styles and scripts and uses a websocket for hot reload.
const developmentHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': csp
    .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
    .replace("style-src 'self'", "style-src 'self' 'unsafe-inline'")
    .replace("connect-src 'self'", "connect-src 'self' ws://localhost:5173 ws://127.0.0.1:5173"),
}

export default defineConfig({
  plugins: [react()],
  // Emit every asset as a file so the production CSP never needs data: URIs.
  build: { assetsInlineLimit: 0 },
  server: { headers: developmentHeaders, strictPort: true },
  preview: { headers: securityHeaders },
})
