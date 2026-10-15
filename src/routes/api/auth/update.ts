import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { verifyJwt, getTokenFromRequest } from '@/lib/jwt'
import { findUserById, updateUserProfile } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const Route = createFileRoute('/api/auth/update')({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const token = getTokenFromRequest(request)
        if (!token) return json({ message: 'unauthorized' }, 401)

        const payload = await verifyJwt(token, env.JWT_SECRET)
        if (!payload) return json({ message: 'unauthorized' }, 401)

        const user = await findUserById(env.DB, payload.sub)
        if (!user) return json({ message: 'unauthorized' }, 401)

        const body = await request.json<any>()
        const updates: { name?: string; password?: string } = {}
        if (body.name && String(body.name).trim().length >= 2) {
          updates.name = String(body.name).trim()
        }
        if (body.password && String(body.password).length >= 6) {
          updates.password = await hashPassword(String(body.password))
        }
        if (!updates.name && !updates.password) {
          return json({ message: 'Nada para atualizar.' }, 400)
        }

        await updateUserProfile(env.DB, user.id, updates)
        const updated = await findUserById(env.DB,
