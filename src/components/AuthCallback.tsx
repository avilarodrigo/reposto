import { acceptInvite, handleAuthCallback } from '@/lib/auth'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

/**
 * Processa o link de convite (?token=...). Pede a senha e cria a conta via /api/auth/accept-invite.
 */
export function AuthCallback() {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const result = handleAuthCallback()
    if (result) setToken(result.token)
  }, [])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    const password = String(new FormData(e.currentTarget).get('password'))
    setBusy(true)
    setError(null)
    try {
      await acceptInvite(token, password)
      window.location.replace('/painel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a senha.')
      setBusy(false)
    }
  }

  if (!token) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-page/90 p-5 backdrop-blur">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-fg/10 bg-surface p-7">
        <h2 className="font-display text-2xl font-semibold">Defina sua senha</h2>
        <p className="mt-2 text-sm text-fg-soft">Use pelo menos 8 caracteres.</p>
        <label className="mt-6 block text-sm font-medium">
          Senha
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-brand">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar e entrar
        </button>
      </form>
    </div>
  )
}
