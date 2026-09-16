const knex = require('../connection')

const queryBuscarTokenValido = async (token) => {
    return await knex('tokens_recuperacao')
    .where({ token, usado: false})
    .where('expira_em', '>', new Date())
    .first()
}

const queryCriarTokenRecuperacao = async (usuario_id, token) =>{
    const expira_em = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await knex('tokens_recuperacao')
    .where({ usuario_id, usado: false})
    .update({ usado: true}) // invalida tokens anteriores

    await knex('tokens_recuperacao')
    .insert({ usuario_id, token, expira_em})
}

const queryMarcarTokenComoUsado = async (token) => {
    await knex('tokens_recuperacao')
    .where({ token})
    .update({ usado: true})
}

module.exports = {
    queryBuscarTokenValido,
    queryCriarTokenRecuperacao,
    queryMarcarTokenComoUsado
}