import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Save, Stethoscope } from 'lucide-react'
import { getPerfil, atualizarPerfil } from '../../api/medico'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Input, Loading, ErrorState } from '../../components/ui'
import { getErrorMessage } from '../../utils'
import type { Medico } from '../../types'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
})

type FormData = z.infer<typeof schema>

export default function PerfilMedicoPage() {
  const { success, error: toastError } = useToast()
  const [medico, setMedico] = useState<Medico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    getPerfil()
      .then((m) => {
        setMedico(m)
        reset({ nome: m.nome, telefone: m.telefone })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      await atualizarPerfil(data)
      success('Perfil atualizado com sucesso!')
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
        <p className="text-slate-500 mt-1">Suas informações profissionais</p>
      </div>

      {/* Read-only info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
            {medico?.nome?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{medico?.nome}</p>
            <p className="text-sm text-slate-500">{medico?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Stethoscope size={13} />
              <span className="text-xs">Especialidade</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{medico?.especialidade}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <User size={13} />
              <span className="text-xs">CRM</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{medico?.crm}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3">CRM, especialidade e email só podem ser alterados pelo administrador.</p>
      </Card>

      {/* Edit form */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Editar informações</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome completo"
            error={errors.nome?.message}
            {...register('nome')}
          />
          <Input
            label="Telefone"
            placeholder="(85) 99999-9999"
            error={errors.telefone?.message}
            {...register('telefone')}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              <Save size={16} />
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
