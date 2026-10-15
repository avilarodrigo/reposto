import { createFileRoute } from '@tanstack/react-router'
import { CheckForm } from '@/components/CheckForm'

export const Route = createFileRoute('/check/$propertyId')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }, { title: 'Reposição · Reposto' }] }),
  component: CheckPage,
})

function CheckPage() {
  const { propertyId } = Route.useParams()
  return (
    <main className="min-h-svh bg-page px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-xl">
        <CheckForm key={propertyId} propertyId={propertyId} />
      </div>
    </main>
  )
}
