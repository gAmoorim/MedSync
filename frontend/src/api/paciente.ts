import api from './client'
import type { Consulta, HorarioDisponivel, Paciente } from '../types'

export const getPerfil = async (): Promise<Paciente> => {
  const { data } = await api.get('/pacientes/perfil')
  return data.paciente
}

export const atualizarPerfil = async (dados: Partial<Paciente>) => {
  const { data } = await api.put('/pacientes/perfil', dados)
  return data
}

export const alterarSenha = async (dados: {
  senha_atual: string
  nova_senha: string
  confirmar_nova_senha: string
}) => {
  const { data } = await api.put('/pacientes/senha', dados)
  return data
}

export const getHorariosDisponiveis = async (params: {
  data: string
  especialidade?: string
  medico_id?: number
}): Promise<HorarioDisponivel[]> => {
  const { data } = await api.get('/pacientes/horarios-disponiveis', { params })
  return data.horarios
}

export const agendarConsulta = async (
  horario_id: number,
  data: string,
  hora_inicio: string,
  observacoes?: string
): Promise<Consulta> => {
  const { data: res } = await api.post(
    `/pacientes/consultas?data=${data}&hora_inicio=${hora_inicio}`,
    { horario_id, observacoes }
  )
  return res.consulta?.[0] ?? res.consulta
}

export const cancelarConsulta = async (consulta_id: number) => {
  const { data } = await api.put(`/pacientes/consultas/${consulta_id}/cancelar`)
  return data
}

export const getHistoricoConsultas = async (params: {
  status?: string
  pagina?: number
  limite?: number
}): Promise<Consulta[]> => {
  const { data } = await api.get('/pacientes/consultas', { params })
  return data.consultas
}

export const getDetalheConsulta = async (consulta_id: number): Promise<Consulta> => {
  const { data } = await api.get(`/pacientes/consultas/${consulta_id}`)
  return data.consulta
}
