import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Filter, ChevronRight } from 'lucide-react'
import { getHistoricoConsultas, cancelarConsulta } from '../../api/paciente'
import { useToast } from '../../contexts/ToastContext'
import { Badge, Card, Loading, EmptyState, ErrorState, ConfirmDialog, Select, Button } from '../../components/ui'
import { formatDate, getStatusBadge, getStatusLabel, getErrorMessage } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function ConsultasPacientePage() {
  const { success, error: toastError } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [status, setStatus] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [canceling, setCanceling] = useState(false)

  const fetchConsultas = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getHistoricoConsultas({ status: status || undefined, limite: 20 })
      setConsultas(res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchConsultas() }, [fetchConsultas])

  const handleCancelar = async () => {
    if (!cancelId) return
    setCanceling(true)
    try {
      await cancelarConsulta(cancelId)
      success('Consulta cancelada com sucesso.')
      setCancelId(null)
      fetchConsultas()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas Consultas</h1>
          <p className="text-slate-500 mt-1">Histórico e próximas consultas</p>
        </div>
        <Link to="/paciente/agendar">
          <Button size="sm">
            <Calendar size={14} />
            Agendar
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-slate-400 shrink-0" />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchConsultas} />
      ) : consultas.length === 0 ? (
        <EmptyState
          title="Nenhuma consulta encontrada"
          description="Você ainda não possui consultas com este filtro"
        />
      ) : (
        <div className="space-y-3">
          {consultas.map((c, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-primary-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 text-sm">{c.medico_nome}</p>
                    <Badge variant={getStatusBadge(c.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'}>
                      {getStatusLabel(c.status as StatusConsulta)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.especialidade} · {formatDate(c.data)} · {c.hora}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(c.status === 'agendada' || c.status === 'confirmada') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-500 hover:bg-danger-50 hover:text-danger-600"
                      onClick={() => setCancelId(c.consulta_id!)}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Link to={`/paciente/consultas/${c.consulta_id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelar}
        title="Cancelar consulta"
        description="Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        loading={canceling}
      />
    </div>
  )
}
