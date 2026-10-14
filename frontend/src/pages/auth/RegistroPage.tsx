import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Stethoscope, ArrowLeft } from 'lucide-react'
import { registrarPaciente } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input } from '../../components/ui'
import { getErr } from '../../utils'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  telefone: z.string().min(10, 'Telefone inválido'),
  data_nascimento: z.string().min(1, 'Data obrigatória'),
})
type F = z.infer<typeof schema>

export default function RegistroPage() {
  const { success, error } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (d: F) => {
    try {
      await registrarPaciente(d)
      success('Conta criada! Faça login para continuar.')
      navigate('/login')
    } catch (e) {
      error(getErr(e))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={13} className="text-white" />
          </div>
          <span className="font-bold text-navy-900">Med<span className="text-cyan-500">Sync</span></span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy-900">Criar conta</h1>
            <p className="text-slate-400 text-sm mt-1">Preencha seus dados para se cadastrar como paciente</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nome completo" placeholder="João Silva"
              error={errors.nome?.message} {...register('nome')} />

            <Input label="E-mail" type="email" placeholder="seu@email.com"
              error={errors.email?.message} {...register('email')} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="CPF" placeholder="000.000.000-00"
                error={errors.cpf?.message} {...register('cpf')} />
              <Input label="Telefone" placeholder="(85) 99999-9999"
                error={errors.telefone?.message} {...register('telefone')} />
            </div>

            <Input label="Data de nascimento" type="date"
              error={errors.data_nascimento?.message} {...register('data_nascimento')} />

            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres"
              hint="Mínimo 6 caracteres" error={errors.senha?.message} {...register('senha')} />

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Já tem conta?{' '}
            <Link to="/login" className="text-cyan-600 font-semibold hover:text-cyan-700">Entrar</Link>
          </p>
        </div>

        <Link to="/" className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-6 transition-colors">
          <ArrowLeft size={13} /> Voltar ao site
        </Link>
      </div>
    </div>
  )
}
