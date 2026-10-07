import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'reposto-theme'

export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.style.colorScheme = next ? 'dark' : 'light'
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      /* armazenamento indisponível: o tema vale só para esta visita */
    }
    setDark(next)
  }

  const Icon = dark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-pressed={dark}
      className="grid h-10 w-10 place-items-center rounded-full border border-fg/15 text-fg transition hover:border-fg active:scale-90"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
