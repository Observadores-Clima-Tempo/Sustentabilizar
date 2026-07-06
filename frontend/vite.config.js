import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // necessário para funcionar dentro do Docker
      allowedHosts: env.ALLOWED_HOSTS
        ? env.ALLOWED_HOSTS.split(',').map(h => h.trim()).filter(Boolean)
        : [],
    },
  }
})
