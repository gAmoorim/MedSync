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

const queryVerificarSlotDisponivel = async (medicoId, data, horario) => {
    return await knex('consultas')
    .where('medico_id', medicoId)
    .where('data', data)
    .where('hora_inicio', horario)
    .whereIn('status', ['agendada', 'confirmada'])
    .first()
}

const queryVerificarConsultaPaciente = async (pacienteId, data, horario) => {
    return await knex('consultas')
    .where('paciente_id', pacienteId)
    .where('data', data)
    .where('hora_inicio', horario)
    .whereIn('status', ['agendada', 'confirmada'])
    .first()
}

const queryAgendarConsulta = async (pacienteId, medicoId, horarioId, data, hora_inicio, intervalo_minutos, observacoes) => {
    const [h, m] = hora_inicio.split(':').map(Number)
    const totalMinutos = h * 60 + m + intervalo_minutos
    const hora_fim = `${String(Math.floor(totalMinutos / 60)).padStart(2, '0')}:${String(totalMinutos % 60).padStart(2, '0')}`

    return await knex('consultas')
        .insert({
            paciente_id: pacienteId,
            medico_id: medicoId,
            horario_atendimento_id: horarioId,
            data,
            hora_inicio,
            hora_fim,
            status: 'agendada',
            observacoes
        })
        .returning(['id', 'paciente_id', 'medico_id', 'data', 'hora_inicio', 'hora_fim', 'status', 'observacoes'])
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
    queryVerificarSlotDisponivel,
    queryVerificarConsultaPaciente,
    queryAgendarConsulta,
    queryBuscarPacientePorUsuarioId
}