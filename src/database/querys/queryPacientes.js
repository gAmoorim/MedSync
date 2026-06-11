const knex = require('../connection')

const queryHorariosDisponiveis = async (data, especialidade, medico_id) => {
    const diaSemana = new Date(data).getDay()

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
        .whereNotExists(function () {
            this.select('*')
                .from('consultas as c')
                .whereRaw('c.medico_id = h.medico_id')
                .whereRaw('c.data = ?', [data])
                .whereRaw('c.hora_inicio = h.hora_inicio')
                .whereIn('c.status', ['agendada', 'confirmada'])
        })
        .select(
            'h.id as horario_id',
            'm.id as medico_id',
            'u.nome as medico_nome',
            'e.nome as especialidade',
            knex.raw('? as data', [data]),
            'h.hora_inicio',
            'h.hora_fim'
        )

    if (especialidade) {
        query.where('e.nome', 'ilike', `%${especialidade}%`)
    }

    if (medico_id) {
        query.where('m.id', medico_id)
    }

    return await query
}

const queryBuscarPacientePeloCpf = async (cpf) => {
    return await knex('pacientes')
    .where({cpf})
    .first()
}

const queryBuscarPacientePeloId = async (pacienteId) => {
    return await knex('pacientes')
    .where({id: pacienteId})
    .first()
}

const queryPerfilPaciente = async (pacienteId) => {
    const [paciente] = await knex('usuarios')
        .join('pacientes', 'usuarios.id', 'pacientes.usuario_id')
        .where('usuarios.id', pacienteId)
        .select(
            'usuarios.nome',
            'usuarios.email',
            'pacientes.telefone',
            'pacientes.data_nascimento',
            'pacientes.cpf'
        )

    return paciente
}

const queryAtualizarPaciente = async (pacienteId, nome, telefone, data_nascimento) => {
    return await knex.transaction(async (trx) => {
        const [usuario] = await trx('usuarios')
            .where('id', pacienteId)
            .update({ nome })
            .returning(['id', 'nome', 'email'])

        const [paciente] = await trx('pacientes')
            .where('usuario_id', pacienteId)
            .update({ telefone, data_nascimento})
            .returning(['telefone', 'data_nascimento'])

        return {...usuario, ...paciente}
    })
}

const queryBuscarSenhaAtualPaciente = async (pacienteId) => {
    return await knex('usuarios')
    .where({ id: pacienteId })
    .select('senha_hash')
    .first()
}

const queryAtualizarSenhaPaciente = async (pacienteId, novaSenhaCriptografada) => {
    return await knex('usuarios')
    .where({id: pacienteId})
    .update({senha_hash: novaSenhaCriptografada})
}

module.exports = {
    queryBuscarPacientePeloCpf,
    queryPerfilPaciente,
    queryAtualizarPaciente,
    queryBuscarPacientePeloId,
    queryBuscarSenhaAtualPaciente,
    queryAtualizarSenhaPaciente,
    queryHorariosDisponiveis
}