import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { getAllHosts, findUserByEmail, createInvite } from '@/lib/db'

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
          // ACTION: GERAR DADOS DE DEMONSTRAÇÃO
          // ==========================================
          if (action === 'generate-demo-data' || action === 'seed-demo') {
            const { hostId } = body
            if (!hostId) {
              return json({ message: 'ID do anfitrião é obrigatório para gerar dados.' }, 400)
            }

            const { seedDemoProperties } = await import('@/lib/db')
            await seedDemoProperties(env.DB, hostId)

            return json({ success: true, message: 'Imóveis de demonstração criados com sucesso!' }, 200)
          }

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

            const existingUser = await findUserByEmail(env.DB, email)
            if (existingUser) {
              return json({ message: 'Este e-mail já está cadastrado no sistema.' }, 409)
            }

            try {
              const token = await createInvite(env.DB, email, 'host')
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
            const { createProperty } = await import('@/lib/db')
            const propertyId = await createProperty(env.DB, hostId, name, address)
            return json({ success: true, propertyId }, 200)
          }

          return json({ message: 'Ação administrativa não reconhecida.' }, 400)
        } catch (globalError: any) {
          console.error('Erro global na API do Admin:', globalError)
          return json({ 
            message: 'Erro interno no processamento da ação administrativa.',
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
