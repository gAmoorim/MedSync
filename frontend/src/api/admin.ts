import api from './client'
import type { Consulta, Medico, Paciente, RelatorioConsultas, RelatorioMedico } from '../types'

type MedicoDaApi = Omit<Medico, 'id'> & { id?: number; medico_id?: number }
type PacienteDaApi = Omit<Paciente, 'id'> & { id?: number; paciente_id?: number }

const normalizarMedico = ({ medico_id, ...medico }: MedicoDaApi): Medico => ({
  ...medico,
  id: medico.id ?? medico_id!,
})

const normalizarPaciente = ({ paciente_id, ...paciente }: PacienteDaApi): Paciente => ({
  ...paciente,
  id: paciente.id ?? paciente_id!,
})

// Médicos
export const cadastrarMedico = async (dados: {
  nome: string
  email: string
  senha: string
  crm: string
  especialidade_id: number
  telefone: string
}) => {
  const { data } = await api.post('/admin/medicos', dados)
  return data
}

export const getMedicos = async (params?: {
  especialidade?: string
  ativo?: boolean
  pagina?: number
  limite?: number
}): Promise<Medico[]> => {
  const { data } = await api.get('/admin/medicos', { params })
  return data.medicos.map(normalizarMedico)
}

export const getDetalheMedico = async (medico_id: number) => {
  const { data } = await api.get(`/admin/medicos/${medico_id}`)
  return data.medico
}

export const atualizarMedico = async (medico_id: number, dados: Partial<Medico> & { especialidade_id?: number }) => {
  const { data } = await api.put(`/admin/medicos/${medico_id}`, dados)
  return data
}

export const inativarMedico = async (medico_id: number) => {
  const { data } = await api.put(`/admin/medicos/${medico_id}/inativar`)
  return data
}

// Pacientes
export const getPacientes = async (params?: {
  nome?: string
  cpf?: string
  pagina?: number
  limite?: number
}): Promise<Paciente[]> => {
  const { data } = await api.get('/admin/pacientes', { params })
  return data.pacientes.map(normalizarPaciente)
}

export const getDetalhePaciente = async (paciente_id: number) => {
  const { data } = await api.get(`/admin/pacientes/${paciente_id}`)
  return data.paciente
}

export const atualizarPaciente = async (paciente_id: number, dados: Partial<Paciente>) => {
  const { data } = await api.put(`/admin/pacientes/${paciente_id}`, dados)
  return data
}

// Consultas
export const getConsultas = async (params?: {
  status?: string
  medico_id?: number
  paciente_id?: number
  data_inicio?: string
  data_fim?: string
  pagina?: number
  limite?: number
}): Promise<Consulta[]> => {
  const { data } = await api.get('/admin/consultas', { params })
  return data.consultas
}

export const cancelarConsulta = async (consulta_id: number, motivo_cancelamento: string) => {
  const { data } = await api.put(`/admin/consultas/${consulta_id}/cancelar`, { motivo_cancelamento })
  return data
}

// Relatórios
export const getRelatorioConsultas = async (mes: string, medico_id?: number): Promise<RelatorioConsultas> => {
  const { data } = await api.get('/admin/relatorios/consultas', { params: { mes, medico_id } })
  return data.relatorio
}

export const getRelatorioMedicos = async (mes: string): Promise<RelatorioMedico[]> => {
  const { data } = await api.get('/admin/relatorios/medicos', { params: { mes } })
  return data.relatorio
}
