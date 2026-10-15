import { createStartHandler } from '@tanstack/react-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { router } from './router'

export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    ;(request as any).env = env
    const handler = createStartHandler({ router, manifest: getRouterManifest() })
    return handler(request)
  },
} satisfies ExportedHandler<Env>
