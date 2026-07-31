const authAdm = (req, res, next) => {
    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acesso permitido apenas para Administrador' })
    }
    next()
}

module.exports = authAdm