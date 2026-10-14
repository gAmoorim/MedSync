import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Stethoscope, ClipboardList, BarChart2,
  Plus, Search, UserX, XCircle, TrendingDown, TrendingUp, Award
} from 'lucide-react'
import {
  adminGetMedicos, adminCadastrarMedico, adminInativarMedico,
  adminGetPacientes, adminGetConsultas, adminCancelarConsulta,
  adminGetRelatorioConsultas, adminGetRelatorioMedicos,
  getEspecialidades, adminGetRelatorioConsultas as getRelConsultas
} from '../../api'
import { useToast } from '../../contexts/ToastContext'
import {
  Spinner, Empty, Badge, StatCard, Modal, Confirm, Button, Input
} from '../../components/ui'
import { formatDate, formatCPF, statusConfig, getErr, getMesAtual } from '../../utils'
import type { Medico, Paciente, Consulta, StatusConsulta, RelatorioConsultas, RelatorioMedico } from '../../types'

/* ── DASHBOARD ADMIN ──────────────────────────────────────── */
export function AdminDashboard() {
  const [rel, setRel] = useState<RelatorioConsultas | null>(null)
  const [totalMedicos, setTotalMedicos] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getRelConsultas(getMesAtual()), adminGetMedicos({ ativo: true, limite: 100 })])
      .then(([r, m]) => {
        if (r.status === 'fulfilled') setRel(r.value)
        if (m.status === 'fulfilled') setTotalMedicos(m.value.length)
      }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Consultas este mês" value={rel?.total ?? '-'} icon={<ClipboardList size={19} />} accent />
            <StatCard label="Médicos ativos" value={totalMedicos ?? '-'} icon={<Stethoscope size={19} />} />
            <StatCard label="Taxa de cancelamento" value={rel?.taxa_cancelamento ?? '-'} icon={<TrendingDown size={19} />} />
          </div>

          {rel && (
            <div className="app-card p-6">
              <h2 className="font-bold text-navy-900 mb-5">Consultas por status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Agendadas', value: rel.por_status.agendadas, cls: 'badge-cyan' },
                  { label: 'Confirmadas', value: rel.por_status.confirmadas, cls: 'badge-green' },
                  { label: 'Concluídas', value: rel.por_status.concluidas, cls: 'badge-slate' },
                  { label: 'Canceladas', value: rel.por_status.canceladas, cls: 'badge-red' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                    <span className={`${s.cls} mt-1.5 inline-flex`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── MÉDICOS ──────────────────────────────────────────────── */
const medicoSchema = z.object({
  nome: z.string().min(3), email: z.string().email(), senha: z.string().min(6),
  crm: z.string().min(5), especialidade_id: z.number().min(1), telefone: z.string().min(10),
})
type MF = z.infer<typeof medicoSchema>

export function AdminMedicosPage() {
  const { success, error } = useToast()
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<{ id: number; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [inativarId, setInativarId] = useState<number | null>(null)
  const [inativando, setInativando] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MF>({
    resolver: zodResolver(medicoSchema),
  })

  const fetch = useCallback(async () => {
    setLoading(true)
    try { setMedicos((await adminGetMedicos({ limite: 100 })) ?? []) }
    catch { }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetch()
    getEspecialidades().then(setEspecialidades).catch(() => {})
  }, [fetch])

  const filtered = medicos.filter(m =>
    m.nome?.toLowerCase().includes(search.toLowerCase()) ||
    m.crm?.toLowerCase().includes(search.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (d: MF) => {
    try { await adminCadastrarMedico(d); success('Médico cadastrado!'); setOpen(false); reset(); fetch() }
    catch (e) { error(getErr(e)) }
  }

  const handleInativar = async () => {
    if (!inativarId) return; setInativando(true)
    try { await adminInativarMedico(inativarId); success('Médico inativado!'); setInativarId(null); fetch() }
    catch (e) { error(getErr(e)) }
    finally { setInativando(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Médicos</h1>
          <p className="text-slate-400 text-sm mt-1">{medicos.length} cadastrado{medicos.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> Novo médico</Button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="app-input pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <Empty title="Nenhum médico encontrado" /> : (
        <div className="app-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Médico', 'CRM', 'Especialidade', 'Telefone', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-950 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                          {m.nome?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{m.nome}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">{m.crm}</td>
                    <td className="py-3.5 px-5 text-slate-500">{m.especialidade}</td>
                    <td className="py-3.5 px-5 text-slate-500">{m.telefone}</td>
                    <td className="py-3.5 px-5">
                      <Badge cls={m.ativo ? 'badge-green' : 'badge-slate'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      {m.ativo && (
                        <button onClick={() => setInativarId(m.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <UserX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar Médico" maxW="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome completo" error={errors.nome?.message} {...register('nome')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Senha inicial" type="password" error={errors.senha?.message} {...register('senha')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="CRM" placeholder="CRM-CE-12345" error={errors.crm?.message} {...register('crm')} />
            <Input label="Telefone" error={errors.telefone?.message} {...register('telefone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="app-label">Especialidade</label>
            <select className={`app-input ${errors.especialidade_id ? 'app-input-error' : ''}`}
              {...register('especialidade_id', { valueAsNumber: true })}>
              <option value="">Selecione...</option>
              {especialidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
            {errors.especialidade_id && <p className="text-xs text-red-500">{errors.especialidade_id.message}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Cadastrar</Button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!inativarId} onClose={() => setInativarId(null)} onConfirm={handleInativar}
        title="Inativar médico"
        desc="Médicos com consultas futuras não podem ser inativados."
        label="Inativar" loading={inativando} />
    </div>
  )
}

/* ── PACIENTES ────────────────────────────────────────────── */
export function AdminPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetPacientes({ limite: 100 }).then(r => setPacientes(r ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Pacientes</h1>
        <p className="text-slate-400 text-sm mt-1">{pacientes.length} cadastrado{pacientes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="app-input pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <Empty title="Nenhum paciente encontrado" /> : (
        <div className="app-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Paciente', 'CPF', 'Telefone', 'Nascimento', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          {p.nome?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{p.nome}</p>
                          <p className="text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-500">{p.cpf ? formatCPF(p.cpf) : '-'}</td>
                    <td className="py-3.5 px-5 text-slate-500">{p.telefone}</td>
                    <td className="py-3.5 px-5 text-slate-500">{formatDate(p.data_nascimento)}</td>
                    <td className="py-3.5 px-5">
                      <Badge cls={p.ativo !== false ? 'badge-green' : 'badge-slate'}>
                        {p.ativo !== false ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── CONSULTAS ADMIN ──────────────────────────────────────── */
export function AdminConsultasPage() {
  const { success, error } = useToast()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [di, setDi] = useState('')
  const [df, setDf] = useState('')
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [canceling, setCanceling] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      setConsultas((await adminGetConsultas({
        status: status || undefined,
        data_inicio: di || undefined,
        data_fim: df || undefined,
        limite: 50,
      })) ?? [])
    } catch { }
    finally { setLoading(false) }
  }, [status, di, df])

  useEffect(() => { fetch() }, [fetch])

  const handleCancelar = async () => {
    if (!cancelId || !motivo.trim()) return
    setCanceling(true)
    try { await adminCancelarConsulta(cancelId, motivo); success('Consulta cancelada!'); setCancelId(null); setMotivo(''); fetch() }
    catch (e) { error(getErr(e)) }
    finally { setCanceling(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Consultas</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie todas as consultas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {['', 'agendada', 'confirmada', 'concluida', 'cancelada'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${status === s ? 'bg-navy-950 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            {s === '' ? 'Todos' : statusConfig[s as StatusConsulta].label}
          </button>
        ))}
        <Input type="date" value={di} onChange={e => setDi(e.target.value)} className="max-w-[150px]" />
        <span className="text-slate-300 text-xs">até</span>
        <Input type="date" value={df} onChange={e => setDf(e.target.value)} className="max-w-[150px]" />
        {(di || df) && (
          <button onClick={() => { setDi(''); setDf('') }} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <XCircle size={13} /> Limpar datas
          </button>
        )}
      </div>

      {loading ? <Spinner /> : consultas.length === 0 ? <Empty title="Nenhuma consulta encontrada" /> : (
        <div className="app-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Paciente', 'Médico', 'Especialidade', 'Data', 'Hora', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consultas.map((c, i) => {
                  const sc = statusConfig[c.status as StatusConsulta]
                  const podeCanc = c.status === 'agendada' || c.status === 'confirmada'
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-navy-900">{c.paciente_nome}</td>
                      <td className="py-3 px-4 text-slate-500">{c.medico_nome}</td>
                      <td className="py-3 px-4 text-slate-500">{c.especialidade}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(c.data)}</td>
                      <td className="py-3 px-4 text-slate-500">{c.hora}</td>
                      <td className="py-3 px-4"><Badge cls={sc.cls}>{sc.label}</Badge></td>
                      <td className="py-3 px-4">
                        {podeCanc && (
                          <button onClick={() => setCancelId(c.consulta_id ?? c.id ?? 0)}
                            className="text-xs text-red-500 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${cancelId ? '' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelId(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <h3 className="font-bold text-navy-900 mb-2">Cancelar consulta</h3>
          <p className="text-sm text-slate-400 mb-4">Informe o motivo. O paciente e o médico serão notificados.</p>
          <textarea rows={3} placeholder="Motivo do cancelamento..."
            className="app-input resize-none mb-4" value={motivo} onChange={e => setMotivo(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setCancelId(null); setMotivo('') }}>Cancelar</Button>
            <Button variant="danger" onClick={handleCancelar} loading={canceling} disabled={!motivo.trim()}>Confirmar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── RELATÓRIOS ───────────────────────────────────────────── */
export function AdminRelatoriosPage() {
  const { error } = useToast()
  const [mes, setMes] = useState(getMesAtual())
  const [rel, setRel] = useState<RelatorioConsultas | null>(null)
  const [relMed, setRelMed] = useState<RelatorioMedico[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true); setSearched(true)
    try {
      const [c, m] = await Promise.all([adminGetRelatorioConsultas(mes), adminGetRelatorioMedicos(mes)])
      setRel(c); setRelMed(m ?? [])
    } catch (e) { error(getErr(e)) }
    finally { setLoading(false) }
  }

  const mesLabel = mes ? new Date(mes + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Relatórios</h1>
        <p className="text-slate-400 text-sm mt-1">Análises e métricas do sistema</p>
      </div>

      <div className="app-card p-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="app-label">Mês de referência</label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)} className="app-input max-w-[200px]" />
        </div>
        <Button onClick={handleSearch} loading={loading}><Search size={15} /> Gerar relatório</Button>
      </div>

      {loading ? <Spinner text="Gerando relatório..." /> : !searched ? (
        <div className="text-center py-16 text-slate-300">
          <BarChart2 size={40} className="mx-auto mb-3" />
          <p className="text-sm text-slate-400">Selecione um mês e clique em Gerar</p>
        </div>
      ) : rel ? (
        <div className="space-y-5">
          <h2 className="font-bold text-navy-900 capitalize">{mesLabel}</h2>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total" value={rel.total} icon={<BarChart2 size={18} />} accent />
            <StatCard label="Concluídas" value={rel.por_status.concluidas} icon={<TrendingUp size={18} />} />
            <StatCard label="Canceladas" value={rel.por_status.canceladas} icon={<TrendingDown size={18} />} />
            <StatCard label="Cancelamento" value={rel.taxa_cancelamento} icon={<TrendingDown size={18} />} />
          </div>

          {/* Top médico */}
          {rel.medico_mais_atendimentos && (
            <div className="app-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Médico destaque do mês</p>
                <p className="font-bold text-navy-900">{rel.medico_mais_atendimentos.medico_nome}</p>
                <p className="text-xs text-slate-400">{rel.medico_mais_atendimentos.total} consultas concluídas</p>
              </div>
            </div>
          )}

          {/* By specialty */}
          {rel.por_especialidade?.length > 0 && (
            <div className="app-card p-6">
              <h3 className="font-bold text-navy-900 mb-5">Por especialidade</h3>
              <div className="space-y-3">
                {rel.por_especialidade.map(e => {
                  const pct = Math.round((Number(e.total) / Number(rel.total)) * 100)
                  return (
                    <div key={e.especialidade}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600">{e.especialidade}</span>
                        <span className="font-semibold text-navy-900">{e.total} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Doctors table */}
          {relMed.length > 0 && (
            <div className="app-card overflow-hidden p-0">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-navy-900">Desempenho por médico</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Médico', 'Especialidade', 'Agendadas', 'Concluídas', 'Canceladas', 'Ocupação'].map(h => (
                        <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relMed.map(m => (
                      <tr key={m.medico_id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-5 font-semibold text-navy-900">{m.nome}</td>
                        <td className="py-3 px-5 text-slate-500">{m.especialidade}</td>
                        <td className="py-3 px-5 text-cyan-600 font-medium">{m.agendadas}</td>
                        <td className="py-3 px-5 text-emerald-600 font-medium">{m.concluidas}</td>
                        <td className="py-3 px-5 text-red-500 font-medium">{m.canceladas}</td>
                        <td className="py-3 px-5 font-bold text-navy-900">{m.taxa_ocupacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
