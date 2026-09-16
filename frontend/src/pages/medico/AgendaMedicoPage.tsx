import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Search, ChevronRight } from 'lucide-react'
import { getAgenda } from '../../api/medico'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, Card, Loading, EmptyState, ErrorState, Badge } from '../../components/ui'
import { formatDate, getErrorMessage, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function AgendaMedicoPage() {
  const { error: toastError } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const [dataInicio, setDataInicio] = useState(today)
  const [dataFim, setDataFim] = useState(nextWeek)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setError(false)
    setSearched(true)
    try {
      const res = await getAgenda(dataInicio, dataFim)
      setConsultas(res ?? [])
    } catch (err) {
      toastError(getErrorMessage(err))
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Group by date
  const byDate = consultas.reduce<Record<string, Consulta[]>>((acc, c) => {
    const d = c.data?.split('T')[0] ?? c.data
    if (!acc[d]) acc[d] = []
    acc[d].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-slate-500 mt-1">Visualize suas consultas por período</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            label="Data início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <Input
            label="Data fim"
            type="date"
            value={dataFim}
            min={dataInicio}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <Button onClick={handleSearch} loading={loading}>
            <Search size={16} />
            Buscar
          </Button>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState />
      ) : !searched ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione um período e clique em Buscar</p>
        </div>
      ) : Object.keys(byDate).length === 0 ? (
        <EmptyState title="Nenhuma consulta no período" description="Não há consultas agendadas para este intervalo" />
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-primary-500" />
                <h3 className="text-sm font-semibold text-slate-700">{formatDate(date)}</h3>
                <span className="text-xs text-slate-400">({items.length} consulta{items.length > 1 ? 's' : ''})</span>
              </div>
              <div className="space-y-2">
                {items.map((c, i) => (
                  <Link key={i} to={`/medico/consultas/${c.consulta_id}`}>
                    <Card className="p-4 hover:shadow-card-hover transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-12 shrink-0">
                          <p className="text-sm font-bold text-slate-900">{c.hora_inicio?.substring(0, 5)}</p>
                          <p className="text-xs text-slate-400">{c.hora_fim?.substring(0, 5)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.paciente_nome}</p>
                          {c.observacoes && <p className="text-xs text-slate-500 truncate">{c.observacoes}</p>}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
