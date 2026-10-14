import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react'
import { getDetalheConsultaPaciente } from '../../api'
import { Spinner, Err, Badge } from '../../components/ui'
import { formatDate, statusConfig } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function DetalheConsultaPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [c, setC] = useState<Consulta | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!id) return
    getDetalheConsultaPaciente(Number(id)).then(setC).catch(() => setErr(true)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (err || !c) return <Err />

  const sc = statusConfig[c.status as StatusConsulta]

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-navy-900">Detalhe da Consulta</h1>
        <Badge cls={sc.cls}>{sc.label}</Badge>
      </div>

      <div className="app-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-navy-950 flex items-center justify-center text-cyan-400 text-lg font-bold">
            {c.medico_nome?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-navy-900">{c.medico_nome}</p>
            <p className="text-sm text-slate-400">{c.especialidade}</p>
            {c.crm && <p className="text-xs text-slate-300">CRM: {c.crm}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar size={12} /><span className="text-xs">Data</span>
            </div>
            <p className="text-sm font-semibold text-navy-900">{formatDate(c.data)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <User size={12} /><span className="text-xs">Horário</span>
            </div>
            <p className="text-sm font-semibold text-navy-900">{c.hora ?? '-'}</p>
          </div>
        </div>

        {c.observacoes && (
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <FileText size={13} /><span className="text-xs font-semibold">Observações</span>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{c.observacoes}</p>
          </div>
        )}

        {c.anotacoes_medico && (
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <FileText size={13} /><span className="text-xs font-semibold">Anotações do médico</span>
            </div>
            <p className="text-sm text-slate-600 bg-cyan-50 rounded-xl p-3">{c.anotacoes_medico}</p>
          </div>
        )}
      </div>
    </div>
  )
}
