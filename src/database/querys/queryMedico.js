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
            'c.atualizado_em',
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

const queryConfirmarConsulta = async (consulta_id) => {
    return await knex('consultas')
    .where({id: consulta_id})
    .update({ status: 'confirmada', atualizado_em: new Date()})
    .returning(['id', 'status', 'atualizado_em'])
}

const queryVerificarConflitoHorario = async (medicoId, dia_semana, hora_inicio, hora_fim) => {
    return await knex('horarios_atendimento')
    .where('medico_id', medicoId)
    .where('dia_semana', dia_semana)
    .where('ativo', true)
    .where(function () {
        this.whereBetween('hora_inicio', [hora_inicio, hora_fim])
            .orWhereBetween('hora_fim', [hora_inicio, hora_fim])
            .orWhere(function () {
                this.where('hora_inicio' ,'<=', hora_inicio)
                    .andWhere('hora_fim', '>=', hora_fim)
            })    
    })
    .first()
}

const queryDefinirHorarios = async (medicoId, dias_semana, hora_inicio, hora_fim, intervalo_minutos, data_inicio_vigencia, data_fim_vigencia) => {
    const inserts = dias_semana.map(dia => ({
        medico_id: medicoId,
        dia_semana: dia,
        hora_inicio,
        hora_fim,
        intervalo_minutos,
        data_inicio_vigencia,
        data_fim_vigencia
    }))

    return await knex('horarios_atendimento')
        .insert(inserts)
        .returning(['id', 'dia_semana', 'hora_inicio', 'hora_fim', 'intervalo_minutos', 'data_inicio_vigencia', 'data_fim_vigencia'])
}

const queryListarHorariosMedico = async (medicoId) => {
    return await knex('horarios_atendimento')
        .where('medico_id', medicoId)
        .select(
            'id as horario_id',
            'dia_semana',
            'hora_inicio',
            'hora_fim',
            'intervalo_minutos',
            'ativo',
            'data_inicio_vigencia',
            'data_fim_vigencia'
        )
        .orderBy('dia_semana', 'asc')
}

const queryBuscarHorarioMedico = async (horario_id) => {
    return await knex('horarios_atendimento')
    .where('id', horario_id)
    .returning('*')
    .first()
}

const queryVerificarConsultasNoHorario = async (horario_id) => {
    return await knex('consultas')
    .where('horario_atendimento_id', horario_id)
    .whereIn('status', ['agendada', 'confirmada'])
    .select('id', 'data', 'hora_inicio', 'status')
}

const queryAtualizarHorario = async (horario_id, hora_inicio, hora_fim, intervalo_minutos, ativo, data_fim_vigencia) => {
    return await knex('horarios_atendimento')
    .where({id: horario_id})
    .update({hora_inicio, hora_fim, intervalo_minutos, ativo, data_fim_vigencia})
    .returning('*')
}

const queryInativarHorario = async (horario_id) => {
    await knex('horarios_atendimento')
    .where({ id: horario_id })
    .update({ ativo: false })
}

module.exports = {
    queryAgendaMedico,
    queryBuscarMedicoPorUsuarioId,
    queryPacientesAgendadosMedico,
    queryDetalheConsultaMedico,
    queryConcluirConsulta,
    queryConfirmarConsulta,
    queryVerificarConflitoHorario,
    queryDefinirHorarios,
    queryListarHorariosMedico,
    queryBuscarHorarioMedico,
    queryVerificarConsultasNoHorario,
    queryAtualizarHorario,
    queryInativarHorario
}