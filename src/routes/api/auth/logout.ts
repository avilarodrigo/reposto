import { createAPIFileRoute } from '@tanstack/react-start/api'
import { clearSessionCookie } from '@/lib/jwt'

export const POST = createAPIFileRoute('/api/auth/logout', async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
  })
})
