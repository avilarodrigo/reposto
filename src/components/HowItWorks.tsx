import { useEffect, useRef, useState } from 'react'
import { useSectionProgress } from '@/lib/scroll'

const steps = [
  {
    n: '01',
    title: 'Cadastre o imóvel',
    text: 'Endereço, número de quartos e a frequência média de check-ins. Um cadastro por imóvel, sem aplicativo.',
  },
  {
    n: '02',
    title: 'Escolha ou ajuste o kit',
    text: 'Comece pelo kit check-in ou monte do zero com os itens essenciais. Cada endereço pode ter o seu.',
  },
  {
    n: '03',
    title: 'Pague em um link',
    text: 'Pix ou cartão. Você recebe o resumo do pedido por imóvel antes de confirmar.',
  },
  {
    n: '04',
    title: 'Receba no endereço',
    text: 'Tudo separado e identificado por imóvel. No ciclo seguinte, a gente lembra você antes de acabar.',
  },
]

const deliveryImg = '/.netlify/images?url=/img/delivery.png&w=900&fm=webp&q=78'

export function HowItWorks() {
  const [ref, p] = useSectionProgress<HTMLElement>()
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (track) setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section id="como-funciona" ref={ref} className="relative h-[360vh] bg-page">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-7xl items-end justify-between gap-6 px-5 pt-16 md:px-8">
          <h2 className="max-w-2xl font-display text-4xl leading-[1.02] font-semibold tracking-tight sm:text-6xl">
            Quatro passos. Nenhum app.
          </h2>
          <div className="hidden w-48 md:block">
            <div className="h-1 overflow-hidden rounded-full bg-fg/10">
              <div className="h-full origin-left bg-brand" style={{ transform: `scaleX(${p})` }} />
            </div>
            <p className="mt-2 text-right text-xs font-semibold tracking-[0.16em] text-fg-muted uppercase">Role para avançar</p>
          </div>
        </div>

        <div ref={trackRef} className="flex w-max gap-5 pl-5 pr-[10vw] will-change-transform md:gap-7 md:pl-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))]" style={{ transform: `translateX(${-p * distance}px)` }}>
          {steps.map((s, i) => (
            <article
              key={s.n}
              className={`relative flex h-[58svh] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] p-7 sm:w-[54vw] md:p-9 lg:w-[30rem] ${
                i % 2 === 0 ? 'bg-inverse text-inverse-fg' : 'bg-muted text-fg'
              }`}
            >
              <span className={`font-display text-[5rem] leading-none font-light sm:text-[7rem] ${i % 2 === 0 ? 'text-brand-soft/70' : 'text-brand/60'}`}>{s.n}</span>
              <div>
                <h3 className="font-display text-3xl font-semibold sm:text-4xl">{s.title}</h3>
                <p className={`mt-3 text-base leading-relaxed sm:text-lg ${i % 2 === 0 ? 'text-inverse-fg/75' : 'text-fg-soft'}`}>{s.text}</p>
              </div>
            </article>
          ))}
          <figure className="relative h-[58svh] w-[78vw] shrink-0 overflow-hidden rounded-[28px] sm:w-[44vw] lg:w-[26rem]">
            <img src={deliveryImg} alt="Caixa com papel higiênico, produtos de limpeza e toalhas sendo deixada na porta de um imóvel" className="h-full w-full object-cover" loading="lazy" />
            <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-surface/90 p-4 text-sm font-medium text-fg backdrop-blur">
              Entrega identificada por imóvel, pronta para a diarista guardar.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
