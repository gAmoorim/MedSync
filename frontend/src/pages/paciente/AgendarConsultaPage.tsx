import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Search, ChevronRight } from 'lucide-react'
import { getHorariosDisponiveis, agendarConsulta } from '../../api/paciente'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, Card, Loading, EmptyState, Modal, Textarea } from '../../components/ui'
import { getErrorMessage, getHoje } from '../../utils'
import type { HorarioDisponivel } from '../../types'

export default function AgendarConsultaPage() {
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const [data, setData] = useState(getHoje())
  const [especialidade, setEspecialidade] = useState('')
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [selectedHorario, setSelectedHorario] = useState<HorarioDisponivel | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSearch = async () => {
    if (!data) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await getHorariosDisponiveis({ data, especialidade: especialidade || undefined })
      setHorarios(res)
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHorario = (h: HorarioDisponivel) => {
    setSelectedHorario(h)
    setConfirmOpen(true)
  }

  const handleConfirmar = async () => {
    if (!selectedHorario) return
    setSubmitting(true)
    try {
      await agendarConsulta(selectedHorario.horario_id, selectedHorario.data, selectedHorario.hora_inicio, observacoes || undefined)
      success('Consulta agendada com sucesso!')
      navigate('/paciente/consultas')
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  // Group slots by doctor
  const medicosMap = horarios.reduce<Record<number, { medico_nome: string; especialidade: string; slots: HorarioDisponivel[] }>>(
    (acc, h) => {
      if (!acc[h.medico_id]) acc[h.medico_id] = { medico_nome: h.medico_nome, especialidade: h.especialidade, slots: [] }
      acc[h.medico_id].slots.push(h)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agendar Consulta</h1>
        <p className="text-slate-500 mt-1">Escolha a data e especialidade para ver os horários disponíveis</p>
      </div>

      {/* Search filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="label">Data</label>
            <Input
              type="date"
              value={data}
              min={getHoje()}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <Input
            label="Especialidade (opcional)"
            placeholder="Ex: Cardiologia"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
          />
          <Button onClick={handleSearch} loading={loading} className="w-full">
            <Search size={16} />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <Loading text="Buscando horários disponíveis..." />
      ) : !searched ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione uma data e clique em Buscar</p>
        </div>
      ) : Object.keys(medicosMap).length === 0 ? (
        <EmptyState
          title="Nenhum horário disponível"
          description="Tente outra data ou especialidade"
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(medicosMap).map(([medicoId, { medico_nome, especialidade: esp, slots }]) => (
            <Card key={medicoId}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {medico_nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{medico_nome}</p>
                  <p className="text-sm text-slate-500">{esp}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectHorario(slot)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-all"
                  >
                    <Clock size={12} className="shrink-0" />
                    {slot.hora_inicio}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar Agendamento">
        {selectedHorario && (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-xl p-4 space-y-2">
              {[
                { label: 'Médico', value: selectedHorario.medico_nome },
                { label: 'Especialidade', value: selectedHorario.especialidade },
                { label: 'Data', value: new Date(selectedHorario.data + 'T00:00:00').toLocaleDateString('pt-BR') },
                { label: 'Horário', value: `${selectedHorario.hora_inicio} – ${selectedHorario.hora_fim}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>

            <Textarea
              label="Observações (opcional)"
              placeholder="Descreva o motivo da consulta ou informações relevantes..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmar} loading={submitting}>
                <ChevronRight size={16} />
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
