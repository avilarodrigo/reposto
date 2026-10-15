import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { signJwt, sessionCookie } from '@/lib/jwt'
import { findInvite, acceptInvite, findUserByEmail, createUser } from '@/lib/db'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json<any>()
        const token = String(body.token ?? '')
        if (!token) return json({ message: 'Token ausente.' }, 400)

        const invite = await findInvite(env.DB, token)
        if (!invite) return json({ message: 'Token inválido.' }, 400)

        let user = await findUserByEmail(env.DB, invite.email)
        if (!user) {
          user = await createUser(env.DB, {
            email: invite.email,
            name: invite.email.split('@')[0],
            password: 'pending-set-via-update',
            role: invite.role,
          })
        }
        await acceptInvite(env.DB, token)

        const jwt = await signJwt(
          { sub: user.id, email: user.email, name: user.name, role: user.role },
          env.JWT_SECRET,
        )
        return new Response(JSON.stringify(user), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': sessionCookie(jwt),
          },
        })
      },
    },
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
