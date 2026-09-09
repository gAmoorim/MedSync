const knex = require('../connection')

const queryRelatorioConsultas = async (mes, medico_id) => {
    const dataInicio = `${mes}-01`
    const dataFim = new Date(mes.split('-')[0], mes.split('-')[1], 0).toISOString().split('T')[0]

    const totais = await knex('consultas')
        .where('data', '>=', dataInicio)
        .where('data', '<=', dataFim)
        .select(
            knex.raw('count(*) as total'),
            knex.raw("count(*) filter (where status = 'agendada') as agendadas"),
            knex.raw("count(*) filter (where status = 'confirmada') as confirmadas"),
            knex.raw("count(*) filter (where status = 'concluida') as concluidas"),
            knex.raw("count(*) filter (where status = 'cancelada') as canceladas")
        )
        .first()

    const porEspecialidade = await knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('c.data', '>=', dataInicio)
        .where('c.data', '<=', dataFim)
        .groupBy('e.nome')
        .select('e.nome as especialidade', knex.raw('count(*) as total'))

    const topMedico = await knex('consultas as c')
        .join('medicos as m', 'c.medico_id', 'm.id')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .where('c.data', '>=', dataInicio)
        .where('c.data', '<=', dataFim)
        .where('c.status', 'concluida')
        .groupBy('u.nome')
        .select('u.nome as medico_nome', knex.raw('count(*) as total'))
        .orderBy('total', 'desc')
        .first()

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

module.exports = {
    queryRelatorioConsultas
}