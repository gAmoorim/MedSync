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

const queryBuscarMedicoPorId = async (medico_id) => {
    return await knex('medicos as m')
        .join('usuarios as u', 'm.usuario_id', 'u.id')
        .where('m.id', medico_id)
        .select('m.*', 'u.ativo', 'u.email', 'u.nome')
        .first()
}

const queryBuscarUsuarioPeloEmail = async (emailExistente) => {
    return await knex('usuarios')
    .where({email: emailExistente})
    .first()
}
                                    
const queryAtualizarMedico = async (medico_id, usuario_id, nome, email, crm, especialidade_id, telefone, ativo) => {
    return await knex.transaction(async (trx) => {
        const dadosUsuario = {}
        const dadosMedico = {}

        if (nome) dadosUsuario.nome = nome
        if (email) dadosUsuario.email = email
        if (ativo !== undefined) dadosUsuario.ativo = ativo

        if (crm) dadosMedico.crm = crm
        if (especialidade_id) dadosMedico.especialidade_id = especialidade_id
        if (telefone) dadosMedico.telefone = telefone

        const [usuario] = await trx('usuarios')
        .where({ id: usuario_id })
        .update(dadosUsuario)
        .returning(['id', 'nome', 'email', 'ativo'])

        const [medico] = await trx('medicos')
        .where({ id: medico_id })
        .update(dadosMedico)
        .returning(['id', 'crm', 'especialidade_id', 'telefone'])

        return { ...usuario, ...medico }
    })
}

const queryInativarMedico = async (usuario_id) => {
    await knex('usuarios')
        .where({ id: usuario_id })
        .update({ ativo: false })
}

const queryListarPacientes = async (nome, cpf, pagina, limite) => {
    const offset = (pagina - 1) * limite

    const query = knex('pacientes as p')
        .join('usuarios as u', 'p.usuario_id', 'u.id')
        .select(
            'p.id as paciente_id',
            'u.nome',
            'u.email',
            'p.cpf',
            'p.telefone',
            'p.data_nascimento',
            knex('consultas').count('id').where('paciente_id', knex.ref('p.id')).as('total_consultas')
        )
        .orderBy('u.nome', 'asc')
        .limit(limite)
        .offset(offset)

    if (nome) {
        query.where('u.nome', 'ilike', `%${nome}%`)
    }

    if (cpf) {
        query.where('p.cpf', cpf)
    }

    return await query
}

module.exports = {
    queryBuscarMedicoPorCRM,
    queryCadastrarMedico,
    queryListarMedicos,
    queryDetalheMedico,
    queryBuscarMedicoPorId,
    queryBuscarUsuarioPeloEmail,
    queryAtualizarMedico,
    queryInativarMedico,
    queryListarPacientes
}