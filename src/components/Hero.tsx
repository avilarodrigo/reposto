import { ArrowUpRight, MessageCircle } from 'lucide-react'
import type { CSSProperties } from 'react'
import { whatsappLink } from '@/lib/whatsapp'

const heroImg = '/img/hero.png?w=1200&fm=webp&q=78'

export function Hero() {
  return (
    <section id="topo" className="bg-page pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-14 md:px-8 lg:gap-20">
        <div>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-brand uppercase" style={{ '--d': '40ms' } as CSSProperties}>
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Piloto com vagas limitadas
          </p>
          <h1 className="rise mt-5 font-display text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-fg sm:text-6xl lg:text-7xl" style={{ '--d': '80ms' } as CSSProperties}>
            O papel acabou antes do hóspede chegar?
          </h1>
          <p className="rise mt-6 max-w-md text-base leading-relaxed text-fg-soft sm:text-lg" style={{ '--d': '200ms' } as CSSProperties}>
            Abastecimento recorrente para imóveis de temporada. Você escolhe o kit de cada endereço, com marcas conhecidas onde existe, e a gente entrega separado no ciclo certo. O estoque é atualizado pelo QR Code e acompanhado num painel só.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ '--d': '320ms' } as CSSProperties}>
            <a href="#piloto" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-inverse-fg transition hover:-translate-y-0.5 hover:bg-brand-hover">
              Quero participar do piloto <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#kit" className="rounded-full border border-fg/20 px-5 py-3.5 font-semibold text-fg transition hover:border-fg hover:bg-inverse hover:text-inverse-fg">
              Montar meu kit
            </a>
          </div>
          <p className="rise mt-4 text-sm text-fg-muted" style={{ '--d': '380ms' } as CSSProperties}>
            ou fale com a gente no{' '}
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-fg underline-offset-4 hover:underline">
              <MessageCircle className="h-3.5 w-3.5 text-success" /> WhatsApp
            </a>
          </p>
        </div>
        <div className="rise overflow-hidden rounded-[28px] aspect-[4/3] md:aspect-[4/5]" style={{ '--d': '240ms' } as CSSProperties}>
          <img
            src={heroImg}
            alt="Cozinha de imóvel de temporada com toalhas, papel, café e amenities organizados sobre a bancada"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  )
}
