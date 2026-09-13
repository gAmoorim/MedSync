import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Eye, EyeOff } from 'lucide-react'
import { login } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login: authLogin } = useAuth()
  const { error: toastError } = useToast()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.senha)
      authLogin(res.token, res.usuario)
      const redirects = { paciente: '/paciente', medico: '/medico', admin: '/admin' }
      navigate(redirects[res.usuario.tipo])
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <Stethoscope size={18} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg">MedSync</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Sua saúde,<br />organizada.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Sistema completo de agendamento para clínicas. Consultas, horários e relatórios em um só lugar.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { number: '3', label: 'Perfis de acesso' },
            { number: '100%', label: 'Digitalizado' },
            { number: '24/7', label: 'Disponível' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.number}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">MedSync</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
            <p className="text-slate-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1">
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.senha ? 'input-error' : ''}`}
                  {...register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-danger-500">{errors.senha.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link to="/registro" className="text-primary-600 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
