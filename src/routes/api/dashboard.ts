import { createFileRoute } from '@tanstack/react-router' 
import { env } from 'cloudflare:workers'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { getDashboardData } from '@/lib/db'

export const Route = createFileRoute('/api/dashboard')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = getTokenFromRequest(request)
        if (!token) return json({ error: 'unauthorized' }, 401)

        const payload = await verifyJwt(token, env.JWT_SECRET)
        if (!payload) return json({ error: 'unauthorized' }, 401)

        const data = await getDashboardData(env.DB, payload.sub)
        return json(data)
      },
    },
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
