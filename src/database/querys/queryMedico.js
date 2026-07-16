const knex = require('../connection')

const queryBuscarMedicoPorUsuarioId = async (usuarioId) => {
    return await knex('medicos')
    .where({usuario_id: usuarioId})
    .select('id')
    .first()
}

const queryAgendaMedico = async (medicoId, data_inicio, data_fim) => {
    return await knex('consultas as c')
        .join('pacientes as p', 'c.paciente_id', 'p.id')
        .join('usuarios as u', 'p.usuario_id', 'u.id')
        .where('c.medico_id', medicoId)
        .whereBetween('c.data', [data_inicio, data_fim])
        .select(
            'c.id as consulta_id',
            'u.nome as paciente_nome',
            'c.data',
            'c.hora_inicio',
            'c.hora_fim',
            'c.status',
            'c.observacoes'
        )
        .orderBy('c.data', 'asc')
        .orderBy('c.hora_inicio', 'asc')
}

const queryPacientesAgendadosMedico = async (medicoId, data, status, pagina, limite) => {
    const offset = (pagina - 1) * limite

    const query = knex('consultas as c')
        .join('pacientes as p', 'c.paciente_id', 'p.id')
        .join('usuarios as u', 'p.usuario_id', 'u.id')
        .where('c.medico_id', medicoId)
        .where('c.data', data)
        .select(
            'c.id as consulta_id',
            'u.nome as paciente_nome',
            'p.telefone as paciente_telefone',
            'c.data',
            'c.hora_inicio as hora',
            'c.status',
            'c.observacoes'
        )
        .orderBy('c.hora_inicio', 'asc')
        .limit(limite)
        .offset(offset)

    if (status) {
        query.where('c.status', status)
    }

    return await query
}

module.exports = {
    queryAgendaMedico,
    queryBuscarMedicoPorUsuarioId,
    queryPacientesAgendadosMedico
}