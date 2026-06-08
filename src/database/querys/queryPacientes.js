const knex = require('../connection')

const queryBuscarPacientePeloCpf = async (cpf) => {
    return await knex('pacientes')
    .where({cpf})
    .first()
}

const queryBuscarPacientePeloId = async (pacienteId) => {
    return await knex('pacientes')
    .where({id: pacienteId})
    .first()
}

const queryPerfilPaciente = async (pacienteId) => {
    const [paciente] = await knex('usuarios')
        .join('pacientes', 'usuarios.id', 'pacientes.usuario_id')
        .where('usuarios.id', pacienteId)
        .select(
            'usuarios.nome',
            'usuarios.email',
            'pacientes.telefone',
            'pacientes.data_nascimento',
            'pacientes.cpf'
        )

    return paciente
}

const queryAtualizarPaciente = async (pacienteId, nome, telefone, data_nascimento) => {
    return await knex.transaction(async (trx) => {
        const [usuario] = await trx('usuarios')
            .where('id', pacienteId)
            .update({ nome })
            .returning(['id', 'nome', 'email'])

        const [paciente] = await trx('pacientes')
            .where('usuario_id', pacienteId)
            .update({ telefone, data_nascimento})
            .returning(['telefone', 'data_nascimento'])

        return {...usuario, ...paciente}
    })
}

const queryBuscarSenhaAtualPaciente = async (pacienteId) => {
    return await knex('usuarios')
    .where({ id: pacienteId })
    .select('senha_hash')
    .first()
}

const queryAtualizarSenhaPaciente = async (pacienteId, novaSenhaCriptografada) => {
    return await knex('usuarios')
    .where({id: pacienteId})
    .update({senha_hash: novaSenhaCriptografada})
}

module.exports = {
    queryBuscarPacientePeloCpf,
    queryPerfilPaciente,
    queryAtualizarPaciente,
    queryBuscarPacientePeloId,
    queryBuscarSenhaAtualPaciente,
    queryAtualizarSenhaPaciente
}