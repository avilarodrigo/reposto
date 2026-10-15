import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: { preset: 'cloudflare-module' },
  tsr: {
    // Ignora qualquer arquivo ou subpasta dentro de src/routes/api/
    routeFileIgnorePattern: "((^|\\/)api\\/)"
  }
})
