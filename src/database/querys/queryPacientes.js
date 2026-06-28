const knex = require('../connection')

const queryBuscarPacientePeloCpf = async (cpf) => {
    return await knex('pacientes')
    .where({cpf})
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

const queryVerificarHorario = async (horario_id) => {
    return await knex('horarios_atendimento as h')
        .join('medicos as m', 'h.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .where('h.id', horario_id)
        .where('h.ativo', true)
        .where('u.ativo', true)
        .select('h.id', 'h.medico_id', 'h.hora_inicio', 'h.hora_fim', 'h.dia_semana', 'h.intervalo_minutos')
        .first()
}

const queryBuscarPacientePorUsuarioId = async (usuarioId) => {
    return await knex('pacientes')
        .where('usuario_id', usuarioId)
        .select('id')
        .first()
}

module.exports = {
    queryBuscarPacientePeloCpf,
    queryPerfilPaciente,
    queryAtualizarPaciente,
    queryBuscarSenhaAtualPaciente,
    queryAtualizarSenhaPaciente,
    queryVerificarHorario,
    queryBuscarPacientePorUsuarioId
}