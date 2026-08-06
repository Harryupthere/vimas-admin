import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Serves/builds the app under this sub-path (e.g. https://host/admin/...).
    // Set VITE_BASE_PATH in .env WITH a trailing slash (e.g. "/admin/") —
    // Vite's %BASE_URL% substitution in index.html doesn't add one itself.
    // Defaults to '/' when unset. See src/utils/basePath.ts for the
    // slash-free form react-router's basename needs.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
  }
})
