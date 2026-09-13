export type TipoUsuario = 'paciente' | 'medico' | 'admin'

export type StatusConsulta = 'agendada' | 'confirmada' | 'concluida' | 'cancelada'

export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface Paciente {
  id: number
  usuario_id: number
  nome: string
  email: string
  cpf: string
  telefone: string
  data_nascimento: string
  ativo?: boolean
}

export interface Medico {
  id: number
  usuario_id: number
  nome: string
  email: string
  crm: string
  especialidade: string
  especialidade_id?: number
  telefone: string
  ativo?: boolean
}

export interface Especialidade {
  id: number
  nome: string
}

export interface HorarioDisponivel {
  horario_id: number
  medico_id: number
  medico_nome: string
  especialidade: string
  data: string
  hora_inicio: string
  hora_fim: string
}

export interface HorarioAtendimento {
  horario_id: number
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  intervalo_minutos: number
  ativo: boolean
  data_inicio_vigencia: string
  data_fim_vigencia: string | null
}

export interface Consulta {
  id?: number
  consulta_id?: number
  paciente_id?: number
  medico_id?: number
  paciente_nome?: string
  medico_nome?: string
  especialidade?: string
  crm?: string
  data: string
  hora?: string
  hora_inicio?: string
  hora_fim?: string
  status: StatusConsulta
  observacoes?: string | null
  anotacoes_medico?: string | null
  motivo_cancelamento?: string | null
}

export interface RelatorioConsultas {
  total: string
  por_status: {
    agendadas: string
    confirmadas: string
    concluidas: string
    canceladas: string
  }
  taxa_cancelamento: string
  por_especialidade: { especialidade: string; total: string }[]
  medico_mais_atendimentos: { medico_nome: string; total: string } | null
}

export interface RelatorioMedico {
  medico_id: number
  nome: string
  especialidade: string
  agendadas: string
  concluidas: string
  canceladas: string
  taxa_ocupacao: string
}

export interface PaginatedResponse<T> {
  mensagem: string
  dados?: T[]
  [key: string]: unknown
}

export interface ApiError {
  error: string
}

// Extended for doctor view
export interface ConsultaMedico extends Consulta {
  paciente_cpf?: string
  paciente_data_nascimento?: string
  paciente_telefone?: string
}
