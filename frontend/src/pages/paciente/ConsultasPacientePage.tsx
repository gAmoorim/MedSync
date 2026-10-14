import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, ChevronRight } from 'lucide-react'
import { getConsultasPaciente, cancelarConsultaPaciente } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Spinner, Err, Empty, Badge, Confirm } from '../../components/ui'
import { formatDate, statusConfig, getErr } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

const STATUS_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'agendada', label: 'Agendadas' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'concluida', label: 'Concluídas' },
  { value: 'cancelada', label: 'Canceladas' },
]

export default function ConsultasPacientePage() {
  const { success, error } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  const [status, setStatus] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [canceling, setCanceling] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true); setErr(false)
    try { setConsultas((await getConsultasPaciente({ status: status || undefined, limite: 30 })) ?? []) }
    catch { setErr(true) }
    finally { setLoading(false) }
  }, [status])

  useEffect(() => { fetch() }, [fetch])

  const handleCancelar = async () => {
    if (!cancelId) return
    setCanceling(true)
    try { await cancelarConsultaPaciente(cancelId); success('Consulta cancelada.'); setCancelId(null); fetch() }
    catch (e) { error(getErr(e)) }
    finally { setCanceling(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Minhas Consultas</h1>
          <p className="text-slate-400 text-sm mt-1">Histórico e próximas consultas</p>
        </div>
        <Link to="/app/paciente/agendar"
          className="inline-flex items-center gap-2 bg-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-cyan-600 transition-colors">
          <Plus size={15} /> Agendar
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => setStatus(o.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              status === o.value ? 'bg-navy-950 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : err ? <Err onRetry={fetch} /> : consultas.length === 0 ? (
        <Empty title="Nenhuma consulta encontrada" />
      ) : (
        <div className="space-y-2">
          {consultas.map((c, i) => {
            const sc = statusConfig[c.status as StatusConsulta]
            const podeCanc = c.status === 'agendada' || c.status === 'confirmada'
            return (
              <div key={i} className="app-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                  <Calendar size={17} className="text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-navy-900">{c.medico_nome}</p>
                    <Badge cls={sc.cls}>{sc.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{c.especialidade} · {formatDate(c.data)} · {c.hora}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {podeCanc && (
                    <button onClick={() => setCancelId(c.consulta_id!)}
                      className="text-xs text-red-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Cancelar
                    </button>
                  )}
                  <Link to={`/app/paciente/consultas/${c.consulta_id}`}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Confirm open={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancelar}
        title="Cancelar consulta"
        desc="Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita."
        label="Cancelar consulta" loading={canceling} />
    </div>
  )
}
