# AGENTS.md

## Projeto

Landing page de um MVP concierge (abastecimento recorrente de itens essenciais para imóveis de temporada). Página única em português (pt-BR), com animações guiadas pela rolagem. Não há backend: o "checkout" é uma mensagem pré-preenchida enviada via link `wa.me`. Não usar o nome do grupo fundador na página — a marca exibida é "Reposto".

## Stack

TanStack Start + React 19, Vite 7, Tailwind CSS 4 (tema em `@theme` no `src/styles.css`), lucide-react. Deploy na Netlify (`netlify.toml`, publish `dist/client`).

## Estrutura

```
src/
├── routes/__root.tsx      # <html lang="pt-BR">, metadados, Google Fonts (Fraunces + Hanken Grotesk), overlay de granulação
├── routes/index.tsx       # Composição das seções na ordem da página
├── components/
│   ├── Header.tsx         # Header fixo, barra de progresso da página, Logo
│   ├── Hero.tsx           # Hero fixado: imagem cresce via clip-path (.hero-clip, variável --p)
│   ├── PainStory.tsx      # Narrativa fixada em 4 etapas + painel de estoque
│   ├── HowItWorks.tsx     # Rolagem horizontal guiada pela vertical
│   ├── KitBuilder.tsx     # Montador de kit → mensagem do WhatsApp
│   └── Sections.tsx       # Marquee, Audience, Pilot (CountUp), Faq, FinalCta, Footer, FloatingWhatsApp
├── data/catalog.ts        # SKUs, preços de piloto, MIN_ORDER, starterKit, formatador brl
└── lib/
    ├── scroll.ts          # useSectionProgress, usePageScroll, useReveal, segment
    └── whatsapp.ts        # Número fictício e whatsappLink(message)
public/img/                # Imagens geradas (servir via /.netlify/images?url=/img/...&w=...&fm=webp)
```

## Convenções e decisões

- Seções com animação de rolagem são um `<section>` alto (ex.: `h-[420vh]`) com um filho `sticky top-0 h-svh`; `useSectionProgress` retorna 0→1 e `segment(p, a, b)` recorta sub-intervalos.
- Animar apenas `transform`, `opacity` e `clip-path`. Respeitar `prefers-reduced-motion` (já tratado em `styles.css`).
- Revelação ao entrar na tela: adicionar `data-reveal` (atraso opcional via `style={{ '--d': '120ms' }}`); `useReveal()` é chamado uma vez em `index.tsx`.
- Paleta: cream, sand, ink, ink-soft, moss, clay, clay-soft, zap (verde WhatsApp). Títulos em `font-display` (Fraunces) com destaque em `<em>`.
- Textos sem emojis; dados com valores "orgânicos" (ex.: R$ 22,90).
