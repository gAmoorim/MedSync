const authMedico = (req, res, next) => {
    if (req.usuario.tipo !== 'medico') {
        return res.status(403).json({ error: 'Acesso permitido apenas para médicos' })
    }
    next()
}

module.exports = authMedico