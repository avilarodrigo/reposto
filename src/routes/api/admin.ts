import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { getAllHosts, createUser, createInvite, findUserByEmail } from '@/lib/db'

export const Route = createFileRoute('/api/admin')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const hosts = await getAllHosts(env.DB)
          return new Response(JSON.stringify({ hosts }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error: any) {
          console.error('Erro ao listar anfitriões:', error)
          return json({ message: 'Não foi possível carregar a lista de anfitriões.' }, 500)
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json<any>()
          const { action } = body

          // ==========================================
          // FLUXO DE CRIAR NOVO ANFITRIÃO (CADASTRO)
          // ==========================================
          if (action === 'create-host') {
            const email = String(body.email ?? '').toLowerCase().trim()
            const name = String(body.name ?? '').trim()
            const whatsapp = body.whatsapp ? String(body.whatsapp).trim() : null

            if (!email || !name) {
              return json({ message: 'Nome e e-mail são obrigatórios.' }, 400)
            }

            // 1. Verifica se o usuário já existe para evitar erro de constraint única no D1
            const existingUser = await findUserByEmail(env.DB, email)
            if (existingUser) {
              return json({ message: 'Este e-mail já está cadastrado no sistema.' }, 409)
            }

            try {
              // 2. Cria o token de convite na tabela do banco D1
              const token = await createInvite(env.DB, email, 'host')
              
              // 3. Opcional: Se seu fluxo exige criar o registro desativado primeiro, você chamaria o createUser aqui.
              // Como seu formulário diz "Ele entra no painel com o mesmo e-mail", geramos o convite com sucesso.
              
              return json({ 
                success: true, 
                message: 'Anfitrião pré-cadastrado e convite gerado com sucesso.',
                token 
              }, 200)
            } catch (dbError: any) {
              console.error('Erro nas queries do banco D1 para convite:', dbError)
              return json({ 
                message: 'Erro de banco de dados ao salvar o convite.', 
                error: dbError.message 
              }, 500)
            }
          }

          // ==========================================
          // FLUXO DE CRIAR IMÓVEL
          // ==========================================
          if (action === 'create-property') {
            const { hostId, name, address } = body
            if (!hostId || !name) {
              return json({ message: 'Campos obrigatórios ausentes.' }, 400)
            }
            // Importação dinâmica ou chamada do seu método corrigido do createProperty
            const { createProperty } = await import('@/lib/db')
            const propertyId = await createProperty(env.DB, hostId, name, address)
            return json({ success: true, propertyId }, 200)
          }

          return json({ message: 'Ação administrativa não reconhecida.' }, 400)
        } catch (globalError: any) {
          console.error('Erro global na API do Admin:', globalError)
          return json({ 
            message: 'Erro interno no processamento do cadastro.',
            error: globalError.message 
          }, 500)
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
