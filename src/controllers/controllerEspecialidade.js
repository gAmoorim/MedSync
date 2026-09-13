const { queryListarEspecialidades } = require('../database/querys/queryEspecialidades')

const controllerListarEspecialidades = async (req, res) => {
    try {
        const especialidades = await queryListarEspecialidades()
        return res.status(200).json({ mensagem: 'Especialidades encontradas', especialidades })
    } catch (error) {
        console.error('Ocorreu um erro ao listar especialidades:', error)
        return res.status(500).json({ error: 'Erro ao listar especialidades' })
    }
}

module.exports = {
    controllerListarEspecialidades
}
