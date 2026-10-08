import { createFileRoute } from '@tanstack/react-router'
import { HostDashboard } from '@/components/HostDashboard'

export const Route = createFileRoute('/painel')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }, { title: 'Painel · Reposto' }] }),
  component: HostDashboard,
})
