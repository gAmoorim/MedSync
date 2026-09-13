import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, Eye, EyeOff } from 'lucide-react'
import { registrarPaciente } from '../../api/auth'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErrorMessage } from '../../utils'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  data_nascimento: z.string().min(1, 'Data de nascimento obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function RegistroPage() {
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await registrarPaciente(data)
      success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">MedSync</span>
        </div>

        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Criar conta</h2>
            <p className="text-slate-500 text-sm mt-1">Preencha seus dados para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="João Silva"
              error={errors.nome?.message}
              {...register('nome')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...register('cpf')}
              />
              <Input
                label="Telefone"
                placeholder="(85) 99999-9999"
                error={errors.telefone?.message}
                {...register('telefone')}
              />
            </div>

            <Input
              label="Data de nascimento"
              type="date"
              error={errors.data_nascimento?.message}
              {...register('data_nascimento')}
            />

            <div className="flex flex-col gap-1">
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
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

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
