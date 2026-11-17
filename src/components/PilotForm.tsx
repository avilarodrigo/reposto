import { ArrowUpRight, CheckCircle2, MessageCircle } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { whatsappLink } from '@/lib/whatsapp'

const propertyOptions = ['1–2 imóveis', '3–10 imóveis', '11–30 imóveis', 'Mais de 30 imóveis']

const nextSteps = [
  'Você conta quantos imóveis administra e onde eles ficam.',
  'A gente monta o kit do primeiro imóvel e combina o ciclo.',
  'A primeira entrega é acompanhada de perto pela equipe.',
]

const field =
  'mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 text-fg outline-none transition focus:border-brand'

export function PilotForm() {
  const [link, setLink] = useState<string | null>(null)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const whatsapp = String(form.get('whatsapp') ?? '').trim()
    const properties = String(form.get('properties') ?? '').trim()
    const neighborhoods = String(form.get('neighborhoods') ?? '').trim()
    const current = String(form.get('current') ?? '').trim()

    const message = [
      'Olá! Quero participar do piloto da Reposto.',
      '',
      `Nome: ${name}`,
      `WhatsApp: ${whatsapp}`,
      `Imóveis administrados: ${properties}`,
      `Bairros onde ficam os imóveis: ${neighborhoods}`,
      current ? `Como abastece hoje: ${current}` : null,
      '',
      'Confirmo o interesse em participar do piloto.',
    ]
      .filter(Boolean)
      .join('\n')

    // Base única de leads: o mesmo payload vai para o D1 antes de abrir o
    // WhatsApp. Falha na gravação não bloqueia o contato com o time.
    void fetch('/api/pilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        whatsapp: whatsapp.replace(/\D/g, ''),
        properties,
        neighborhoods,
        currentSupply: current,
        interest: true,
      }),
    }).catch(() => null)

    const url = whatsappLink(message)
    setLink(url)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="piloto" className="relative overflow-hidden bg-page py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p data-reveal className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Piloto Reposto
          </p>
          <h2 data-reveal style={{ '--d': '80ms' } as CSSProperties} className="mt-4 font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Quero participar do piloto da Reposto.
          </h2>
          <p data-reveal style={{ '--d': '140ms' } as CSSProperties} className="mt-5 max-w-lg text-lg leading-relaxed text-fg-soft">
            Estamos testando o abastecimento recorrente com um grupo pequeno de anfitriões e gestoras. Preencha os dados e a gente continua a conversa no WhatsApp.
          </p>

          <ol className="mt-8 space-y-4">
            {nextSteps.map((step, i) => (
              <li key={step} data-reveal style={{ '--d': `${180 + i * 80}ms` } as CSSProperties} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-inverse text-xs font-semibold text-inverse-fg">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-fg-soft sm:text-base">{step}</p>
              </li>
            ))}
          </ol>

          <p data-reveal style={{ '--d': '420ms' } as CSSProperties} className="mt-8 text-sm text-fg-muted">
            Sem aplicativo e sem cobrança nesta etapa. O número de WhatsApp é fictício nesta demonstração.
          </p>
        </div>

        <form data-reveal style={{ '--d': '120ms' } as CSSProperties} onSubmit={submit} className="rounded-[28px] border border-fg/10 bg-surface p-6 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium sm:col-span-2">
              Nome
              <input name="name" required minLength={2} autoComplete="name" className={field} placeholder="Seu nome" />
            </label>

            <label className="block text-sm font-medium">
              WhatsApp
              <input name="whatsapp" type="tel" required inputMode="tel" autoComplete="tel" className={field} placeholder="(11) 99999-9999" />
            </label>

            <label className="block text-sm font-medium">
              Imóveis administrados
              <select name="properties" required defaultValue="" className={field}>
                <option value="" disabled>
                  Selecione
                </option>
                {propertyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium sm:col-span-2">
              Bairros onde ficam os imóveis
              <input name="neighborhoods" required className={field} placeholder="Ex.: Ponta Verde, Jatiúca e Pajuçara" />
            </label>

            <label className="block text-sm font-medium sm:col-span-2">
              Como você abastece hoje? <span className="font-normal text-fg-muted">(opcional)</span>
              <textarea name="current" rows={3} className={field} placeholder="Mercado, aplicativo, diarista, lista por imóvel..." />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-2xl border border-fg/10 bg-page px-4 py-3 text-sm leading-relaxed">
            <input type="checkbox" name="interest" required className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-fg/30 accent-brand" />
            <span>
              Confirmo o interesse em participar do piloto da Reposto e autorizo o contato pelo WhatsApp informado.
            </span>
          </label>

          <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-inverse-fg transition hover:-translate-y-0.5 hover:bg-brand-hover active:translate-y-0">
            <MessageCircle className="h-5 w-5" />
            Quero participar do piloto
            <ArrowUpRight className="h-4 w-4" />
          </button>

          {link && (
            <p role="status" className="mt-4 flex items-start gap-2 rounded-2xl bg-success/15 px-4 py-3 text-sm font-medium text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Pedido pronto. Se o WhatsApp não abriu,{' '}
                <a href={link} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  clique aqui para enviar
                </a>
                .
              </span>
            </p>
          )}

          <p className="mt-3 text-center text-xs text-fg-muted">
            Ao enviar, abrimos o WhatsApp com seus dados preenchidos e o contato entra na base do piloto.
          </p>
        </form>
      </div>
    </section>
  )
}
