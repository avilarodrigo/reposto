import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { signJwt, sessionCookie } from '@/lib/jwt'
import { findInvite, consumeInvite, releaseInvite, createUser, findUserByEmail } from '@/lib/db'
import { hashPassword } from '@/lib/password'

const MIN_PASSWORD = 8

export const Route = createFileRoute('/api/auth/accept-invite')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json<any>()
          const token = String(body.token ?? '')
          const password = String(body.password ?? '')
          
          if (!token || password.length < MIN_PASSWORD) {
            return json({ message: `Use pelo menos ${MIN_PASSWORD} caracteres na senha.` }, 400)
          }

          const invite = await findInvite(env.DB, token)
          if (!invite) return json({ message: 'Convite inválido.' }, 400)
          if (invite.accepted_at) return json({ message: 'Convite já utilizado.' }, 400)
          if (new Date(invite.expires_at) < new Date()) return json({ message: 'Convite expirado.' }, 400)

          if (await findUserByEmail(env.DB, invite.email)) {
            return json({ message: 'Este e-mail já tem conta. Faça login.' }, 409)
          }

          // Reserva o convite de forma atômica: só uma requisição consegue.
          if (!(await consumeInvite(env.DB, token))) {
            return json({ message: 'Convite já utilizado.' }, 400)
          }

          let user
          try {
            const hashed = await hashPassword(password)
            user = await createUser(env.DB, {
              email: invite.email,
              name: invite.email.split('@')[0],
              password: hashed,
              role: invite.role,
            })
          } catch (err) {
            await releaseInvite(env.DB, token) // não queima o convite se a criação falhar
            console.error('Erro ao registrar usuário ou gerar hash:', err)
            return json({ message: 'Erro ao criar a conta. O convite não foi queimado.' }, 500)
          }

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
        } catch (globalError) {
          console.error('Erro global na rota accept-invite:', globalError)
          return json({ message: 'Erro interno ao processar o processamento do convite.' }, 500)
        }
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
