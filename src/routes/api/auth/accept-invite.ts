import { createAPIFileRoute } from '@tanstack/react-start/api'
import { signJwt, sessionCookie } from '@/lib/jwt'
import { findInvite, acceptInvite, createUser, findUserByEmail } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const POST = createAPIFileRoute('/api/auth/accept-invite', async ({ request }) => {
  const env = (request as any).env ?? {}
  const body = await request.json()
  const token = String(body.token ?? '')
  const password = String(body.password ?? '')
  if (!token || password.length < 6) return json({ message: 'Token ou senha inválidos.' }, 400)

  const invite = await findInvite(env.DB, token)
  if (!invite) return json({ message: 'Convite inválido.' }, 400)
  if (invite.accepted_at) return json({ message: 'Convite já utilizado.' }, 400)
  if (new Date(invite.expires_at) < new Date()) return json({ message: 'Convite expirado.' }, 400)

  let user = await findUserByEmail(env.DB, invite.email)
  if (!user) {
    const hashed = await hashPassword(password)
    user = await createUser(env.DB, { email: invite.email, name: invite.email.split('@')[0], password: hashed, role: invite.role })
  }
  await acceptInvite(env.DB, token)

  const jwt = await signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role }, env.JWT_SECRET)
  return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(jwt) } })
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
