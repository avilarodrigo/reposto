import { createFileRoute } from '@tanstack/react-router'
import { CheckForm } from '@/components/CheckForm'

export const Route = createFileRoute('/check/$propertyId')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }, { title: 'Reposição · Reposto' }] }),
  component: CheckPage,
})

function CheckPage() {
  const { propertyId } = Route.useParams()
  return <CheckForm key={propertyId} propertyId={propertyId} />
}
