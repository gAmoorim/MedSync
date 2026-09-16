const crypto = require('crypto')
const bcrypt = require('bcrypt')
const knex = require('../database/connection')
const { queryBuscarUsuarioPeloEmail } = require('../database/querys/queryUsuarios')
const { queryCriarTokenRecuperacao, queryBuscarTokenValido, queryMarcarTokenComoUsado } = require('../database/querys/queryRecuperarSenha')
const { emailRecuperacaoSenha } = require('../services/emailService')

const controllerSolicitarRecuperacao = async (req ,res) => {
    const {email} = req.body

    if (!email) {
        return res.status(400).json({ error: 'Email obrigatório'})
    }

    try {
        const usuario = await queryBuscarUsuarioPeloEmail(email)

        if (!usuario) {
            return res.status(200).json({ mensagem: 'Se este email estiver cadastrado, você receberá as instruções em breve.'})
        }

        const token = crypto.randomBytes(32).toString('hex')

        await queryCriarTokenRecuperacao(usuario.id, token)

        await emailRecuperacaoSenha(usuario.email, {
            nome: usuario.nome,
            link: `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`
        })

        return res.status(200).json({ mensagem: 'Se este email estiver cadastrado, você receberá as instruções em breve.'})
    } catch (error) {
        console.error('Erro ao solicitar recuperação:', error)
        return res.status(500).json({ error: `Erro ao solicitar recuperação: ${error.message}`})
    }
}

const controllerResetarSenha = async (req, res) => {
    const { token, nova_senha, confirmar_nova_senha} = req.body

    if (!token || !nova_senha || !confirmar_nova_senha) {
        return res.status(400).json({ error: 'Preencha todos os campos'})
    }

    if (nova_senha !== confirmar_nova_senha) {
        return res.status(400).json({ error: 'As senhas não conferem'})
    }

    if (nova_senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres'})
    }

    try {
        const tokenValido = await queryBuscarTokenValido(token)

        if (!tokenValido) {
            return res.status(400).json({ error: 'Token inválido ou expirado'})
        }

        const senha_hash = await bcrypt.hash(nova_senha, 10)

        await knex('usuarios')
        .where({ id: tokenValido.usuario_id})
        .update({ senha_hash})

        await queryMarcarTokenComoUsado(token)

        return res.status(200).json({ mensagem: 'Senha alterada com sucesso!'})
    } catch (error) {
        console.error('Erro ao resetar senha:', error)
        return res.status(500).json({ error: `Erro ao resetar senha: ${error.message}` })
    }
}

module.exports = { 
    controllerSolicitarRecuperacao,
    controllerResetarSenha
}
