const knex = require('../connection')

const queryBuscarPacientePeloCpf = async (cpf) => {
    return await knex('pacientes')
    .where({cpf})
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

module.exports = {
    queryBuscarPacientePeloCpf,
    queryPerfilPaciente
}