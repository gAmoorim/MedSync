const knex = require('../connection')

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

const queryAgendarConsultaAtomica = async (pacienteId, medicoId, horarioId, data, hora_inicio, intervalo_minutos, observacoes) => {
    const [h, m] = hora_inicio.split(':').map(Number)
    const totalMinutos = h * 60 + m + intervalo_minutos
    const hora_fim = `${String(Math.floor(totalMinutos / 60)).padStart(2, '0')}:${String(totalMinutos % 60).padStart(2, '0')}`

    return await knex.transaction(async (trx) => {
        const chavesBloqueio = [
            `medico:${medicoId}:${data}:${hora_inicio}`,
            `paciente:${pacienteId}:${data}:${hora_inicio}`
        ].sort()

        for (const chave of chavesBloqueio) {
            await trx.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [chave])
        }

        const pacienteOcupado = await trx('consultas')
            .where('paciente_id', pacienteId)
            .where('data', data)
            .where('hora_inicio', hora_inicio)
            .whereIn('status', ['agendada', 'confirmada'])
            .first()

        if (pacienteOcupado) return { conflito: 'paciente' }

        const slotOcupado = await trx('consultas')
            .where('medico_id', medicoId)
            .where('data', data)
            .where('hora_inicio', hora_inicio)
            .whereIn('status', ['agendada', 'confirmada'])
            .first()

        if (slotOcupado) return { conflito: 'slot' }

        const [consulta] = await trx('consultas')
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

        return { consulta }
    })
}

const queryBuscarConsultaPeloId = async (consulta_id) => {
    return await knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('usuarios as um', 'm.usuario_id', 'um.id')
        .join('pacientes as p', 'c.paciente_id', 'p.id')
        .join('usuarios as up', 'p.usuario_id', 'up.id')
        .where('c.id', consulta_id)
        .select(
            'c.id',
            'c.paciente_id',
            'c.medico_id',
            'c.data',
            'c.hora_inicio',
            'c.status',
            'um.nome as medico_nome',
            'um.email as medico_email',
            'up.nome as paciente_nome',
            'up.email as paciente_email'
        )
        .first()
}

const queryCancelarConsulta = async (consulta_id) => {
    return await knex('consultas')
    .where({id: consulta_id})
    .update({ status: 'cancelada'})
}

const queryHistoricoConsultas = async (pacienteId, status, pagina, limite) => {
    const offset = (pagina - 1) * limite

    const query = knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('c.paciente_id', pacienteId)
        .select(
            'c.id as consulta_id',
            'u.nome as medico_nome',
            'e.nome as especialidade',
            'c.data',
            'c.hora_inicio',
            'c.status',
            'c.observacoes'
        )
        .orderBy('c.data', 'desc')
        .limit(limite)
        .offset(offset)

    if (status) {
        query.where('c.status', status)
    }

    return await query
}

const queryDetalheConsultaPaciente = async (consulta_id) => {
    return await knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('c.id', consulta_id)
        .select(
            'c.id as consulta_id',
            'u.nome as medico_nome',
            'e.nome as especialidade',
            'm.crm',
            'c.data',
            'c.hora_inicio as hora',
            'c.status',
            'c.observacoes',
            'c.anotacoes_medico'
        )
        .first()
}

const queryVerificarConsultasFuturasMedico = async (medico_id) => {
    const hoje = new Date().toISOString().split('T')[0]

    return await knex('consultas')
    .where('medico_id', medico_id)
    .where('data', '>=', hoje)
    .whereIn('status', ['agendada', 'confirmada'])
    .select('id', 'data', 'hora_inicio', 'status')
}

module.exports = {
    queryVerificarSlotDisponivel,
    queryVerificarConsultaPaciente,
    queryAgendarConsulta,
    queryAgendarConsultaAtomica,
    queryBuscarConsultaPeloId,
    queryCancelarConsulta,
    queryHistoricoConsultas,
    queryDetalheConsultaPaciente,
    queryVerificarConsultasFuturasMedico
}
