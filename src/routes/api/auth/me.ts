import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { findUserById } from '@/lib/db'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = getTokenFromRequest(request)
        if (!token) return json({ error: 'unauthorized' }, 401)

        const payload = await verifyJwt(token, env.JWT_SECRET)
        if (!payload) return json({ error: 'unauthorized' }, 401)

        const user = await findUserById(env.DB, payload.sub)
        if (!user) return json({ error: 'unauthorized' }, 401)

        return json(user)
      },
    },
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
