  return (
    <form onSubmit={submitLogin} className="mx-auto mt-16 max-w-sm rounded-3xl border border-fg/10 bg-surface p-7">
      <h1 className="font-display text-2xl font-semibold">Entrar no painel</h1>
      
      <label className="mt-6 block text-sm font-medium">
        E-mail
        <input name="email" type="email" required autoComplete="email" className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" />
      </label>
      
      {/* CORREÇÃO SINTÁTICA: O wrapper flex envolve o título e o link sem quebrar o escopo do label */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Senha</span>
          <button
            type="button"
            onClick={() => { setScreen('forgot'); setError(null); setInfo(null) }}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Esqueceu sua senha?
          </button>
        </div>
        <input 
          name="password" 
          type="password" 
          required 
          autoComplete="current-password" 
          className="mt-1.5 w-full rounded-xl border border-fg/15 bg-page px-4 py-3 outline-none focus:border-brand" 
        />
      </div>

      {error && <p className="mt-3 text-sm text-brand">{error}</p>}
      
      <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-inverse py-3 font-semibold text-inverse-fg transition active:scale-[0.98] disabled:opacity-50">
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
