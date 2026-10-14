import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar, ClipboardList, Users, Clock, CheckCircle,
  ArrowLeft, Plus, Trash2, Search, AlertTriangle, Save, Lock, ChevronRight
} from 'lucide-react'
import {
  getMedicoPerfil, atualizarMedicoPerfil, getAgendaMedico,
  getConsultasMedico, getDetalheConsultaMedico, confirmarConsulta,
  concluirConsulta, getHorariosMedico, criarHorarios, inativarHorario
} from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Spinner, Err, Empty, Badge, StatCard, Modal, Confirm, Button, Input, Textarea } from '../../components/ui'
import { formatDate, statusConfig, getHoje, diasSemana, diasSemanaFull, getErr } from '../../utils'
import type { Consulta, StatusConsulta, HorarioAtendimento, Medico } from '../../types'

/* ── DASHBOARD ────────────────────────────────────────────── */
export function MedicoDashboard() {
  const { usuario } = useAuth()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  useEffect(() => {
    getConsultasMedico({ data: getHoje(), limite: 20 }).then(r => setConsultas(r ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: consultas.length,
    agendadas: consultas.filter(c => c.status === 'agendada').length,
    confirmadas: consultas.filter(c => c.status === 'confirmada').length,
    concluidas: consultas.filter(c => c.status === 'concluida').length,
  }

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{saudacao} 👋</p>
          <h1 className="text-2xl font-bold text-navy-900">{usuario?.nome?.split(' ').slice(0, 2).join(' ')}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Agenda de hoje — {formatDate(getHoje())}</p>
        </div>
        <Link to="/app/medico/agenda" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <Calendar size={15} /> Agenda completa
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total hoje" value={stats.total} icon={<Users size={18} />} />
        <StatCard label="Agendadas" value={stats.agendadas} icon={<Clock size={18} />} accent />
        <StatCard label="Confirmadas" value={stats.confirmadas} icon={<CheckCircle size={18} />} />
        <StatCard label="Concluídas" value={stats.concluidas} icon={<ClipboardList size={18} />} />
      </div>

      <div className="app-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-navy-900">Pacientes de hoje</h2>
          <Link to="/app/medico/consultas" className="text-xs text-cyan-600 font-semibold flex items-center gap-1">
            Ver tudo <ChevronRight size={13} />
          </Link>
        </div>
        {loading ? <Spinner /> : consultas.length === 0 ? (
          <div className="text-center py-10">
            <Users size={30} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">Nenhuma consulta hoje</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {consultas.map((c, i) => {
              const sc = statusConfig[c.status as StatusConsulta]
              return (
                <Link key={i} to={`/app/medico/consultas/${c.consulta_id}`}
                  className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                    {c.paciente_nome?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">{c.paciente_nome}</p>
                    <p className="text-xs text-slate-400">{c.hora ?? c.hora_inicio}</p>
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

/* ── AGENDA ───────────────────────────────────────────────── */
export function AgendaMedicoPage() {
  const { error } = useToast()
  const today = getHoje()
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const [di, setDi] = useState(today)
  const [df, setDf] = useState(nextWeek)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    setLoading(true); setSearched(true)
    try { setConsultas((await getAgendaMedico(di, df)) ?? []) }
    catch (e) { error(getErr(e)) }
    finally { setLoading(false) }
  }

  const byDate = consultas.reduce<Record<string, Consulta[]>>((acc, c) => {
    const d = c.data?.split('T')[0] ?? c.data
    if (!acc[d]) acc[d] = []
    acc[d].push(c); return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Agenda</h1>
        <p className="text-slate-400 text-sm mt-1">Visualize suas consultas por período</p>
      </div>

      <div className="app-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input label="Data início" type="date" value={di} onChange={e => setDi(e.target.value)} />
          <Input label="Data fim" type="date" value={df} min={di} onChange={e => setDf(e.target.value)} />
          <Button onClick={search} loading={loading}><Search size={15} /> Buscar</Button>
        </div>
      </div>

      {loading ? <Spinner /> : !searched ? (
        <div className="text-center py-16 text-slate-300"><Calendar size={40} className="mx-auto mb-3" />
          <p className="text-sm text-slate-400">Selecione um período e busque</p></div>
      ) : Object.keys(byDate).length === 0 ? <Empty title="Nenhuma consulta no período" /> : (
        <div className="space-y-5">
          {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
            <div key={date}>
              <p className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-cyan-500" /> {formatDate(date)}
                <span className="text-slate-300 font-normal">({items.length})</span>
              </p>
              <div className="space-y-2">
                {items.map((c, i) => {
                  const sc = statusConfig[c.status as StatusConsulta]
                  return (
                    <Link key={i} to={`/app/medico/consultas/${c.consulta_id}`}
                      className="app-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-sm font-bold text-navy-900">{c.hora_inicio?.substring(0, 5)}</p>
                        <p className="text-xs text-slate-400">{c.hora_fim?.substring(0, 5)}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 text-sm truncate">{c.paciente_nome}</p>
                        {c.observacoes && <p className="text-xs text-slate-400 truncate">{c.observacoes}</p>}
                      </div>
                      <Badge cls={sc.cls}>{sc.label}</Badge>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── CONSULTAS DO DIA ─────────────────────────────────────── */
export function ConsultasMedicoPage() {
  const { error: toastError } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(getHoje())
  const [status, setStatus] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try { setConsultas((await getConsultasMedico({ data, status: status || undefined, limite: 30 })) ?? []) }
    catch (e) { toastError(getErr(e)) }
    finally { setLoading(false) }
  }, [data, status])

  useEffect(() => { fetch() }, [fetch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Consultas</h1>
        <p className="text-slate-400 text-sm mt-1">Pacientes agendados por data</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input type="date" value={data} onChange={e => setData(e.target.value)} className="max-w-[180px]" />
        {['', 'agendada', 'confirmada', 'concluida', 'cancelada'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${status === s ? 'bg-navy-950 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            {s === '' ? 'Todos' : statusConfig[s as StatusConsulta].label}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : consultas.length === 0 ? <Empty title="Nenhuma consulta encontrada" /> : (
        <div className="space-y-2">
          {consultas.map((c, i) => {
            const sc = statusConfig[c.status as StatusConsulta]
            return (
              <Link key={i} to={`/app/medico/consultas/${c.consulta_id}`}
                className="app-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
                <div className="w-10 h-10 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                  {c.paciente_nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{c.paciente_nome}</p>
                  <p className="text-xs text-slate-400">{c.hora ?? c.hora_inicio}</p>
                </div>
                <Badge cls={sc.cls}>{sc.label}</Badge>
                <ChevronRight size={15} className="text-slate-300" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── DETALHE CONSULTA MÉDICO ──────────────────────────────── */
export function DetalheConsultaMedicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [c, setC] = useState<Consulta | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [concludeOpen, setConcludeOpen] = useState(false)
  const [concluding, setConcluding] = useState(false)
  const [anotacoes, setAnotacoes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchC = () => {
    if (!id) return
    getDetalheConsultaMedico(Number(id)).then(setC).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(fetchC, [id])

  const doConfirmar = async () => {
    if (!id) return; setConfirming(true)
    try { await confirmarConsulta(Number(id)); success('Consulta confirmada!'); fetchC() }
    catch (e) { error(getErr(e)) }
    finally { setConfirming(false); setConfirmOpen(false) }
  }

  const doConcluir = async () => {
    if (!id) return; setConcluding(true)
    try { await concluirConsulta(Number(id), anotacoes || undefined); success('Consulta concluída!'); setConcludeOpen(false); fetchC() }
    catch (e) { error(getErr(e)) }
    finally { setConcluding(false) }
  }

  if (loading) return <Spinner />
  if (!c) return <Err />
  const sc = statusConfig[c.status as StatusConsulta]

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-navy-900">Detalhe da Consulta</h1>
        <Badge cls={sc.cls}>{sc.label}</Badge>
      </div>

      <div className="app-card p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Paciente</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 font-bold text-lg">
              {c.paciente_nome?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-navy-900">{c.paciente_nome}</p>
              {c.paciente_cpf && <p className="text-xs text-slate-400">CPF: {c.paciente_cpf}</p>}
              {c.paciente_telefone && <p className="text-xs text-slate-400">{c.paciente_telefone}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['Data', formatDate(c.data)], ['Horário', c.hora ?? '-']].map(([k, v]) => (
            <div key={k} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">{k}</p>
              <p className="text-sm font-semibold text-navy-900">{v}</p>
            </div>
          ))}
        </div>

        {c.observacoes && (
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Observações do paciente</p>
            <p className="text-sm text-slate-700">{c.observacoes}</p>
          </div>
        )}

        {c.anotacoes_medico && (
          <div className="bg-cyan-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Suas anotações</p>
            <p className="text-sm text-slate-700">{c.anotacoes_medico}</p>
          </div>
        )}
      </div>

      {(c.status === 'agendada' || c.status === 'confirmada') && (
        <div className="flex gap-3">
          {c.status === 'agendada' && (
            <Button variant="secondary" onClick={() => setConfirmOpen(true)} loading={confirming}>
              <CheckCircle size={15} /> Confirmar
            </Button>
          )}
          <Button onClick={() => setConcludeOpen(true)}>
            <CheckCircle size={15} /> Concluir
          </Button>
        </div>
      )}

      <Confirm open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={doConfirmar}
        title="Confirmar consulta" desc="O paciente será notificado por e-mail." label="Confirmar" danger={false} loading={confirming} />

      <Modal open={concludeOpen} onClose={() => setConcludeOpen(false)} title="Concluir Consulta">
        <div className="space-y-4">
          <Textarea label="Anotações médicas (opcional)" placeholder="Diagnóstico, prescrições..."
            rows={4} value={anotacoes} onChange={e => setAnotacoes(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConcludeOpen(false)} disabled={concluding}>Cancelar</Button>
            <Button onClick={doConcluir} loading={concluding}>Concluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ── HORÁRIOS ─────────────────────────────────────────────── */
const horarioSchema = z.object({
  dias_semana: z.array(z.number()).min(1, 'Selecione ao menos um dia'),
  hora_inicio: z.string().min(1), hora_fim: z.string().min(1),
  intervalo_minutos: z.number().min(15),
  data_inicio_vigencia: z.string().min(1),
  data_fim_vigencia: z.string().optional(),
})
type HF = z.infer<typeof horarioSchema>

export function HorariosMedicoPage() {
  const { success, error } = useToast()
  const [horarios, setHorarios] = useState<HorarioAtendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<HF>({
    resolver: zodResolver(horarioSchema),
    defaultValues: { dias_semana: [], intervalo_minutos: 30 },
  })

  const fetch = useCallback(async () => {
    setLoading(true)
    try { setHorarios((await getHorariosMedico()) ?? []) }
    catch { }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const onSubmit = async (d: HF) => {
    try { await criarHorarios(d); success('Horários criados!'); setOpen(false); reset(); fetch() }
    catch (e) { error(getErr(e)) }
  }

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true)
    try { await inativarHorario(deleteId); success('Horário inativado!'); setDeleteId(null); fetch() }
    catch (e) { error(getErr(e)) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Horários de Atendimento</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie sua disponibilidade semanal</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> Novo</Button>
      </div>

      {loading ? <Spinner /> : horarios.length === 0 ? (
        <Empty title="Nenhum horário cadastrado"
          desc="Cadastre seus horários para que pacientes possam agendar"
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> Cadastrar</Button>} />
      ) : (
        <div className="space-y-2">
          {horarios.map(h => (
            <div key={h.horario_id} className="app-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy-950 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-navy-900 text-sm">{diasSemanaFull[h.dia_semana]}</p>
                  <Badge cls={h.ativo ? 'badge-green' : 'badge-slate'}>{h.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {h.hora_inicio?.substring(0, 5)} – {h.hora_fim?.substring(0, 5)} · a cada {h.intervalo_minutos} min
                </p>
              </div>
              {h.ativo && (
                <button onClick={() => setDeleteId(h.horario_id)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Horário de Atendimento" maxW="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="app-label">Dias da semana</label>
            <Controller control={control} name="dias_semana" render={({ field }) => (
              <div className="grid grid-cols-7 gap-1.5">
                {diasSemana.map((d, i) => {
                  const sel = field.value.includes(i)
                  return (
                    <button key={i} type="button"
                      onClick={() => field.onChange(sel ? field.value.filter(x => x !== i) : [...field.value, i])}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${sel ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {d}
                    </button>
                  )
                })}
              </div>
            )} />
            {errors.dias_semana && <p className="text-xs text-red-500 mt-1">{errors.dias_semana.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Início" type="time" error={errors.hora_inicio?.message} {...register('hora_inicio')} />
            <Input label="Fim" type="time" error={errors.hora_fim?.message} {...register('hora_fim')} />
            <Input label="Intervalo (min)" type="number" min={15} step={15}
              error={errors.intervalo_minutos?.message} {...register('intervalo_minutos', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Início vigência" type="date" error={errors.data_inicio_vigencia?.message} {...register('data_inicio_vigencia')} />
            <Input label="Fim vigência (opcional)" type="date" {...register('data_fim_vigencia')} />
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600">Consultas já agendadas não serão afetadas.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Criar</Button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Inativar horário"
        desc="Este horário não aceitará novos agendamentos. Consultas agendadas não são afetadas."
        label="Inativar" loading={deleting} />
    </div>
  )
}

/* ── PERFIL MÉDICO ────────────────────────────────────────── */
export function PerfilMedicoPage() {
  const { success, error } = useToast()
  const [m, setM] = useState<Medico | null>(null)
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(z.object({ nome: z.string().min(3), telefone: z.string().min(10) })),
  })

  useEffect(() => {
    getMedicoPerfil().then(d => { setM(d); reset({ nome: d.nome, telefone: d.telefone }) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Meu Perfil</h1>
        <p className="text-slate-400 text-sm mt-1">Suas informações profissionais</p>
      </div>

      <div className="app-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 text-xl font-bold">
          {m?.nome?.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-navy-900">{m?.nome}</p>
          <p className="text-sm text-slate-400">{m?.email}</p>
          <p className="text-xs text-slate-300 mt-0.5">{m?.especialidade} · CRM: {m?.crm}</p>
        </div>
      </div>

      <div className="app-card p-6">
        <h2 className="font-bold text-navy-900 mb-5 flex items-center gap-2"><Lock size={16} /> Editar informações</h2>
        <form onSubmit={handleSubmit(async d => { try { await atualizarMedicoPerfil(d); success('Perfil atualizado!') } catch (e) { error(getErr(e)) } })} className="space-y-4">
          <Input label="Nome completo" error={(errors as { nome?: { message?: string } }).nome?.message} {...register('nome')} />
          <Input label="Telefone" error={(errors as { telefone?: { message?: string } }).telefone?.message} {...register('telefone')} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={isSubmitting}><Save size={14} /> Salvar</Button>
          </div>
        </form>
        <p className="text-xs text-slate-300 mt-4">CRM, especialidade e e-mail só podem ser alterados pelo administrador.</p>
      </div>
    </div>
  )
}
