const { queryAgendaMedico, queryBuscarMedicoPorUsuarioId, queryPacientesAgendadosMedico, queryDetalheConsultaMedico, queryConcluirConsulta } = require("../database/querys/queryMedico")


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
        console.error('Ocorreu um erro ao listar os pacientes agendados:', error)
        return res.status(500).json({ error: `Erro ao listar os pacientes agendados: ${error.message}` })
    }
}

const controllerDetalheConsultaMedico = async (req,res) => {
    const {consulta_id} = req.params

    if (!consulta_id) {
        return res.status(400).json({ error: 'erro ao obter o id da consulta'})
    }

    try {
        const usuarioId = req.usuario.id

        if (!usuarioId) {
            return res.status(400).json({ error: 'Erro ao obter o id do médico logado'})
        }

        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)
        const consulta = await queryDetalheConsultaMedico(consulta_id)

        if (!consulta) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada'})
        }

        if (consulta.medico_id !== medico.id) {
            return res.status(400).json({ error: 'a consulta informada não pertence ao médico logado'})
        }

        return res.status(200).json({ mensagem: 'Detalhes da consulta', consulta})
    } catch (error) {
        console.error('Ocorreu um erro ao listar os detalhes da consulta:', error)
        return res.status(500).json({ error: `Erro ao listar os detalhes da consulta: ${error.message}` })
    }
}

const controllerConcluirConsulta = async (req, res) => {
    const {consulta_id} = req.params
    const {anotacoes_medico} = req.body

    if (!consulta_id) {
        return res.status(400).json({ error: 'Erro ao obter o id da consulta'})
    }
    
    try {
        const usuarioId = req.usuario.id

        if (!usuarioId) {
            return res.status(400).json({ error: 'Erro ao obter o id do médico logado'})
        }
        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)
        const consulta = await queryDetalheConsultaMedico(consulta_id)

        if (!consulta) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada'})
        }
        
        if (medico.id !== consulta.medico_id) {
            return res.status(400).json({ error: 'A consulta informada não pertence ao médico logado'})
        }

        if (consulta.status !== 'agendada' && consulta.status !== 'confirmada') {
            return res.status(400).json({ error: 'A consulta só pode ser concluída se o status for agendada ou confirmada'})
        }

        const consulta_concluida = await queryConcluirConsulta(consulta_id, anotacoes_medico)

        return res.status(200).json({ mensagem: 'consulta concluída', consulta_concluida})
    } catch (error) {
        console.error('Ocorreu um erro ao concluir a consulta:', error)
        return res.status(500).json({ error: `Erro ao concluir a consulta: ${error.message}` })
    }
}

module.exports = {
    controllerAgendaMedica,
    controllerPacientesAgendadosMedico,
    controllerDetalheConsultaMedico,
    controllerConcluirConsulta
}