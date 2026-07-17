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

const queryDetalheConsultaMedico = async (consulta_id) => {
    return await knex('consultas as c')
        .join('pacientes as p', 'c.paciente_id', 'p.id')
        .join('usuarios as u', 'p.usuario_id', 'u.id')
        .where('c.id', consulta_id)
        .select(
            'c.id as consulta_id',
            'u.nome as paciente_nome',
            'p.cpf as paciente_cpf',
            'p.data_nascimento as paciente_data_nascimento',
            'p.telefone as paciente_telefone',
            'c.data',
            'c.hora_inicio as hora',
            'c.status',
            'c.observacoes',
            'c.anotacoes_medico',
            'c.medico_id'
        )
        .first()
}

const queryConcluirConsulta = async (consulta_id, anotacoes_medico) => {
    return await knex('consultas')
    .where({id: consulta_id})
    .update({ status: 'concluida', anotacoes_medico, data_hora_conclusao: new Date() })
    .returning(['id', 'status', 'anotacoes_medico', 'data_hora_conclusao'])
}

module.exports = {
    queryAgendaMedico,
    queryBuscarMedicoPorUsuarioId,
    queryPacientesAgendadosMedico,
    queryDetalheConsultaMedico,
    queryConcluirConsulta
}