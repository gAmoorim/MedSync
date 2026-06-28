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

const queryBuscarConsultaPeloId = async (consulta_id) => {
    return await knex('consultas')
    .where({id: consulta_id})
    .first()
}

const queryCancelarConsulta = async (consulta_id) => {
    return await knex('consultas')
    .where({id: consulta_id})
    .update({ status: 'cancelada'})
}

module.exports = {
    queryVerificarSlotDisponivel,
    queryVerificarConsultaPaciente,
    queryAgendarConsulta,
    queryBuscarConsultaPeloId,
    queryCancelarConsulta
}