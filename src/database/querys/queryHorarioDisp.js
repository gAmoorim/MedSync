const knex = require('../connection')

const queryHorariosDisponiveis = async (data, especialidade, medico_id) => {
    const diaSemana = new Date(data + 'T00:00:00').getDay()

    const query = knex('horarios_atendimento as h')
        .join('medicos as m', 'h.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('h.ativo', true)
        .where('u.ativo', true)
        .where('h.dia_semana', diaSemana)
        .where('h.data_inicio_vigencia', '<=', data)
        .where(function () {
            this.whereNull('h.data_fim_vigencia')
                .orWhere('h.data_fim_vigencia', '>=', data)
        })
        .select(
            'h.id as horario_id',
            'm.id as medico_id',
            'u.nome as medico_nome',
            'e.nome as especialidade',
            'h.hora_inicio',
            'h.hora_fim',
            'h.intervalo_minutos'
        )

    if (especialidade) {
        query.where('e.nome', 'ilike', `%${especialidade}%`)
    }

    if (medico_id) {
        query.where('m.id', medico_id)
    }

    const horarios = await query

    // busca todos os slots ocupados para essa data
    const medicoIds = horarios.map(h => h.medico_id)

    const consultasOcupadas = await knex('consultas')
        .whereIn('medico_id', medicoIds)
        .where('data', data)
        .whereIn('status', ['agendada', 'confirmada'])
        .select('medico_id', 'hora_inicio')

    // monta um Set para verificação rápida: "medico_id-hora_inicio"
    const ocupados = new Set(
        consultasOcupadas.map(c => `${c.medico_id}-${c.hora_inicio.substring(0, 5)}`)
    )

    const slots = []

    for (const horario of horarios) {
        const [hInicio, mInicio] = horario.hora_inicio.split(':').map(Number)
        const [hFim, mFim] = horario.hora_fim.split(':').map(Number)

        let atual = hInicio * 60 + mInicio
        const fim = hFim * 60 + mFim

        while (atual + horario.intervalo_minutos <= fim) {
            const proximoSlot = atual + horario.intervalo_minutos

            const horaInicio = `${String(Math.floor(atual / 60)).padStart(2, '0')}:${String(atual % 60).padStart(2, '0')}`
            const horaFim = `${String(Math.floor(proximoSlot / 60)).padStart(2, '0')}:${String(proximoSlot % 60).padStart(2, '0')}`

            const chave = `${horario.medico_id}-${horaInicio}`

            if (!ocupados.has(chave)) {
                slots.push({
                    horario_id: horario.horario_id,
                    medico_id: horario.medico_id,
                    medico_nome: horario.medico_nome,
                    especialidade: horario.especialidade,
                    data,
                    hora_inicio: horaInicio,
                    hora_fim: horaFim
                })
            }

            atual = proximoSlot
        }
    }

    return slots
}

module.exports = {
    queryHorariosDisponiveis
}