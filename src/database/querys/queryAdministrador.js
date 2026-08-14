const knex = require('../connection')

const queryBuscarMedicoPorCRM = async (crm) => {
    return await knex('medicos')
    .where({crm})
    .first()
}

const queryCadastrarMedico = async (nome, emailFormatado, senha_hash, crm, especialidade_id, telefone) => {
    return await knex.transaction(async (trx) => {
        const [usuario] = await trx('usuarios')
        .insert({ nome, email: emailFormatado, senha_hash, tipo: 'medico' })
        .returning(['id', 'nome', 'email', 'tipo'])

        const [medico] = await trx('medicos')
        .insert({ usuario_id: usuario.id, especialidade_id, crm, telefone })
        .returning(['id', 'crm', 'especialidade_id', 'telefone'])

        return { ...usuario, ...medico }
    })
}

const queryListarMedicos = async (especialidade, ativo, pagina, limite) => {
    const offset = (pagina - 1) * limite

    const query = knex('medicos as m')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .select(
            'm.id as medico_id',
            'u.nome',
            'u.email',
            'm.crm',
            'e.nome as especialidade',
            'm.telefone',
            'u.ativo'
        )
        .orderBy('u.nome', 'asc')
        .limit(limite)
        .offset(offset)

    if (especialidade) {
        query.where('e.nome', 'ilike', `%${especialidade}%`)
    }

    if (ativo !== undefined) {
        query.where('u.ativo', ativo)
    }

    return await query
}

const queryDetalheMedico = async (medico_id) => {
    const medico = await knex('medicos as m')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .join('especialidades as e', 'm.especialidade_id', 'e.id')
        .where('m.id', medico_id)
        .select(
            'm.id as medico_id',
            'u.nome',
            'u.email',
            'm.crm',
            'e.nome as especialidade',
            'm.telefone',
            'u.ativo'
        )
        .first()

    const { total } = await knex ('consultas')
    .where('medico_id', medico_id)
    .count('id as total')
    .first()

    return { ...medico, total_consultas: total }
}

module.exports = {
    queryBuscarMedicoPorCRM,
    queryCadastrarMedico,
    queryListarMedicos,
    queryDetalheMedico
}