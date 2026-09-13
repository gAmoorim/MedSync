import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ChevronRight } from 'lucide-react'
import { getConsultas } from '../../api/medico'
import { useToast } from '../../contexts/ToastContext'
import { Badge, Card, Input, Loading, EmptyState, ErrorState, Select } from '../../components/ui'
import { formatDate, getErrorMessage, getHoje, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function ConsultasMedicoPage() {
  const { error: toastError } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState(getHoje())
  const [status, setStatus] = useState('')

  const fetchConsultas = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getConsultas({ data, status: status || undefined, limite: 20 })
      setConsultas(res ?? [])
    } catch (err) {
      toastError(getErrorMessage(err))
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [data, status])

  useEffect(() => { fetchConsultas() }, [fetchConsultas])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultas do Dia</h1>
        <p className="text-slate-500 mt-1">Pacientes agendados por data</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400 shrink-0" />
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="max-w-[180px]"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchConsultas} />
      ) : consultas.length === 0 ? (
        <EmptyState
          title="Nenhuma consulta encontrada"
          description={`Sem consultas para ${formatDate(data)}`}
        />
      ) : (
        <div className="space-y-3">
          {consultas.map((c, i) => (
            <Link key={i} to={`/medico/consultas/${c.consulta_id}`}>
              <Card className="p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm shrink-0">
                    {c.paciente_nome?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.paciente_nome}</p>
                    <p className="text-xs text-slate-500">
                      {c.hora ?? c.hora_inicio}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getStatusBadge(c.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'}>
                      {getStatusLabel(c.status as StatusConsulta)}
                    </Badge>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
