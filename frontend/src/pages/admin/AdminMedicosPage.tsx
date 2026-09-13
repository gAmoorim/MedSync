import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, UserX } from 'lucide-react'
import { getMedicos, cadastrarMedico, inativarMedico } from '../../api/admin'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Input, Loading, EmptyState, ErrorState, Modal, ConfirmDialog, Badge, Table } from '../../components/ui'
import { getErrorMessage } from '../../utils'
import type { Medico } from '../../types'
import api from '../../api/client'

const ESPECIALIDADES_PADRAO = [
  'Clínica Geral', 'Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria',
  'Ginecologia', 'Neurologia', 'Oftalmologia', 'Psiquiatria', 'Urologia',
].map((nome, index) => ({ id: index + 1, nome }))

const schema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  crm: z.string().min(5, 'CRM inválido'),
  especialidade_id: z.number().min(1, 'Selecione uma especialidade'),
  telefone: z.string().min(10, 'Telefone inválido'),
})

type FormData = z.infer<typeof schema>

export default function AdminMedicosPage() {
  const { success, error: toastError } = useToast()
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<{ id: number; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [inativarId, setInativarId] = useState<number | null>(null)
  const [inativando, setInativando] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchMedicos = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getMedicos({ limite: 50 })
      setMedicos(res ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedicos()
    api.get('/especialidades')
      .then((r) => setEspecialidades(r.data.especialidades ?? ESPECIALIDADES_PADRAO))
      .catch(() => setEspecialidades(ESPECIALIDADES_PADRAO))
  }, [fetchMedicos])

  const filtered = medicos.filter(m =>
    m.nome?.toLowerCase().includes(search.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(search.toLowerCase()) ||
    m.crm?.toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (data: FormData) => {
    try {
      await cadastrarMedico(data)
      success('Médico cadastrado com sucesso!')
      setModalOpen(false)
      reset()
      fetchMedicos()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const handleInativar = async () => {
    if (!inativarId) return
    setInativando(true)
    try {
      await inativarMedico(inativarId)
      success('Médico inativado com sucesso!')
      setInativarId(null)
      fetchMedicos()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setInativando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Médicos</h1>
          <p className="text-slate-500 mt-1">{medicos.length} médico{medicos.length !== 1 ? 's' : ''} cadastrado{medicos.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Novo Médico
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Buscar por nome, CRM ou especialidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchMedicos} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum médico encontrado" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={[
              {
                key: 'nome',
                label: 'Médico',
                render: (m) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm shrink-0">
                      {m.nome?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{m.nome}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'crm', label: 'CRM' },
              { key: 'especialidade', label: 'Especialidade' },
              { key: 'telefone', label: 'Telefone' },
              {
                key: 'ativo',
                label: 'Status',
                render: (m) => (
                  <Badge variant={m.ativo ? 'green' : 'gray'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge>
                ),
              },
              {
                key: 'acoes',
                label: '',
                render: (m) => (
                  <div className="flex items-center gap-1">
                    {m.ativo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-500 hover:bg-danger-50"
                        onClick={(e) => { e.stopPropagation(); setInativarId(m.id) }}
                      >
                        <UserX size={15} />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={filtered}
            keyExtractor={(m) => m.id}
          />
        </Card>
      )}

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cadastrar Médico" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome completo" error={errors.nome?.message} {...register('nome')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Senha inicial" type="password" error={errors.senha?.message} {...register('senha')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="CRM" placeholder="CRM-CE-12345" error={errors.crm?.message} {...register('crm')} />
            <Input label="Telefone" placeholder="(85) 99999-9999" error={errors.telefone?.message} {...register('telefone')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Especialidade</label>
            <select className={`input ${errors.especialidade_id ? 'input-error' : ''}`} {...register('especialidade_id', { valueAsNumber: true })}>
              <option value="">Selecione...</option>
              {especialidades.map(e => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
            {errors.especialidade_id && <p className="text-xs text-danger-500">{errors.especialidade_id.message}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Cadastrar</Button>
          </div>
        </form>
      </Modal>

      {/* Inativar confirm */}
      <ConfirmDialog
        open={!!inativarId}
        onClose={() => setInativarId(null)}
        onConfirm={handleInativar}
        title="Inativar médico"
        description="Este médico não poderá mais receber novos agendamentos. Consultas futuras agendadas impedirão a inativação."
        confirmLabel="Inativar"
        loading={inativando}
      />
    </div>
  )
}
