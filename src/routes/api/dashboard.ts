import { createAPIFileRoute } from '@tanstack/react-start/api'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { getDashboardData } from '@/lib/db'

export const GET = createAPIFileRoute('/api/dashboard', async ({ request }) => {
  const env = (request as any).env ?? {}
  const token = getTokenFromRequest(request)
  if (!token) return json({ error: 'unauthorized' }, 401)
  const payload = await verifyJwt(token, env.JWT_SECRET)
  if (!payload) return json({ error: 'unauthorized' }, 401)
  const data = await getDashboardData(env.DB, payload.sub)
  return json(data)
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
