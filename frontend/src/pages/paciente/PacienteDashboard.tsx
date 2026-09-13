import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ClipboardList, Plus, ArrowRight } from 'lucide-react'
import { getHistoricoConsultas } from '../../api/paciente'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Badge, Card, Loading, ErrorState } from '../../components/ui'
import { formatDate, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function PacienteDashboard() {
  const { usuario } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getHistoricoConsultas({ limite: 5 })
      .then(setConsultas)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const proximas = consultas.filter(c => c.status === 'agendada' || c.status === 'confirmada')
  const historico = consultas.filter(c => c.status === 'concluida' || c.status === 'cancelada')

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{saudacao}, {usuario?.nome?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Aqui está um resumo das suas consultas</p>
        </div>
        <Link to="/paciente/agendar">
          <Button>
            <Plus size={16} />
            Agendar Consulta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Próximas',
            value: proximas.length,
            icon: <Calendar size={20} className="text-primary-500" />,
            bg: 'bg-primary-50',
          },
          {
            label: 'Realizadas',
            value: historico.filter(c => c.status === 'concluida').length,
            icon: <ClipboardList size={20} className="text-success-500" />,
            bg: 'bg-success-50',
          },
          {
            label: 'Canceladas',
            value: historico.filter(c => c.status === 'cancelada').length,
            icon: <Clock size={20} className="text-slate-400" />,
            bg: 'bg-slate-100',
          },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming consultations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Próximas Consultas</h2>
          <Link to="/paciente/consultas" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState />
        ) : proximas.length === 0 ? (
          <div className="text-center py-10">
            <Calendar size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">Nenhuma consulta agendada</p>
            <Link to="/paciente/agendar">
              <Button variant="secondary" size="sm" className="mt-3">
                <Plus size={14} /> Agendar agora
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proximas.map((c, i) => (
              <Link key={i} to={`/paciente/consultas/${c.consulta_id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.medico_nome}</p>
                    <p className="text-xs text-slate-500">{c.especialidade} · {formatDate(c.data)} · {c.hora}</p>
                  </div>
                  <Badge variant={getStatusBadge(c.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'}>
                    {getStatusLabel(c.status as StatusConsulta)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
