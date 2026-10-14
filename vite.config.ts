import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart({ entry: './src/entry-worker.tsx', target: 'cloudflare-module' }),
    react(),
  ],
  resolve: { alias: { '@': '/src' } },
})
