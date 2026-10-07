import { ArrowUpRight, ChevronDown, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { catalog } from '@/data/catalog'
import { usePageScroll } from '@/lib/scroll'
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/whatsapp'
import { Logo } from './Header'

export function Marquee() {
  const items = catalog.map((s) => s.name)
  return (
    <div className="overflow-hidden border-y border-fg/10 bg-brand py-5 text-inverse-fg" aria-hidden="true">
      <div className="marquee flex w-max gap-10 font-display text-2xl font-semibold sm:text-3xl">
        {[...items, ...items].map((name, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {name}
            <span className="h-2 w-2 rounded-full bg-inverse-fg/60" />
          </span>
        ))}
      </div>
    </div>
  )
}

const audiences = [
  { range: '1–2', who: 'Anfitriões', text: 'Quem cuida do próprio imóvel e não quer mais passar no mercado antes de cada check-in.' },
  { range: '3–10', who: 'Anfitriões profissionais', text: 'Vários endereços, uma diarista por região e listas que mudam toda semana.' },
  { range: '10+', who: 'Gestoras e administradoras', text: 'Operação de verdade: compras por imóvel, controle de custo e reposição previsível.' },
]

export function Audience() {
  return (
    <section className="bg-page py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.6fr] md:px-8">
        <div className="md:sticky md:top-28 md:self-start">
          <p data-reveal className="text-xs font-semibold tracking-[0.18em] text-fg-muted uppercase">Para quem é</p>
          <h2 data-reveal style={{ '--d': '80ms' } as CSSProperties} className="mt-3 font-display text-4xl leading-[1.02] font-medium tracking-tight sm:text-5xl">
            De um apartamento na praia a uma carteira inteira.
          </h2>
        </div>
        <ul>
          {audiences.map((a, i) => (
            <li key={a.range} data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties} className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-t border-fg/15 py-8 sm:gap-x-10">
              <span className="font-display text-6xl font-light text-fg transition-transform duration-500 group-hover:-translate-y-1 sm:text-8xl">{a.range}</span>
              <div>
                <p className="text-sm font-semibold tracking-[0.14em] text-fg-muted uppercase">imóveis · {a.who}</p>
                <p className="mt-2 max-w-md text-lg leading-relaxed text-fg-soft">{a.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CountUp({ to, prefix = '', duration = 1400 }: { to: number; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / duration)
        setValue(Math.round(to * (1 - Math.pow(1 - k, 3))))
        if (k < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
    </span>
  )
}

const numbers = [
  { to: 13, label: 'itens essenciais no catálogo', note: 'Só o que realmente acaba entre uma estadia e outra.' },
  { to: 60, prefix: 'R$ ', label: 'pedido mínimo por imóvel', note: 'O kit check-in sai por volta de R$ 107.' },
  { to: 1, label: 'painel de estoque para todos os imóveis', note: 'Consumo, alertas e reposições num lugar só.' },
  { to: 0, label: 'aplicativos para instalar', note: 'Pedido, ajuste e pagamento pelo WhatsApp.' },
]

export function Numbers() {
  return (
    <section id="numeros" className="relative overflow-hidden bg-inverse py-24 text-inverse-fg md:py-32">
      <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
          <h2 data-reveal className="font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-6xl">
            Simples de contratar. Fácil de acompanhar.
          </h2>
          <p data-reveal style={{ '--d': '100ms' } as CSSProperties} className="max-w-md text-lg leading-relaxed text-inverse-fg/75">
            Um pedido por ciclo, preço transparente por item e tudo confirmado pelo WhatsApp, do primeiro kit ao controle do estoque.
          </p>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] bg-inverse-fg/15 sm:grid-cols-2 lg:grid-cols-4">
          {numbers.map((s, i) => (
            <div key={s.label} data-reveal style={{ '--d': `${i * 100}ms` } as CSSProperties} className="bg-inverse p-7 sm:p-8">
              <p className="font-display text-6xl font-light text-inverse-fg">
                <CountUp to={s.to} prefix={s.prefix} />
              </p>
              <p className="mt-3 font-semibold">{s.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-inverse-fg/60">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  { q: 'Preciso instalar algum aplicativo?', a: 'Não. Você monta o kit aqui na página, envia pelo WhatsApp e acompanha tudo pela conversa: confirmação, pagamento e entrega.' },
  { q: 'Qual é o pedido mínimo?', a: 'R$ 60 por imóvel, por ciclo. Assim a entrega fica incluída no preço.' },
  { q: 'Posso ter um kit diferente para cada imóvel?', a: 'Pode. Um studio e uma casa de quatro quartos não gastam o mesmo. Basta avisar na conversa quais itens mudam em cada endereço.' },
  { q: 'Como funciona o painel de estoque?', a: 'Você acompanha o nível de cada item em cada imóvel. O consumo é estimado pelos check-ins e você recebe o aviso antes de faltar.' },
  { q: 'Como funciona o pagamento?', a: 'Enviamos um link de pagamento por Pix ou cartão depois de confirmar itens, endereços e data de entrega.' },
  { q: 'Quais regiões vocês atendem?', a: 'Atendemos regiões com concentração de imóveis de temporada. Mande o endereço no WhatsApp e confirmamos a cobertura na hora.' },
  { q: 'E se faltar algo antes do próximo ciclo?', a: 'Você pode pedir uma reposição avulsa pela mesma conversa. Também podemos ajustar a frequência se o consumo mudar.' },
]

export function Faq() {
  return (
    <section id="faq" className="bg-page py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.6fr] md:px-8">
        <h2 data-reveal className="font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-5xl">
          Perguntas que a gente sempre ouve.
        </h2>
        <div className="divide-y divide-fg/15 border-y border-fg/15">
          {faqs.map((f, i) => (
            <details key={f.q} data-reveal style={{ '--d': `${i * 60}ms` } as CSSProperties} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold transition-colors hover:text-brand">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-fg-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand py-24 text-inverse-fg md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p data-reveal className="text-xs font-semibold tracking-[0.18em] text-inverse-fg/75 uppercase">Próximo passo</p>
        <h2 data-reveal style={{ '--d': '80ms' } as CSSProperties} className="mt-4 max-w-5xl font-display text-5xl leading-[0.98] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
          Próximo check-in, sem correria.
        </h2>
        <div data-reveal style={{ '--d': '180ms' } as CSSProperties} className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
          <a href={whatsappLink('Olá! Quero começar o abastecimento recorrente para meus imóveis.')} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-center gap-3 rounded-full bg-surface px-8 py-5 text-lg font-semibold text-fg transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.6)] active:translate-y-0">
            <MessageCircle className="h-5 w-5 text-success" />
            Quero montar meu kit
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <p className="text-inverse-fg/80">
            ou chame no <span className="font-semibold text-inverse-fg">{WHATSAPP_DISPLAY}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-inverse py-10 text-inverse-fg/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Logo className="text-inverse-fg" />
        <p>Abastecimento recorrente para imóveis de temporada · © {new Date().getFullYear()}</p>
        <p className="text-inverse-fg/45">Número de WhatsApp fictício, apenas para demonstração.</p>
      </div>
    </footer>
  )
}

export function FloatingWhatsApp() {
  const { scrolled } = usePageScroll()
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed right-5 bottom-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-success text-white shadow-[0_14px_30px_-10px_rgba(31,168,85,0.9)] transition-all duration-500 hover:scale-105 ${
        scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span className="ping-soft absolute inset-0 rounded-full bg-success" aria-hidden="true" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  )
}
