import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { getPacientes } from '../../api/admin'
import { Card, Loading, EmptyState, ErrorState, Badge, Table } from '../../components/ui'
import { formatCPF, formatDate } from '../../utils'
import type { Paciente } from '../../types'

export default function AdminPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  const fetchPacientes = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getPacientes({ limite: 100 })
      setPacientes(res ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPacientes() }, [fetchPacientes])

  const filtered = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
        <p className="text-slate-500 mt-1">{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} cadastrado{pacientes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Buscar por nome, CPF ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={fetchPacientes} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum paciente encontrado" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table
            columns={[
              {
                key: 'nome',
                label: 'Paciente',
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                      {p.nome?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.nome}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'cpf',
                label: 'CPF',
                render: (p) => <span className="font-mono text-xs">{p.cpf ? formatCPF(p.cpf) : '-'}</span>,
              },
              { key: 'telefone', label: 'Telefone' },
              {
                key: 'data_nascimento',
                label: 'Nascimento',
                render: (p) => formatDate(p.data_nascimento),
              },
              {
                key: 'ativo',
                label: 'Status',
                render: (p) => (
                  <Badge variant={p.ativo !== false ? 'green' : 'gray'}>
                    {p.ativo !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                ),
              },
            ]}
            data={filtered}
            keyExtractor={(p) => p.id}
          />
        </Card>
      )}
    </div>
  )
}
