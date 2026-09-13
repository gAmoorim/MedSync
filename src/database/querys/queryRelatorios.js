const knex = require('../connection')

const queryRelatorioConsultas = async (mes, medico_id) => {
    const dataInicio = `${mes}-01`
    const dataFim = new Date(mes.split('-')[0], mes.split('-')[1], 0).toISOString().split('T')[0]

    const queryTotais = knex('consultas')
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
        .select(
            knex.raw('count(*) as total'),
            knex.raw("count(*) filter (where status = 'agendada') as agendadas"),
            knex.raw("count(*) filter (where status = 'confirmada') as confirmadas"),
            knex.raw("count(*) filter (where status = 'concluida') as concluidas"),
            knex.raw("count(*) filter (where status = 'cancelada') as canceladas")
        )

    if (medico_id) queryTotais.where('medico_id', medico_id)
    const totais = await queryTotais.first()

    const queryPorEspecialidade = knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('c.data', '>=', dataInicio)
        .where('c.data', '<=', dataFim)
        .groupBy('e.nome')
        .select('e.nome as especialidade', knex.raw('count(*) as total'))

    if (medico_id) queryPorEspecialidade.where('c.medico_id', medico_id)
    const porEspecialidade = await queryPorEspecialidade

    const queryTopMedico = knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .where('c.data', '>=', dataInicio)
        .where('c.data', '<=', dataFim)
        .where('c.status', 'concluida')
        .groupBy('u.nome')
        .select('u.nome as medico_nome', knex.raw('count(*) as total'))
        .orderBy('total', 'desc')

    if (medico_id) queryTopMedico.where('c.medico_id', medico_id)
    const topMedico = await queryTopMedico.first()

    const taxaCancelamento = totais.total > 0
        ? ((totais.canceladas / totais.total) * 100).toFixed(2)
        : '0.00'

    return {
        total: totais.total,
        por_status: {
            agendadas: totais.agendadas,
            confirmadas: totais.confirmadas,
            concluidas: totais.concluidas,
            canceladas: totais.canceladas
        },
        taxa_cancelamento: `${taxaCancelamento}%`,
        por_especialidade: porEspecialidade,
        medico_mais_atendimentos: topMedico
    }
}

const calcularTotalSlots = async (medicoId, dataInicio, dataFim) => {
    const horarios = await knex('horarios_atendimento')
        .where('medico_id', medicoId)
        .where('ativo', true)
        .where('data_inicio_vigencia', '<=', dataFim)
        .where(function () {
            this.whereNull('data_fim_vigencia')
                .orWhere('data_fim_vigencia', '>=', dataInicio)
        })
        .select('dia_semana', 'hora_inicio', 'hora_fim', 'intervalo_minutos')

    let totalSlots = 0

    const inicio = new Date(dataInicio + 'T00:00:00')
    const fim = new Date(dataFim + 'T00:00:00')

    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay()
        const horariosDia = horarios.filter(h => h.dia_semana === diaSemana)

        for (const horario of horariosDia) {
            const [hInicio, mInicio] = horario.hora_inicio.split(':').map(Number)
            const [hFim, mFim] = horario.hora_fim.split(':').map(Number)
            const totalMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio)
            totalSlots += Math.floor(totalMinutos / horario.intervalo_minutos)
        }
    }

    return totalSlots
}


const queryRelatorioMedicos = async (mes) => {
    const dataInicio = `${mes}-01`
    const dataFim = new Date(mes.split('-')[0], mes.split('-')[1], 0).toISOString().split('T')[0]

    const medicos = await knex('medicos as m')
    .join('usuarios as u', 'm.usuario_id', 'u.id')
    .join('especialidades as e', 'm.especialidade_id', 'e.id')
    .leftJoin('consultas as c', function () {
        this.on('c.medico_id', '=', 'm.id')
            .andOn(knex.raw('c.data >= ?', [dataInicio]))
            .andOn(knex.raw('c.data <= ?', [dataFim]))
    })
    .where('u.ativo', true)
    .groupBy('m.id', 'u.nome', 'e.nome')
    .select(
        'm.id as medico_id',
        'u.nome',
        'e.nome as especialidade',
        knex.raw("count(c.id) filter (where c.status = 'agendada') as agendadas"),
        knex.raw("count(c.id) filter (where c.status = 'concluida') as concluidas"),
        knex.raw("count(c.id) filter (where c.status = 'cancelada') as canceladas")
    )
    .orderBy('concluidas', 'desc')

    const resultado = await Promise.all(medicos.map(async medico => {
        const totalSlots = await calcularTotalSlots(medico.medico_id, dataInicio, dataFim)
        const taxaOcupacao = totalSlots > 0
            ? ((medico.concluidas / totalSlots) * 100).toFixed(2)
            : '0.00'

        return { ...medico, taxa_ocupacao: `${taxaOcupacao}%` }
    }))

    return resultado
}



module.exports = {
    queryRelatorioConsultas,
    queryRelatorioMedicos
}
