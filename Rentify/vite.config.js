import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // Must match the CORS origin allowed by the backend (SecurityConfiguration).
    // strictPort: fail loudly if 5173 is busy instead of silently moving to 5174.
    port: 5173,
    strictPort: true,
  },
})
