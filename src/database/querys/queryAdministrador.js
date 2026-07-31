const knex = require('../connection')

const queryBuscarMedicoPorCRM = async (crm) => {
    return await knex('medicos')
    .where({crm})
    .first()
}

const queryCadastrarMedico = async (nome, emailFormatado, senha_hash, crm, especialidade_id, telefone) => {
    return await knex.transaction(async (trx) => {
        const [usuario] = await trx('usuarios')
        .insert({ nome, email: emailFormatado, senha_hash, tipo: 'medico' })
        .returning(['id', 'nome', 'email', 'tipo'])

        const [medico] = await trx('medicos')
        .insert({ usuario_id: usuario.id, especialidade_id, crm, telefone })
        .returning(['id', 'crm', 'especialidade_id', 'telefone'])

        return { ...usuario, ...medico }
    })
}

module.exports = {
    queryBuscarMedicoPorCRM,
    queryCadastrarMedico
}