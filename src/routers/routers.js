const express = require('express')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')
const { controllerCriarPaciente, controllerPerfilPaciente, controllerAtualizarPaciente, controllerAlterarSenhaPaciente, controllerHorariosDisponiveis, controllerAgendarConsulta, controllerCancelarConsultaPaciente, controllerHistoricoConsultasPaciente, controllerDetalheConsultaPaciente } = require('../controllers/controllerPaciente')
const { controllerAgendaMedica, controllerPacientesAgendadosMedico, controllerDetalheConsultaMedico, controllerConcluirConsulta, controllerConfirmarConsulta, controllerDefinirHorario, controllerListarHorariosMedico, controllerAtualizarHorario, controllerDeletarHorario, controllerPerfilMedico, controllerAtualizarPerfilMedico } = require('../controllers/controllerMedico')
const { controllerCadastrarMedico, controllerListarMedicos, controllerDetalheMedico, controllerAtualizarMedico, controllerInativarMedico } = require('../controllers/controllerAdministrador')

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
routers.post('/pacientes/consultas', auth, authPaciente, controllerAgendarConsulta) //ENVIAR EMAIL CONFIRMANDO CONSULTA
routers.put('/pacientes/consultas/:consulta_id/cancelar', auth, authPaciente, controllerCancelarConsultaPaciente) // Enviar e-mail de confirmação de cancelamento ao paciente
routers.get('/pacientes/consultas', auth, authPaciente, controllerHistoricoConsultasPaciente)
routers.get('/pacientes/consultas/:consulta_id', auth, authPaciente, controllerDetalheConsultaPaciente)

//rotas direcionadas a medicos
routers.get('/medicos/agenda', auth, authMedico, controllerAgendaMedica)
routers.get('/medicos/consultas', auth, authMedico, controllerPacientesAgendadosMedico)
routers.get('/medicos/consultas/:consulta_id', auth, authMedico, controllerDetalheConsultaMedico)
routers.put('/medicos/consultas/:consulta_id/concluir', auth, authMedico, controllerConcluirConsulta )
routers.put('/medicos/consultas/:consulta_id/confirmar', auth, authMedico, controllerConfirmarConsulta) // enviar email de confirmação ao paciente
routers.post('/medicos/horarios', auth, authMedico, controllerDefinirHorario)
routers.get('/medicos/horarios', auth, authMedico, controllerListarHorariosMedico)
routers.put('/medicos/horarios/:horario_id', auth, authMedico, controllerAtualizarHorario)
routers.delete('/medicos/horarios/:horario_id', auth, authMedico, controllerDeletarHorario)
routers.get('/medicos/perfil',auth, authMedico, controllerPerfilMedico)
routers.put('/medicos/perfil', auth, authMedico, controllerAtualizarPerfilMedico)

//rotas direcionadas a adm
routers.post('/admin/medicos', auth, authAdm, controllerCadastrarMedico)
routers.get('/admin/medicos', auth, authAdm, controllerListarMedicos)
routers.get('/admin/medicos/:medico_id', auth, authAdm, controllerDetalheMedico)
routers.put('/admin/medicos/:medico_id', auth, authAdm, controllerAtualizarMedico)
routers.put('/admin/medicos/:medico_id/inativar', auth, authAdm, controllerInativarMedico)

module.exports = routers