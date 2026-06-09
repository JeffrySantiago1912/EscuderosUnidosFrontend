import { useState, FormEvent } from 'react'
import { Shield, Eye, EyeOff, Loader2, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  onLogin: (email: string, password: string) => boolean
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    const ok = onLogin(email, password)
    setLoading(false)
    if (!ok) toast.error('Credenciales incorrectas')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300
                    bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100
                    dark:bg-none dark:bg-[#060f1e]">

      {/* Background blobs — light mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
        <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-100/60 blur-2xl" />
      </div>

      {/* Background blobs — dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div
          className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0369a1, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #075985, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in shadow-2xl rounded-3xl overflow-hidden
                      dark:shadow-sky-900/30">

        {/* ── Card header — gradient azul ── */}
        <div className="relative px-10 pt-10 pb-8 text-center overflow-hidden
                        bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700
                        dark:from-sky-700 dark:via-blue-800 dark:to-blue-900">

          {/* Decorative circles inside header */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl scale-150" />
            <div className="relative w-20 h-20 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Escuderos Unidos</h1>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <BookOpen className="w-3.5 h-3.5 text-sky-200" strokeWidth={1.8} />
            <p className="text-sky-100 text-sm">Corrector</p>
          </div>
        </div>

        {/* ── Card body — form ── */}
        <div className="px-8 py-8 bg-white dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-6 tracking-wide">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@dominio.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                           bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100
                           placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm
                           focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700
                             bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100
                             placeholder:text-slate-300 dark:placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
                         text-white font-bold text-sm tracking-wide shadow-lg
                         bg-gradient-to-r from-sky-500 to-blue-600
                         hover:from-sky-600 hover:to-blue-700
                         dark:from-sky-600 dark:to-blue-700 dark:hover:from-sky-500 dark:hover:to-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
                         focus:ring-offset-white dark:focus:ring-offset-slate-900"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verificando…</>
              ) : (
                'Entrar al sistema'
              )}
            </button>
          </form>
        </div>

        {/* ── Card footer ── */}
        <div className="px-8 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600 tracking-wide">
            Ministerio Monte de Dios &nbsp;•&nbsp; Uso exclusivo interno
          </p>
        </div>
      </div>
    </div>
  )
}
