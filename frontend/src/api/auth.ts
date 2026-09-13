import api from './client'
import type { AuthResponse } from '../types'

export const login = async (email: string, senha: string): Promise<AuthResponse> => {
  const { data } = await api.post('/login', { email, senha })
  return data
}

export const registrarPaciente = async (dados: {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
  data_nascimento: string
}) => {
  const { data } = await api.post('/pacientes/registro', dados)
  return data
}
