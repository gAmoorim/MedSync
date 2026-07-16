const { queryAgendaMedico, queryBuscarMedicoPorUsuarioId, queryPacientesAgendadosMedico } = require("../database/querys/queryMedico")


const controllerAgendaMedica = async (req, res) => {
    const { data_inicio, data_fim } = req.query

    if (!data_inicio || !data_fim) {
        return res.status(400).json({ error: 'Informe a data de inicio e de fim' })
    }

    if (data_fim < data_inicio) {
        return res.status(400).json({ error: 'A data de fim não pode ser menor do que a de inicio' })
    }

    const inicio = new Date(data_inicio + 'T00:00:00')
    const fim = new Date(data_fim + 'T00:00:00')

    const diferencaDias = (fim - inicio) / (1000 * 60 * 60 * 24)

    if (diferencaDias > 31) {
        return res.status(400).json({ error: 'O intervalo máximo de busca é de 31 dias' })
    }

    try {
        const usuarioId = req.usuario.id
        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)
        const consultas = await queryAgendaMedico(medico.id, data_inicio, data_fim)

        if (consultas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada no período informado' })
        }

        return res.status(200).json({ mensagem: 'Agenda do médico', consultas })
    } catch (error) {
        console.error('Ocorreu um erro ao listar as consultas do médico:', error)
        return res.status(500).json({ error: `Erro ao listar as consultas do médico: ${error.message}` })
    }
}

const controllerPacientesAgendadosMedico = async (req, res) => {
    const hoje = new Date().toISOString().split('T')[0]
    const {data = hoje, status, pagina = 1, limite = 10} = req.query

    try {
        const usuarioId = req.usuario.id
        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)

        if (!medico) {
            return res.status(404).json({ error: 'Médico não encontrado'})
        }

        const consultas = await queryPacientesAgendadosMedico(medico.id, data, status, pagina, limite)

        if (consultas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada' })
        }
        
        return res.status(200).json({ mensagem: 'Consultas do médico', consultas })
    } catch (error) {
        console.error('Ocorreu um erro ao listar as consultas do médico:', error)
        return res.status(500).json({ error: `Erro ao listar as consultas do médico: ${error.message}` })
    }
}

module.exports = {
    controllerAgendaMedica,
    controllerPacientesAgendadosMedico
}