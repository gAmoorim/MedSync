import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, ChevronRight, Calendar } from 'lucide-react'
import { getHorariosDisponiveis, agendarConsulta } from '../../api'
import { useToast } from '../../contexts/ToastContext'
import { Button, Input, Spinner, Empty, Modal, Textarea } from '../../components/ui'
import { getErr, getHoje } from '../../utils'
import type { HorarioDisponivel } from '../../types'

export default function AgendarPage() {
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [data, setData] = useState(getHoje())
  const [especialidade, setEspecialidade] = useState('')
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<HorarioDisponivel | null>(null)
  const [obs, setObs] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSearch = async () => {
    setLoading(true); setSearched(true)
    try {
      setHorarios(await getHorariosDisponiveis({ data, especialidade: especialidade || undefined }))
    } catch (e) { error(getErr(e)) }
    finally { setLoading(false) }
  }

  const handleAgendar = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await agendarConsulta(selected.horario_id, selected.data, selected.hora_inicio, obs || undefined)
      success('Consulta agendada com sucesso!')
      navigate('/app/paciente/consultas')
    } catch (e) { error(getErr(e)) }
    finally { setSubmitting(false) }
  }

  const medicos = horarios.reduce<Record<number, { nome: string; esp: string; slots: HorarioDisponivel[] }>>(
    (acc, h) => {
      if (!acc[h.medico_id]) acc[h.medico_id] = { nome: h.medico_nome, esp: h.especialidade, slots: [] }
      acc[h.medico_id].slots.push(h)
      return acc
    }, {}
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Agendar Consulta</h1>
        <p className="text-slate-400 text-sm mt-1">Selecione a data e especialidade para ver os horários disponíveis</p>
      </div>

      {/* Filters */}
      <div className="app-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input label="Data" type="date" value={data} min={getHoje()}
            onChange={e => setData(e.target.value)} />
          <Input label="Especialidade (opcional)" placeholder="Ex: Cardiologia"
            value={especialidade} onChange={e => setEspecialidade(e.target.value)} />
          <Button onClick={handleSearch} loading={loading}>
            <Search size={15} /> Buscar
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? <Spinner text="Buscando horários..." /> :
       !searched ? (
        <div className="text-center py-16 text-slate-300">
          <Calendar size={40} className="mx-auto mb-3" />
          <p className="text-sm text-slate-400">Selecione uma data e clique em Buscar</p>
        </div>
      ) : Object.keys(medicos).length === 0 ? (
        <Empty title="Nenhum horário disponível" desc="Tente outra data ou especialidade" />
      ) : (
        <div className="space-y-4">
          {Object.entries(medicos).map(([id, { nome, esp, slots }]) => (
            <div key={id} className="app-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                  {nome.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-navy-900 text-sm">{nome}</p>
                  <p className="text-xs text-slate-400">{esp}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slots.map((s, i) => (
                  <button key={i} onClick={() => setSelected(s)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-all">
                    <Clock size={11} /> {s.hora_inicio}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Confirmar agendamento">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {[
                ['Médico', selected.medico_nome],
                ['Especialidade', selected.especialidade],
                ['Data', new Date(selected.data + 'T00:00:00').toLocaleDateString('pt-BR')],
                ['Horário', `${selected.hora_inicio} – ${selected.hora_fim}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-navy-900">{v}</span>
                </div>
              ))}
            </div>
            <Textarea label="Observações (opcional)" placeholder="Motivo da consulta ou informações relevantes..."
              value={obs} onChange={e => setObs(e.target.value)} />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)} disabled={submitting}>Cancelar</Button>
              <Button onClick={handleAgendar} loading={submitting}>
                <ChevronRight size={16} /> Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
