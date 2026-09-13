import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, Users, ArrowRight } from 'lucide-react'
import { getConsultas } from '../../api/medico'
import { useAuth } from '../../contexts/AuthContext'
import { Badge, Button, Card, Loading, ErrorState } from '../../components/ui'
import { formatDate, getHoje, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function MedicoDashboard() {
  const { usuario } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getConsultas({ data: getHoje(), limite: 20 })
      .then(setConsultas)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: consultas.length,
    agendadas: consultas.filter(c => c.status === 'agendada').length,
    confirmadas: consultas.filter(c => c.status === 'confirmada').length,
    concluidas: consultas.filter(c => c.status === 'concluida').length,
  }

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{saudacao}, {usuario?.nome?.split(' ').slice(0, 2).join(' ')}!</h1>
          <p className="text-slate-500 mt-1">Consultas de hoje — {formatDate(getHoje())}</p>
        </div>
        <Link to="/medico/agenda">
          <Button variant="secondary" size="sm">
            <Calendar size={14} />
            Ver agenda
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total hoje', value: stats.total, icon: <Users size={18} />, color: 'text-slate-500', bg: 'bg-slate-100' },
          { label: 'Agendadas', value: stats.agendadas, icon: <Clock size={18} />, color: 'text-primary-500', bg: 'bg-primary-50' },
          { label: 'Confirmadas', value: stats.confirmadas, icon: <CheckCircle size={18} />, color: 'text-success-500', bg: 'bg-success-50' },
          { label: 'Concluídas', value: stats.concluidas, icon: <CheckCircle size={18} />, color: 'text-slate-400', bg: 'bg-slate-100' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.bg}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Today's consultations */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Pacientes de Hoje</h2>
          <Link to="/medico/consultas" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Ver tudo <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState />
        ) : consultas.length === 0 ? (
          <div className="text-center py-10">
            <Users size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">Nenhuma consulta para hoje</p>
          </div>
        ) : (
          <div className="space-y-2">
            {consultas.map((c, i) => (
              <Link key={i} to={`/medico/consultas/${c.consulta_id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs shrink-0">
                    {c.paciente_nome?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.paciente_nome}</p>
                    <p className="text-xs text-slate-500">{c.hora ?? c.hora_inicio}</p>
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
