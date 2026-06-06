const knex = require('../connection')

const queryBuscarUsuarioPeloEmail = async (emailFormatado) => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'senha_hash', 'tipo')
    .where({ email: emailFormatado})
    .first()
}

const queryBuscarUsuarioPeloId = async (usuarioId) => {
    return await knex('usuarios')
    .select('id', 'nome', 'email', 'tipo', 'criado_em')
    .where({id: usuarioId})
    .first()
}
                                
const queryCriarPaciente = async (nome, emailFormatado, senha_hash, telefone, data_nascimento, cpf) => {
    return await knex.transaction(async (trx) => {
        const [usuario] = await trx('usuarios')
            .insert({ nome, email: emailFormatado, senha_hash, tipo: 'paciente' })
            .returning(['id', 'nome', 'email', 'tipo'])

        const usuario_id = usuario.id;

        await trx('pacientes')
            .insert({ usuario_id, cpf, telefone, data_nascimento })

            return usuario
    })
}

module.exports = {
    queryBuscarUsuarioPeloId,
    queryBuscarUsuarioPeloEmail,
    queryCriarPaciente
}