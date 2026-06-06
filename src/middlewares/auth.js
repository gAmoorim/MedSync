require('dotenv').config()
const jwt = require('jsonwebtoken')
const { queryBuscarUsuarioPeloId } = require('../database/querys/queryUsuarios')
const senhaJWT = process.env.JWT_PWD

const auth = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'Não autorizado'})
    }

    try {
        const [tipo, token] = authorization.split(' ')

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Formato do token inválido ou Ausente'})
        }

        if (!process.env.JWT_PWD) {
            throw new Error('JWT_PWD não definido')
        }

        const {id} = jwt.verify(token, senhaJWT)

        const usuarioExistente = await queryBuscarUsuarioPeloId(id)

        if (!usuarioExistente) {
            return res.status(401).json({ error: 'Usuário não encontrado'})
        }

        req.usuario = {
            id: usuarioExistente.id,
            tipo: usuarioExistente.tipo
        }

        next()
    } catch (error) {
        console.error("Erro na autenticação:", error.message)
        return res.status(401).json({ error: 'Token inválido ou expirado'})
    }
}

module.exports = auth