const express = require('express')
const { controllerLoginUsuario } = require('../controllers/controllerLogin')
const { controllerCriarPaciente, controllerPerfilPaciente } = require('../controllers/controllerPaciente')

const auth = require('../middlewares/auth')

const routers = express()

routers.post('/login', controllerLoginUsuario)

routers.post('/pacientes/registro', controllerCriarPaciente)
routers.get('/pacientes/perfil', auth, controllerPerfilPaciente)

module.exports = routers