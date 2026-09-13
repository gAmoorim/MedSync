import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react'
import { getDetalheConsulta } from '../../api/paciente'
import { Badge, Button, Card, Loading, ErrorState } from '../../components/ui'
import { formatDate, getStatusBadge, getStatusLabel } from '../../utils'
import type { Consulta, StatusConsulta } from '../../types'

export default function DetalheConsultaPacientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    getDetalheConsulta(Number(id))
      .then(setConsulta)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (error || !consulta) return <ErrorState />

  const statusVariant = getStatusBadge(consulta.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Detalhe da Consulta</h1>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <User size={22} className="text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{consulta.medico_nome}</p>
              <p className="text-sm text-slate-500">{consulta.especialidade}</p>
              {consulta.crm && <p className="text-xs text-slate-400">CRM: {consulta.crm}</p>}
            </div>
          </div>
          <Badge variant={statusVariant}>{getStatusLabel(consulta.status as StatusConsulta)}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Data', value: formatDate(consulta.data), icon: <Calendar size={14} /> },
            { label: 'Horário', value: consulta.hora ?? '-', icon: <Calendar size={14} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                {icon}
                <span className="text-xs">{label}</span>
              </div>
              <p className="font-medium text-slate-900 text-sm">{value}</p>
            </div>
          ))}
        </div>

        {consulta.observacoes && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <FileText size={14} />
              <span className="text-sm font-medium">Observações</span>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{consulta.observacoes}</p>
          </div>
        )}

        {consulta.anotacoes_medico && (
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <FileText size={14} />
              <span className="text-sm font-medium">Anotações do médico</span>
            </div>
            <p className="text-sm text-slate-700 bg-primary-50 rounded-xl p-3">{consulta.anotacoes_medico}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
