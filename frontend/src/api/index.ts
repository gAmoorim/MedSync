import api from './client'
import type {
  AuthResponse, Consulta, HorarioAtendimento, HorarioDisponivel,
  Medico, Paciente, RelatorioConsultas, RelatorioMedico
} from '../types'

/* ── AUTH ─────────────────────────────────────────────────── */
export const login = async (email: string, senha: string): Promise<AuthResponse> =>
  (await api.post('/login', { email, senha })).data

export const registrarPaciente = async (d: {
  nome: string; email: string; senha: string
  cpf: string; telefone: string; data_nascimento: string
}) => (await api.post('/pacientes/registro', d)).data

export const solicitarRecuperacao = async (email: string) =>
  (await api.post('/recuperar-senha', { email })).data

export const resetarSenha = async (d: { token: string; nova_senha: string; confirmar_nova_senha: string }) =>
  (await api.post('/resetar-senha', d)).data

/* ── PACIENTE ─────────────────────────────────────────────── */
export const getPacientePerfil = async (): Promise<Paciente> =>
  (await api.get('/pacientes/perfil')).data.paciente

export const atualizarPacientePerfil = async (d: Partial<Paciente>) =>
  (await api.put('/pacientes/perfil', d)).data

export const alterarSenhaPaciente = async (d: { senha_atual: string; nova_senha: string; confirmar_nova_senha: string }) =>
  (await api.put('/pacientes/senha', d)).data

export const getHorariosDisponiveis = async (p: { data: string; especialidade?: string; medico_id?: number }): Promise<HorarioDisponivel[]> =>
  (await api.get('/pacientes/horarios-disponiveis', { params: p })).data.horarios

export const agendarConsulta = async (horario_id: number, data: string, hora_inicio: string, observacoes?: string) =>
  (await api.post(`/pacientes/consultas?data=${data}&hora_inicio=${hora_inicio}`, { horario_id, observacoes })).data

export const cancelarConsultaPaciente = async (id: number) =>
  (await api.put(`/pacientes/consultas/${id}/cancelar`)).data

export const getConsultasPaciente = async (p?: { status?: string; pagina?: number; limite?: number }): Promise<Consulta[]> =>
  (await api.get('/pacientes/consultas', { params: p })).data.consultas

export const getDetalheConsultaPaciente = async (id: number): Promise<Consulta> =>
  (await api.get(`/pacientes/consultas/${id}`)).data.consulta

/* ── MÉDICO ───────────────────────────────────────────────── */
export const getMedicoPerfil = async (): Promise<Medico> =>
  (await api.get('/medicos/perfil')).data.medico

export const atualizarMedicoPerfil = async (d: { nome?: string; telefone?: string }) =>
  (await api.put('/medicos/perfil', d)).data

export const getAgendaMedico = async (data_inicio: string, data_fim: string): Promise<Consulta[]> =>
  (await api.get('/medicos/agenda', { params: { data_inicio, data_fim } })).data.consultas

export const getConsultasMedico = async (p?: { data?: string; status?: string; pagina?: number; limite?: number }): Promise<Consulta[]> =>
  (await api.get('/medicos/consultas', { params: p })).data.consultas

export const getDetalheConsultaMedico = async (id: number): Promise<Consulta> =>
  (await api.get(`/medicos/consultas/${id}`)).data.consulta

export const confirmarConsulta = async (id: number) =>
  (await api.put(`/medicos/consultas/${id}/confirmar`)).data

export const concluirConsulta = async (id: number, anotacoes?: string) =>
  (await api.put(`/medicos/consultas/${id}/concluir`, { anotacoes_medico: anotacoes })).data

export const getHorariosMedico = async (): Promise<HorarioAtendimento[]> =>
  (await api.get('/medicos/horarios')).data.horarios

export const criarHorarios = async (d: {
  dias_semana: number[]; hora_inicio: string; hora_fim: string
  intervalo_minutos: number; data_inicio_vigencia: string; data_fim_vigencia?: string
}) => (await api.post('/medicos/horarios', d)).data

export const inativarHorario = async (id: number) =>
  (await api.delete(`/medicos/horarios/${id}`)).data

/* ── ADMIN ────────────────────────────────────────────────── */
export const adminGetMedicos = async (p?: { especialidade?: string; ativo?: boolean; pagina?: number; limite?: number }): Promise<Medico[]> =>
  (await api.get('/admin/medicos', { params: p })).data.medicos

export const adminCadastrarMedico = async (d: {
  nome: string; email: string; senha: string; crm: string; especialidade_id: number; telefone: string
}) => (await api.post('/admin/medicos', d)).data

export const adminInativarMedico = async (id: number) =>
  (await api.put(`/admin/medicos/${id}/inativar`)).data

export const adminGetPacientes = async (p?: { nome?: string; cpf?: string; pagina?: number; limite?: number }): Promise<Paciente[]> =>
  (await api.get('/admin/pacientes', { params: p })).data.pacientes

export const adminGetConsultas = async (p?: {
  status?: string; medico_id?: number; paciente_id?: number
  data_inicio?: string; data_fim?: string; pagina?: number; limite?: number
}): Promise<Consulta[]> =>
  (await api.get('/admin/consultas', { params: p })).data.consultas

export const adminCancelarConsulta = async (id: number, motivo_cancelamento: string) =>
  (await api.put(`/admin/consultas/${id}/cancelar`, { motivo_cancelamento })).data

export const adminGetRelatorioConsultas = async (mes: string): Promise<RelatorioConsultas> =>
  (await api.get('/admin/relatorios/consultas', { params: { mes } })).data.relatorio

export const adminGetRelatorioMedicos = async (mes: string): Promise<RelatorioMedico[]> =>
  (await api.get('/admin/relatorios/medicos', { params: { mes } })).data.relatorio

export const getEspecialidades = async () =>
  (await api.get('/especialidades')).data.especialidades ?? []
