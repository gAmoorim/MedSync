import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Save } from 'lucide-react'
import { getPerfil, atualizarPerfil, alterarSenha } from '../../api/paciente'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Input, Loading, ErrorState } from '../../components/ui'
import { formatCPF, getErrorMessage } from '../../utils'
import type { Paciente } from '../../types'

const perfilSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
  data_nascimento: z.string().min(1, 'Obrigatório'),
})

const senhaSchema = z.object({
  senha_atual: z.string().min(1, 'Obrigatório'),
  nova_senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar_nova_senha: z.string().min(1, 'Obrigatório'),
}).refine(d => d.nova_senha === d.confirmar_nova_senha, {
  message: 'As senhas não conferem',
  path: ['confirmar_nova_senha'],
})

type PerfilForm = z.infer<typeof perfilSchema>
type SenhaForm = z.infer<typeof senhaSchema>

export default function PerfilPacientePage() {
  const { success, error: toastError } = useToast()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const perfilForm = useForm<PerfilForm>({ resolver: zodResolver(perfilSchema) })
  const senhaForm = useForm<SenhaForm>({ resolver: zodResolver(senhaSchema) })

  useEffect(() => {
    getPerfil()
      .then((p) => {
        setPaciente(p)
        perfilForm.reset({
          nome: p.nome,
          telefone: p.telefone,
          data_nascimento: p.data_nascimento?.split('T')[0],
        })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const onSalvarPerfil = async (data: PerfilForm) => {
    try {
      await atualizarPerfil(data)
      success('Perfil atualizado com sucesso!')
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const onAlterarSenha = async (data: SenhaForm) => {
    try {
      await alterarSenha(data)
      success('Senha alterada com sucesso!')
      senhaForm.reset()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState />

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Info read-only */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <User size={18} className="text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{paciente?.nome}</p>
            <p className="text-sm text-slate-500">{paciente?.email}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600">
          CPF: <span className="font-medium">{paciente?.cpf ? formatCPF(paciente.cpf) : '-'}</span>
          <span className="text-slate-300 mx-3">·</span>
          CPF e email não podem ser alterados
        </div>
      </Card>

      {/* Edit form */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Dados Pessoais</h2>
        <form onSubmit={perfilForm.handleSubmit(onSalvarPerfil)} className="space-y-4">
          <Input
            label="Nome completo"
            error={perfilForm.formState.errors.nome?.message}
            {...perfilForm.register('nome')}
          />
          <Input
            label="Telefone"
            placeholder="(85) 99999-9999"
            error={perfilForm.formState.errors.telefone?.message}
            {...perfilForm.register('telefone')}
          />
          <Input
            label="Data de nascimento"
            type="date"
            error={perfilForm.formState.errors.data_nascimento?.message}
            {...perfilForm.register('data_nascimento')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={perfilForm.formState.isSubmitting}>
              <Save size={16} />
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-slate-400" />
          <h2 className="font-semibold text-slate-900">Alterar Senha</h2>
        </div>
        <form onSubmit={senhaForm.handleSubmit(onAlterarSenha)} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            error={senhaForm.formState.errors.senha_atual?.message}
            {...senhaForm.register('senha_atual')}
          />
          <Input
            label="Nova senha"
            type="password"
            hint="Mínimo 6 caracteres"
            error={senhaForm.formState.errors.nova_senha?.message}
            {...senhaForm.register('nova_senha')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            error={senhaForm.formState.errors.confirmar_nova_senha?.message}
            {...senhaForm.register('confirmar_nova_senha')}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" loading={senhaForm.formState.isSubmitting}>
              <Lock size={16} />
              Alterar senha
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
