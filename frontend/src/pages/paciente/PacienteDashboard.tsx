import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ClipboardList, Plus, ArrowRight, Clock } from 'lucide-react'
import { getConsultasPaciente } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner, Err, Badge, StatCard } from '../../components/ui'
import { formatDate, statusConfig } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function PacienteDashboard() {
  const { usuario } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  useEffect(() => {
    getConsultasPaciente({ limite: 10 })
      .then(setConsultas).catch(() => setErr(true)).finally(() => setLoading(false))
  }, [])

  const proximas = consultas.filter(c => c.status === 'agendada' || c.status === 'confirmada')
  const concluidas = consultas.filter(c => c.status === 'concluida').length
  const canceladas = consultas.filter(c => c.status === 'cancelada').length

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{saudacao} 👋</p>
          <h1 className="text-2xl font-bold text-navy-900">{usuario?.nome?.split(' ')[0]}</h1>
        </div>
        <Link to="/app/paciente/agendar"
          className="inline-flex items-center gap-2 bg-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-cyan-600 transition-colors shadow-sm shadow-cyan-500/20">
          <Plus size={16} /> Agendar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Próximas consultas" value={proximas.length} icon={<Calendar size={19} />} accent />
        <StatCard label="Consultas realizadas" value={concluidas} icon={<ClipboardList size={19} />} />
        <StatCard label="Canceladas" value={canceladas} icon={<Clock size={19} />} />
      </div>

      {/* Upcoming */}
      <div className="app-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-navy-900">Próximas consultas</h2>
          <Link to="/app/paciente/consultas" className="text-xs text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-1">
            Ver todas <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? <Spinner /> : err ? <Err /> : proximas.length === 0 ? (
          <div className="text-center py-10">
            <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">Nenhuma consulta agendada</p>
            <Link to="/app/paciente/agendar"
              className="inline-flex items-center gap-1 text-sm text-cyan-600 font-semibold mt-3 hover:text-cyan-700">
              <Plus size={14} /> Agendar agora
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {proximas.map((c, i) => {
              const sc = statusConfig[c.status as StatusConsulta]
              return (
                <Link key={i} to={`/app/paciente/consultas/${c.consulta_id}`}
                  className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                    <Calendar size={17} className="text-cyan-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{c.medico_nome}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.especialidade} · {formatDate(c.data)} · {c.hora}</p>
                  </div>
                  <Badge cls={sc.cls}>{sc.label}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
