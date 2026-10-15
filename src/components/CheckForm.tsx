import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

type StockItem = { id: string; name: string; detail: string | null; category: string; pct: number }
type PropertySummary = { id: string; name: string; address: string | null; items: StockItem[] }

export function CheckForm({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<PropertySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  
  // Mapeia alterações locais temporárias: { itemId: pct }
  const [changes, setChanges] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch(`/api/check/${propertyId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: PropertySummary) => {
        setProperty(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [propertyId])

  const handleSelectLevel = (itemId: string, pctValue: number) => {
    setChanges((prev) => ({ ...prev, [itemId]: pctValue }))
  }

  const handleSave = async () => {
    const totalChanges = Object.keys(changes).length
    if (totalChanges === 0) return
    
    setBusy(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/check/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: changes }),
      })
      
      if (!res.ok) throw new Error()
      
      setMessage({ tone: 'ok', text: 'Estoque atualizado e enviado para o painel!' })
      setChanges({})
      
      // Atualiza o estado local do componente com os novos valores
      if (property) {
        const updatedItems = property.items.map((item) => 
          changes[item.id] !== undefined ? { ...item, pct: changes[item.id] } : item
        )
        setProperty({ ...property, items: updatedItems })
      }
    } catch {
      setMessage({ tone: 'err', text: 'Não foi possível sincronizar o estoque.' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="mt-12 text-center text-fg-soft font-medium">
        Imóvel não localizado ou QR Code inativo.
      </div>
    )
  }

  const categories = Array.from(new Set(property.items.map((i) => i.category)))

  return (
    <div className="pb-24">
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">Reposição</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{property.name}</h1>
        {property.address && <p className="text-sm text-fg-soft mt-1">{property.address}</p>}
        <p className="mt-3 text-sm text-fg-soft leading-relaxed">
          Toque no nível de cada item. Só o que você marcar será atualizado.
        </p>
      </header>

      {message && (
        <p role="status" className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium text-center ${message.tone === 'ok' ? 'bg-success/15 text-success' : 'bg-brand/10 text-brand'}`}>
          {message.text}
        </p>
      )}

      <div className="mt-8 space-y-8">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-fg-muted mb-3.5">{cat}</h2>
            <div className="space-y-3.5">
              {property.items
                .filter((i) => i.category === cat)
                .map((item) => {
                  const currentPct = changes[item.id] !== undefined ? changes[item.id] : item.pct

                  return (
                    <div key={item.id} className="p-4 sm:p-5 bg-surface rounded-3xl border border-fg/10">
                      <div className="flex justify-between items-baseline mb-3.5">
                        <h3 className="font-semibold text-base text-fg">{item.name}</h3>
                        {item.detail && <span className="text-xs text-fg-muted font-medium">{item.detail}</span>}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => handleSelectLevel(item.id, 100)}
                          className={`py-2.5 rounded-xl border text-center transition active:scale-95 ${currentPct === 100 ? 'bg-inverse text-inverse-fg border-inverse' : 'bg-page border-fg/15 text-fg-soft'}`}
                        >
                          Cheio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectLevel(item.id, 50)}
                          className={`py-2.5 rounded-xl border text-center transition active:scale-95 ${currentPct === 50 ? 'bg-inverse text-inverse-fg border-inverse' : 'bg-page border-fg/15 text-fg-soft'}`}
                        >
                          Pela metade
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectLevel(item.id, 25)}
                          className={`py-2.5 rounded-xl border text-center transition active:scale-95 ${currentPct === 25 ? 'bg-inverse text-inverse-fg border-inverse' : 'bg-page border-fg/15 text-fg-soft'}`}
                        >
                          Acabando
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectLevel(item.id, 0)}
                          className={`py-2.5 rounded-xl border text-center transition active:scale-95 ${currentPct === 0 ? 'bg-inverse text-inverse-fg border-inverse' : 'bg-page border-fg/15 text-fg-soft'}`}
                        >
                          Acabou
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-page border-t border-fg/5 max-w-5xl mx-auto z-10">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || Object.keys(changes).length === 0}
            className="w-full py-3.5 bg-inverse text-inverse-fg font-semibold rounded-full shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? 'Salvando alterações…' : Object.keys(changes).length > 0 ? `Salvar ${Object.keys(changes).length} itens` : 'Salvar itens'}
          </button>
        </div>
      </div>
    </div>
  )
}
