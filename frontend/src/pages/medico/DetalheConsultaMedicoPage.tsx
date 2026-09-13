import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, Calendar, FileText, CheckCircle } from 'lucide-react'
import { getDetalheConsulta, confirmarConsulta, concluirConsulta } from '../../api/medico'
import { useToast } from '../../contexts/ToastContext'
import { Badge, Button, Card, Loading, ErrorState, ConfirmDialog, Modal, Textarea } from '../../components/ui'
import { formatDate, formatCPF, getErrorMessage, getStatusBadge, getStatusLabel } from '../../utils'
import type { ConsultaMedico, StatusConsulta } from '../../types'

export default function DetalheConsultaMedicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [consulta, setConsulta] = useState<ConsultaMedico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [confirmandoOpen, setConfirmandoOpen] = useState(false)
  const [confirmandoLoading, setConfirmandoLoading] = useState(false)
  const [concluindoOpen, setConcluindoOpen] = useState(false)
  const [concluindoLoading, setConcluindoLoading] = useState(false)
  const [anotacoes, setAnotacoes] = useState('')

  const fetchConsulta = () => {
    if (!id) return
    getDetalheConsulta(Number(id))
      .then(setConsulta)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(fetchConsulta, [id])

  const handleConfirmar = async () => {
    if (!id) return
    setConfirmandoLoading(true)
    try {
      await confirmarConsulta(Number(id))
      success('Consulta confirmada com sucesso!')
      fetchConsulta()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setConfirmandoLoading(false)
      setConfirmandoOpen(false)
    }
  }

  const handleConcluir = async () => {
    if (!id) return
    setConcluindoLoading(true)
    try {
      await concluirConsulta(Number(id), anotacoes || undefined)
      success('Consulta concluída com sucesso!')
      setConcluindoOpen(false)
      fetchConsulta()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setConcluindoLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error || !consulta) return <ErrorState />

  const statusVariant = getStatusBadge(consulta.status as StatusConsulta).replace('badge-', '') as 'blue' | 'green' | 'red' | 'gray'
  const podeConfirmar = consulta.status === 'agendada'
  const podeConcluir = consulta.status === 'agendada' || consulta.status === 'confirmada'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Detalhe da Consulta</h1>
        <Badge variant={statusVariant}>{getStatusLabel(consulta.status as StatusConsulta)}</Badge>
      </div>

      {/* Patient info */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Paciente</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
            {consulta.paciente_nome?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{consulta.paciente_nome}</p>
            {consulta.paciente_cpf && (
              <p className="text-sm text-slate-500">CPF: {formatCPF(consulta.paciente_cpf)}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {consulta.paciente_data_nascimento && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User size={13} />
                <span className="text-xs">Nascimento</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{formatDate(consulta.paciente_data_nascimento)}</p>
            </div>
          )}
          {consulta.paciente_telefone && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Phone size={13} />
                <span className="text-xs">Telefone</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{consulta.paciente_telefone}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Appointment info */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Consulta</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar size={13} />
              <span className="text-xs">Data</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{formatDate(consulta.data)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar size={13} />
              <span className="text-xs">Horário</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{consulta.hora ?? '-'}</p>
          </div>
        </div>

        {consulta.observacoes && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <FileText size={13} />
              <span className="text-xs font-medium">Observações do paciente</span>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{consulta.observacoes}</p>
          </div>
        )}

        {consulta.anotacoes_medico && (
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <FileText size={13} />
              <span className="text-xs font-medium">Suas anotações</span>
            </div>
            <p className="text-sm text-slate-700 bg-primary-50 rounded-xl p-3">{consulta.anotacoes_medico}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      {(podeConfirmar || podeConcluir) && (
        <div className="flex gap-3">
          {podeConfirmar && (
            <Button variant="secondary" onClick={() => setConfirmandoOpen(true)}>
              <CheckCircle size={16} />
              Confirmar consulta
            </Button>
          )}
          {podeConcluir && (
            <Button onClick={() => setConcluindoOpen(true)}>
              <CheckCircle size={16} />
              Concluir consulta
            </Button>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmandoOpen}
        onClose={() => setConfirmandoOpen(false)}
        onConfirm={handleConfirmar}
        title="Confirmar consulta"
        description="Deseja confirmar esta consulta? O paciente será notificado por e-mail."
        confirmLabel="Confirmar"
        loading={confirmandoLoading}
        variant="primary"
      />

      {/* Conclude modal */}
      <Modal open={concluindoOpen} onClose={() => setConcluindoOpen(false)} title="Concluir Consulta">
        <div className="space-y-4">
          <Textarea
            label="Anotações médicas (opcional)"
            placeholder="Diagnóstico, prescrições, observações..."
            value={anotacoes}
            onChange={(e) => setAnotacoes(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConcluindoOpen(false)} disabled={concluindoLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConcluir} loading={concluindoLoading}>
              Concluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
