import { createFileRoute } from '@tanstack/react-router'
import { clearSessionCookie } from '@/lib/jwt'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': clearSessionCookie(),
          },
        })
      },
    },
  },
})
