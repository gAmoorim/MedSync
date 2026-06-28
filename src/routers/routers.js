const express = require('express')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')
const { controllerCriarPaciente, controllerPerfilPaciente, controllerAtualizarPaciente, controllerAlterarSenhaPaciente, controllerHorariosDisponiveis, controllerAgendarConsulta, controllerCancelarConsultaPaciente } = require('../controllers/controllerPaciente')

const auth = require('../middlewares/auth')

const routers = express()

routers.post('/login', controllerLoginUsuario)

//rotas direcionadas a pacientes
routers.post('/pacientes/registro', controllerCriarPaciente)
routers.get('/pacientes/perfil', auth, controllerPerfilPaciente)
routers.put('/pacientes/perfil', auth, controllerAtualizarPaciente)
routers.put('/pacientes/senha', auth, controllerAlterarSenhaPaciente)
routers.get('/pacientes/horarios-disponiveis', auth, controllerHorariosDisponiveis)
routers.post('/pacientes/consultas', auth, controllerAgendarConsulta) //ENVIAR EMAIL CONFIRMANDO CONSULTA
routers.put('/pacientes/consultas/:consulta_id/cancelar', auth, controllerCancelarConsultaPaciente) // Enviar e-mail de confirmação de cancelamento ao paciente

module.exports = routers