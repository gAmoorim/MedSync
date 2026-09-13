import api from './client'
import type { Consulta, HorarioAtendimento, Medico } from '../types'

export const getPerfil = async (): Promise<Medico> => {
  const { data } = await api.get('/medicos/perfil')
  return data.medico
}

export const atualizarPerfil = async (dados: { nome?: string; telefone?: string }) => {
  const { data } = await api.put('/medicos/perfil', dados)
  return data
}

export const getAgenda = async (data_inicio: string, data_fim: string): Promise<Consulta[]> => {
  const { data } = await api.get('/medicos/agenda', { params: { data_inicio, data_fim } })
  return data.consultas
}

export const getConsultas = async (params: {
  data?: string
  status?: string
  pagina?: number
  limite?: number
}): Promise<Consulta[]> => {
  const { data } = await api.get('/medicos/consultas', { params })
  return data.consultas
}

export const getDetalheConsulta = async (consulta_id: number): Promise<Consulta> => {
  const { data } = await api.get(`/medicos/consultas/${consulta_id}`)
  return data.consulta
}

export const confirmarConsulta = async (consulta_id: number) => {
  const { data } = await api.put(`/medicos/consultas/${consulta_id}/confirmar`)
  return data
}

export const concluirConsulta = async (consulta_id: number, anotacoes_medico?: string) => {
  const { data } = await api.put(`/medicos/consultas/${consulta_id}/concluir`, { anotacoes_medico })
  return data
}

export const getHorarios = async (): Promise<HorarioAtendimento[]> => {
  const { data } = await api.get('/medicos/horarios')
  return data.horarios
}

export const criarHorarios = async (dados: {
  dias_semana: number[]
  hora_inicio: string
  hora_fim: string
  intervalo_minutos: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
}) => {
  const { data } = await api.post('/medicos/horarios', dados)
  return data
}

export const atualizarHorario = async (horario_id: number, dados: Partial<HorarioAtendimento>) => {
  const { data } = await api.put(`/medicos/horarios/${horario_id}`, dados)
  return data
}

export const deletarHorario = async (horario_id: number) => {
  const { data } = await api.delete(`/medicos/horarios/${horario_id}`)
  return data
}
