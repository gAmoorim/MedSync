const knex = require('../connection')

const queryListarEspecialidades = async () => {
    return await knex('especialidades')
        .select('id', 'nome')
        .orderBy('nome', 'asc')
}

module.exports = {
    queryListarEspecialidades
}
