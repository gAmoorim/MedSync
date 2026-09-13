import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Stethoscope, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react'
import { getMedicos } from '../../api/admin'
import { getRelatorioConsultas } from '../../api/admin'
import { Card, Loading, Badge } from '../../components/ui'
import { getMesAtual } from '../../utils'

export default function AdminDashboard() {
  const [relatorio, setRelatorio] = useState<{
    total: string
    por_status: { agendadas: string; confirmadas: string; concluidas: string; canceladas: string }
    taxa_cancelamento: string
  } | null>(null)
  const [totalMedicos, setTotalMedicos] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getRelatorioConsultas(getMesAtual()),
      getMedicos({ ativo: true, limite: 100 }),
    ]).then(([relRes, medRes]) => {
      if (relRes.status === 'fulfilled') setRelatorio(relRes.value as typeof relatorio)
      if (medRes.status === 'fulfilled') setTotalMedicos(medRes.value.length)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Consultas este mês',
      value: relatorio?.total ?? '-',
      icon: <ClipboardList size={20} />,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
      href: '/admin/consultas',
    },
    {
      label: 'Médicos ativos',
      value: totalMedicos ?? '-',
      icon: <Stethoscope size={20} />,
      color: 'text-success-500',
      bg: 'bg-success-50',
      href: '/admin/medicos',
    },
    {
      label: 'Taxa de cancelamento',
      value: relatorio?.taxa_cancelamento ?? '-',
      icon: <TrendingUp size={20} />,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
      href: '/admin/relatorios',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do sistema — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.href}>
              <Card className="hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{String(stat.value)}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Status breakdown */}
      {relatorio && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Consultas por status</h2>
            <Link to="/admin/relatorios" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              Relatório completo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Agendadas', value: relatorio.por_status.agendadas, variant: 'blue' as const },
              { label: 'Confirmadas', value: relatorio.por_status.confirmadas, variant: 'green' as const },
              { label: 'Concluídas', value: relatorio.por_status.concluidas, variant: 'gray' as const },
              { label: 'Canceladas', value: relatorio.por_status.canceladas, variant: 'red' as const },
            ].map(({ label, value, variant }) => (
              <div key={label} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <span className="mt-1 inline-block"><Badge variant={variant}>{label}</Badge></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Gerenciar Médicos', desc: 'Cadastrar e editar médicos', href: '/admin/medicos', icon: <Stethoscope size={20} /> },
          { label: 'Gerenciar Pacientes', desc: 'Ver e editar dados de pacientes', href: '/admin/pacientes', icon: <Users size={20} /> },
          { label: 'Consultas', desc: 'Listar e cancelar consultas', href: '/admin/consultas', icon: <ClipboardList size={20} /> },
          { label: 'Relatórios', desc: 'Análises e métricas do sistema', href: '/admin/relatorios', icon: <TrendingUp size={20} /> },
        ].map((item) => (
          <Link key={item.href} to={item.href}>
            <Card className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
