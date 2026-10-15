import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { createPasswordResetToken, validateResetToken, executePasswordReset } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const Route = createFileRoute('/api/auth/reset-password')({
  server: {
    handlers: {
      // POST: Solicita o link de redefinição
      POST: async ({ request }) => {
        try {
          const body = await request.json<any>()
          const email = String(body.email ?? '').toLowerCase().trim()

          if (!email) return json({ message: 'O e-mail é obrigatório.' }, 400)

          const token = await createPasswordResetToken(env.DB, email)
          
          if (token) {
            const resetLink = `https://reposto.ia{token}`
            console.log(`Link de reset enviado para ${email}: ${resetLink}`)
            
            // TODO: Integrar aqui o seu envio de e-mail ou mensagem de WhatsApp com o link
          }

          // Retornamos sucesso mesmo se o e-mail não existir por motivos de segurança (User Enumeration)
          return json({ message: 'Se o e-mail existir, um link de redefinição foi enviado.' }, 200)
        } catch (error) {
          return json({ message: 'Erro ao solicitar redefinição.' }, 500)
        }
      },

      // PATCH: Confirma e aplica a nova senha
      PATCH: async ({ request }) => {
        try {
          const body = await request.json<any>()
          const token = String(body.token ?? '').trim()
          const newPassword = String(body.password ?? '')

          if (!token || newPassword.length < 8) {
            return json({ message: 'Token inválido ou senha muito curta (mínimo 8 caracteres).' }, 400)
          }

          const userId = await validateResetToken(env.DB, token)
          if (!userId) {
            return json({ message: 'Link de redefinição inválido ou expirado.' }, 400)
          }

          // Gera o hash usando a nossa função corrigida com substring()
          const hashed = await hashPassword(newPassword)
          await executePasswordReset(env.DB, token, userId, hashed)

          return json({ success: true, message: 'Senha atualizada com sucesso! Faça login.' }, 200)
        } catch (error) {
          return json({ message: 'Erro ao atualizar a senha.' }, 500)
        }
      }
    }
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
