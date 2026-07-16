const authPaciente = (req, res, next) => {
    if (req.usuario.tipo !== 'paciente') {
        return res.status(403).json({ error: 'Acesso permitido apenas para pacientes' })
    }
    next()
}

module.exports = authPaciente