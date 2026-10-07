# Reposto — landing page do MVP

Landing page do MVP concierge de **abastecimento recorrente para imóveis de temporada**: anfitriões e administradoras escolhem um kit de itens essenciais por imóvel e recebem tudo separado por endereço, no ciclo escolhido. Todo o fluxo comercial do piloto acontece pelo WhatsApp — não há aplicativo.

A página muda conforme a rolagem:

- **Hero** — proposta de valor com a foto do kit em quadro fixo, lado a lado com o texto.
- **O problema** — seção fixada em quatro etapas no desktop (lista simples no mobile); a cor de fundo muda a cada etapa e o painel "Estoque do imóvel" esvazia até ser reabastecido no final.
- **Como funciona** — a rolagem vertical move os quatro passos na horizontal.
- **Painel de estoque** — visão do controle de estoque por imóvel, com alertas e reposição no ciclo.
- **Monte seu kit** — catálogo com 13 itens, quantidade de imóveis, frequência e pedido mínimo de R$ 60; o pedido vai pré-preenchido para o WhatsApp.
- **Para quem é, Números, Dúvidas e chamada final**, além de um botão flutuante de WhatsApp.

> O número de WhatsApp é fictício (`src/lib/whatsapp.ts`). Troque pelo número real antes de divulgar.

## Tecnologias

TanStack Start (React 19), Vite 7, Tailwind CSS 4, lucide-react, Netlify (deploy e Image CDN). As imagens em `public/img` foram geradas com IA e são servidas otimizadas via `/.netlify/images`.

## Rodando localmente

```bash
pnpm install
netlify dev   # ou: pnpm dev
```

## Onde editar

- Catálogo, preços, pedido mínimo e kit inicial: `src/data/catalog.ts`
- Número e mensagens do WhatsApp: `src/lib/whatsapp.ts`
- Seções da página: `src/components/`
