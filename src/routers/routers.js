const express = require('express')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')
const { controllerCriarPaciente, controllerPerfilPaciente, controllerAtualizarPaciente, controllerAlterarSenhaPaciente, controllerHorariosDisponiveis, controllerAgendarConsulta, controllerCancelarConsultaPaciente, controllerHistoricoConsultasPaciente, controllerDetalheConsultaPaciente } = require('../controllers/controllerPaciente')
const { controllerAgendaMedica, controllerPacientesAgendadosMedico, controllerDetalheConsultaMedico, controllerConcluirConsulta, controllerConfirmarConsulta, controllerDefinirHorario, controllerListarHorariosMedico, controllerAtualizarHorario, controllerDeletarHorario, controllerPerfilMedico, controllerAtualizarPerfilMedico } = require('../controllers/controllerMedico')
const { controllerCadastrarMedico, controllerListarMedicos, controllerDetalheMedico, controllerAtualizarMedico, controllerInativarMedico, controllerListarPacientes, controllerDetalhePaciente, controllerAtualizarPacienteAdmin, controllerListarConsultasAdmin, controllerCancelarConsultaAdmin, controllerRelatorioConsultas, controllerRelatorioMedicos } = require('../controllers/controllerAdministrador')
const { controllerSolicitarRecuperacao, controllerResetarSenha } = require('../controllers/controllerRecuperarSenha')
const { controllerListarEspecialidades } = require('../controllers/controllerEspecialidade')

const auth = require('../middlewares/auth')
const authAdm = require('../middlewares/authAdm')
const authPaciente = require('../middlewares/authPaciente')
const authMedico = require('../middlewares/authMedico')

const routers = express()

routers.post('/login', controllerLoginUsuario)

//rotas direcionadas a pacientes
routers.post('/pacientes/registro', controllerCriarPaciente)
routers.get('/pacientes/perfil', auth, authPaciente, controllerPerfilPaciente)
routers.put('/pacientes/perfil', auth, authPaciente, controllerAtualizarPaciente)
routers.put('/pacientes/senha', auth, authPaciente, controllerAlterarSenhaPaciente)
routers.get('/pacientes/horarios-disponiveis', auth, authPaciente, controllerHorariosDisponiveis)
routers.post('/pacientes/consultas', auth, authPaciente, controllerAgendarConsulta)
routers.put('/pacientes/consultas/:consulta_id/cancelar', auth, authPaciente, controllerCancelarConsultaPaciente)
routers.get('/pacientes/consultas', auth, authPaciente, controllerHistoricoConsultasPaciente)
routers.get('/pacientes/consultas/:consulta_id', auth, authPaciente, controllerDetalheConsultaPaciente)

//rotas direcionadas a medicos
routers.get('/medicos/agenda', auth, authMedico, controllerAgendaMedica)
routers.get('/medicos/consultas', auth, authMedico, controllerPacientesAgendadosMedico)
routers.get('/medicos/consultas/:consulta_id', auth, authMedico, controllerDetalheConsultaMedico)
routers.put('/medicos/consultas/:consulta_id/concluir', auth, authMedico, controllerConcluirConsulta )
routers.put('/medicos/consultas/:consulta_id/confirmar', auth, authMedico, controllerConfirmarConsulta)
routers.post('/medicos/horarios', auth, authMedico, controllerDefinirHorario)
routers.get('/medicos/horarios', auth, authMedico, controllerListarHorariosMedico)
routers.put('/medicos/horarios/:horario_id', auth, authMedico, controllerAtualizarHorario)
routers.delete('/medicos/horarios/:horario_id', auth, authMedico, controllerDeletarHorario)
routers.get('/medicos/perfil',auth, authMedico, controllerPerfilMedico)
routers.put('/medicos/perfil', auth, authMedico, controllerAtualizarPerfilMedico)

//rotas direcionadas a adm
routers.get('/especialidades', auth, authAdm, controllerListarEspecialidades)
routers.post('/admin/medicos', auth, authAdm, controllerCadastrarMedico)
routers.get('/admin/medicos', auth, authAdm, controllerListarMedicos)
routers.get('/admin/medicos/:medico_id', auth, authAdm, controllerDetalheMedico)
routers.put('/admin/medicos/:medico_id', auth, authAdm, controllerAtualizarMedico)
routers.put('/admin/medicos/:medico_id/inativar', auth, authAdm, controllerInativarMedico)
routers.get('/admin/pacientes', auth, authAdm, controllerListarPacientes)
routers.get('/admin/pacientes/:paciente_id', auth, authAdm, controllerDetalhePaciente)
routers.put('/admin/pacientes/:paciente_id', auth, authAdm, controllerAtualizarPacienteAdmin)
routers.get('/admin/consultas', auth, authAdm, controllerListarConsultasAdmin)
routers.put('/admin/consultas/:consulta_id/cancelar', auth, authAdm, controllerCancelarConsultaAdmin)
routers.get('/admin/relatorios/consultas', auth, authAdm, controllerRelatorioConsultas)
routers.get('/admin/relatorios/medicos', auth, authAdm, controllerRelatorioMedicos)

//rotas direcionadas a recuperar senha
routers.post('/recuperar-senha', controllerSolicitarRecuperacao)
routers.post('/resetar-senha', controllerResetarSenha)

module.exports = routers
