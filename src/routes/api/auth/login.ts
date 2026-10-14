import { createAPIFileRoute } from '@tanstack/react-start/api'
import { signJwt, sessionCookie } from '@/lib/jwt'
import { findUserByEmail, getUserPassword } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

export const POST = createAPIFileRoute('/api/auth/login', async ({ request }) => {
  const env = (request as any).env ?? {}
  const body = await request.json()
  const email = String(body.email ?? '').toLowerCase().trim()
  const password = String(body.password ?? '')
  if (!email || !password) return json({ message: 'E-mail e senha são obrigatórios.' }, 400)

  const user = await findUserByEmail(env.DB, email)
  if (!user) return json({ message: 'Credenciais inválidas.' }, 401)

  const stored = await getUserPassword(env.DB, user.id)
  if (!stored) return json({ message: 'Credenciais inválidas.' }, 401)

  const ok = await verifyPassword(password, stored)
  if (!ok) return json({ message: 'Credenciais inválidas.' }, 401)

  const token = await signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role }, env.JWT_SECRET)
  return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(token) } })
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
