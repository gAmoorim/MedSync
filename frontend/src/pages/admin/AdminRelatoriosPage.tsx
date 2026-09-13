import { useState } from 'react'
import { BarChart2, Search, TrendingDown, TrendingUp, Award, Stethoscope } from 'lucide-react'
import { getRelatorioConsultas, getRelatorioMedicos } from '../../api/admin'
import { useToast } from '../../contexts/ToastContext'
import { Button, Card, Loading, ErrorState } from '../../components/ui'
import { getErrorMessage, getMesAtual } from '../../utils'
import type { RelatorioConsultas, RelatorioMedico } from '../../types'

export default function AdminRelatoriosPage() {
  const { error: toastError } = useToast()
  const [mes, setMes] = useState(getMesAtual())
  const [relatorioConsultas, setRelatorioConsultas] = useState<RelatorioConsultas | null>(null)
  const [relatorioMedicos, setRelatorioMedicos] = useState<RelatorioMedico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setError(false)
    setSearched(true)
    try {
      const [consultas, medicos] = await Promise.all([
        getRelatorioConsultas(mes),
        getRelatorioMedicos(mes),
      ])
      setRelatorioConsultas(consultas)
      setRelatorioMedicos(medicos ?? [])
    } catch (err) {
      toastError(getErrorMessage(err))
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const mesFormatado = mes ? new Date(mes + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-slate-500 mt-1">Análises e métricas do sistema</p>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="label">Mês de referência</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="input max-w-[200px]"
            />
          </div>
          <Button onClick={handleSearch} loading={loading}>
            <Search size={16} />
            Gerar relatório
          </Button>
        </div>
      </Card>

      {loading ? (
        <Loading text="Gerando relatório..." />
      ) : error ? (
        <ErrorState />
      ) : !searched ? (
        <div className="text-center py-16 text-slate-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione um mês e clique em Gerar relatório</p>
        </div>
      ) : relatorioConsultas ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{mesFormatado}</h2>

          {/* Main stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total de consultas', value: relatorioConsultas.total, icon: <BarChart2 size={18} />, bg: 'bg-primary-50', color: 'text-primary-500' },
              { label: 'Agendadas', value: relatorioConsultas.por_status.agendadas, icon: <TrendingUp size={18} />, bg: 'bg-primary-50', color: 'text-primary-400' },
              { label: 'Concluídas', value: relatorioConsultas.por_status.concluidas, icon: <TrendingUp size={18} />, bg: 'bg-success-50', color: 'text-success-500' },
              { label: 'Canceladas', value: relatorioConsultas.por_status.canceladas, icon: <TrendingDown size={18} />, bg: 'bg-danger-50', color: 'text-danger-500' },
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

          {/* Taxa de cancelamento + top médico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown size={18} className="text-danger-500" />
                <h3 className="font-medium text-slate-900">Taxa de cancelamento</h3>
              </div>
              <p className="text-3xl font-bold text-danger-500">{relatorioConsultas.taxa_cancelamento}</p>
              <p className="text-sm text-slate-500 mt-1">do total de consultas no período</p>
            </Card>

            {relatorioConsultas.medico_mais_atendimentos && (
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <Award size={18} className="text-warning-500" />
                  <h3 className="font-medium text-slate-900">Médico destaque</h3>
                </div>
                <p className="text-lg font-bold text-slate-900">{relatorioConsultas.medico_mais_atendimentos.medico_nome}</p>
                <p className="text-sm text-slate-500">{relatorioConsultas.medico_mais_atendimentos.total} consultas concluídas</p>
              </Card>
            )}
          </div>

          {/* By specialty */}
          {relatorioConsultas.por_especialidade?.length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Por especialidade</h3>
              <div className="space-y-3">
                {relatorioConsultas.por_especialidade.map((esp) => {
                  const pct = Math.round((Number(esp.total) / Number(relatorioConsultas.total)) * 100)
                  return (
                    <div key={esp.especialidade}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{esp.especialidade}</span>
                        <span className="font-medium text-slate-900">{esp.total} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Doctors report */}
          {relatorioMedicos.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-900">Desempenho por médico</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Médico', 'Especialidade', 'Agendadas', 'Concluídas', 'Canceladas', 'Ocupação'].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relatorioMedicos.map((m) => (
                      <tr key={m.medico_id} className="border-b border-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-900">{m.nome}</td>
                        <td className="py-3 px-3 text-slate-500">{m.especialidade}</td>
                        <td className="py-3 px-3 text-primary-600">{m.agendadas}</td>
                        <td className="py-3 px-3 text-success-600">{m.concluidas}</td>
                        <td className="py-3 px-3 text-danger-600">{m.canceladas}</td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-900">{m.taxa_ocupacao}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
