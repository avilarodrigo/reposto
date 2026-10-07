import { MessageCircle } from 'lucide-react'
import { usePageScroll } from '@/lib/scroll'
import { whatsappLink } from '@/lib/whatsapp'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '#problema', label: 'O problema' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#painel', label: 'Painel de estoque' },
  { href: '#kit', label: 'Monte seu kit' },
  { href: '#faq', label: 'Dúvidas' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#topo" className={`flex items-center gap-2 font-display text-2xl font-semibold tracking-tight ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-brand text-inverse-fg">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 11.5 12 5l8 6.5" />
          <path d="M8 13.5l3 3 5-5.5" />
        </svg>
      </span>
      Reposto
    </a>
  )
}

export function Header() {
  const { progress, scrolled } = usePageScroll()
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-page/85 shadow-[0_1px_0_rgba(15,23,42,0.08)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-fg-soft lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-brand">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-inverse px-4 py-2 text-sm font-semibold text-inverse-fg transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
          >
            <MessageCircle className="h-4 w-4 text-success" />
            <span className="hidden sm:inline">Falar no WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
      <div className="h-[3px] origin-left bg-brand" style={{ transform: `scaleX(${progress})` }} />
    </header>
  )
}
