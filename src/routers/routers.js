const express = require('express')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')
const { controllerCriarPaciente, controllerPerfilPaciente, controllerAtualizarPaciente, controllerAlterarSenhaPaciente } = require('../controllers/controllerPaciente')

const auth = require('../middlewares/auth')

const routers = express()

routers.post('/login', controllerLoginUsuario)

//rotas direcionadas a paciente
routers.post('/pacientes/registro', controllerCriarPaciente)
routers.get('/pacientes/perfil', auth, controllerPerfilPaciente)
routers.put('/pacientes/perfil', auth, controllerAtualizarPaciente)
routers.put('/pacientes/senha', auth, controllerAlterarSenhaPaciente)

module.exports = routers