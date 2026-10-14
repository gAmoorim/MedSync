import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { login } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErr } from '../../utils'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})
type F = z.infer<typeof schema>

const redirects: Record<string, string> = {
  paciente: '/app/paciente',
  medico: '/app/medico',
  admin: '/app/admin',
}

export default function LoginPage() {
  const { login: authLogin } = useAuth()
  const { error } = useToast()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (d: F) => {
    try {
      const res = await login(d.email, d.senha)
      authLogin(res.token, res.usuario)
      navigate(redirects[res.usuario.tipo])
    } catch (e) {
      error(getErr(e))
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Med<span className="text-cyan-400">Sync</span></span>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Bem-vindo de<br />volta ao sistema.
          </h2>
          <p className="text-white/40 leading-relaxed max-w-sm">
            Acesse sua conta para gerenciar consultas, horários e muito mais.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[['3', 'Perfis de acesso'], ['24/7', 'Disponível'], ['100%', 'Seguro']].map(([v, l]) => (
            <div key={l}>
              <p className="text-xl font-bold text-white">{v}</p>
              <p className="text-xs text-white/30 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white rounded-l-3xl lg:rounded-l-[2.5rem]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Stethoscope size={13} className="text-white" />
            </div>
            <span className="font-bold text-navy-900">Med<span className="text-cyan-500">Sync</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy-900">Entrar na conta</h1>
            <p className="text-slate-400 text-sm mt-1">Preencha seus dados para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="E-mail" type="email" placeholder="seu@email.com"
              error={errors.email?.message} {...register('email')} />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="app-label mb-0">Senha</label>
                <Link to="/recuperar-senha" className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className={`app-input pr-10 ${errors.senha ? 'app-input-error' : ''}`}
                  {...register('senha')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-red-500">{errors.senha.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Não tem conta?{' '}
            <Link to="/registro" className="text-cyan-600 font-semibold hover:text-cyan-700">Cadastre-se</Link>
          </p>

          <Link to="/" className="flex items-center justify-center gap-1 text-xs text-slate-300 hover:text-slate-500 mt-8 transition-colors">
            <ArrowLeft size={13} /> Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  )
}
