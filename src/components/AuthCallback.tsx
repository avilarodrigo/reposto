import { acceptInvite, handleAuthCallback, updateUser } from '@netlify/identity'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

type Pending = { type: 'invite'; token: string } | { type: 'recovery' }

const INVALID = 'Este link expirou ou já foi usado. Peça um novo ao administrador.'

/**
 * Processa o retorno dos links do Netlify Identity (confirmação, convite, recuperação de senha).
 * Confirmação e OAuth entram direto no painel. Convite e recuperação pedem uma senha nova.
 */
export function AuthCallback() {
  const [pending, setPending] = useState<Pending | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    handleAuthCallback()
      .then((result) => {
        if (!result) return
        if (result.type === 'invite') return result.token ? setPending({ type: 'invite', token: result.token }) : setError(INVALID)
        if (result.type === 'recovery') return setPending({ type: 'recovery' })
        window.location.replace('/painel')
      })
      .catch(() => setError('Este link expirou ou já foi usado. Peça um novo ao administrador.'))
  }, [])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pending) return
    const password = String(new FormData(e.currentTarget).get('password'))
    setBusy(true)
    setError(null)
    try {
      if (pending.type === 'invite') await acceptInvite(pending.token, password)
      else await updateUser({ password })
      window.location.replace('/painel')
    } catch {
      setError('Não foi possível salvar a senha. Use pelo menos 8 caracteres e tente de novo.')
      setBusy(false)
    }
  }

  if (!pending && !error) return null

  if (!pending) {
    return (
      <div role="alert" className="fixed inset-x-4 bottom-4 z-50 rounded-2xl bg-brand px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-6 sm:max-w-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-page/90 p-5 backdrop-blur">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-fg/10 bg-surface p-7">
        <h2 className="font-display text-2xl font-semibold">
          {pending.type === 'invite' ? 'Defina sua senha' : 'Crie uma nova senha'}
        </h2>
        <p className="mt-2 text-sm text-fg-soft">Use pelo menos 8 caracteres.</p>
        <label className="mt-6 block text-sm font-medium">
          Senha
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" />
        </label>
        {error && <p className="mt-3 text-sm text-brand">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar e entrar
        </button>
      </form>
    </div>
  )
}
