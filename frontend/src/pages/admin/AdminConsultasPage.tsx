import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Filter, XCircle } from 'lucide-react'
import { getConsultas, cancelarConsulta } from '../../api/admin'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Loading, EmptyState, ErrorState, Badge, Table, Modal, Select, Input } from '../../components/ui'
import { formatDate, getErrorMessage, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

const cancelSchema = z.object({
  motivo_cancelamento: z.string().min(5, 'Informe o motivo (mínimo 5 caracteres)'),
})

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function AdminConsultasPage() {
  const { success, error: toastError } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [status, setStatus] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(cancelSchema),
  })

  const fetchConsultas = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getConsultas({
        status: status || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        limite: 50,
      })
      setConsultas(res ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [status, dataInicio, dataFim])

  useEffect(() => { fetchConsultas() }, [fetchConsultas])

  const onCancelar = async (data: { motivo_cancelamento: string }) => {
    if (!cancelId) return
    try {
      await cancelarConsulta(cancelId, data.motivo_cancelamento)
      success('Consulta cancelada com sucesso!')
      setCancelId(null)
      reset()
      fetchConsultas()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultas</h1>
        <p className="text-slate-500 mt-1">Gerencie todas as consultas do sistema</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400 shrink-0" />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        />
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="max-w-[160px]"
        />
        <span className="text-slate-400 text-sm">até</span>
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="max-w-[160px]"
        />
        {(status || dataInicio || dataFim) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setDataInicio(''); setDataFim('') }}>
            <XCircle size={14} /> Limpar
          </Button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchConsultas} />
      ) : consultas.length === 0 ? (
        <EmptyState title="Nenhuma consulta encontrada" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={[
              {
                key: 'paciente_nome',
                label: 'Paciente',
                render: (c) => <span className="font-medium text-slate-900">{c.paciente_nome}</span>,
              },
              { key: 'medico_nome', label: 'Médico' },
              { key: 'especialidade', label: 'Especialidade' },
              {
                key: 'data',
                label: 'Data',
                render: (c) => formatDate(c.data),
              },
              { key: 'hora', label: 'Hora' },
              {
                key: 'status',
                label: 'Status',
                render: (c) => (
                  <Badge variant={getStatusBadge(c.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'}>
                    {getStatusLabel(c.status as StatusConsulta)}
                  </Badge>
                ),
              },
              {
                key: 'acoes',
                label: '',
                render: (c) => (
                  (c.status === 'agendada' || c.status === 'confirmada') ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-500 hover:bg-danger-50"
                      onClick={(e) => { e.stopPropagation(); setCancelId(c.consulta_id!) }}
                    >
                      Cancelar
                    </Button>
                  ) : null
                ),
              },
            ]}
            data={consultas}
            keyExtractor={(c) => c.consulta_id ?? c.id ?? 0}
          />
        </Card>
      )}

      {/* Cancel modal */}
      <Modal open={!!cancelId} onClose={() => { setCancelId(null); reset() }} title="Cancelar Consulta">
        <form onSubmit={handleSubmit(onCancelar)} className="space-y-4">
          <p className="text-sm text-slate-600">Informe o motivo do cancelamento. O paciente e o médico serão notificados.</p>
          <div className="flex flex-col gap-1">
            <label className="label">Motivo do cancelamento</label>
            <textarea
              rows={3}
              className={`input resize-none ${errors.motivo_cancelamento ? 'input-error' : ''}`}
              placeholder="Ex: Médico indisponível por motivo de saúde..."
              {...register('motivo_cancelamento')}
            />
            {errors.motivo_cancelamento && (
              <p className="text-xs text-danger-500">{errors.motivo_cancelamento.message as string}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => { setCancelId(null); reset() }}>
              Voltar
            </Button>
            <Button type="submit" variant="danger" loading={isSubmitting}>
              Confirmar cancelamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
