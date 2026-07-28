const { queryAgendaMedico, queryBuscarMedicoPorUsuarioId, queryPacientesAgendadosMedico, queryDetalheConsultaMedico, queryConcluirConsulta, queryConfirmarConsulta, queryVerificarConflitoHorario, queryDefinirHorarios, queryListarHorariosMedico, queryBuscarHorarioMedico, queryVerificarConsultasNoHorario, queryAtualizarHorario } = require("../database/querys/queryMedico")


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

const controllerConfirmarConsulta = async (req, res) => {
    const {consulta_id} = req.params

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

        if (medico.id !== consulta.medico_id) {
            return res.status(400).json({ error: 'A consulta informada não pertence ao médico logado'})
        }

        if (consulta.status !== 'agendada') {
            return res.status(400).json({ error: 'A consulta só pode ser confirmada se o status atual for agendada'})
        }

        const consulta_confirmada = await queryConfirmarConsulta(consulta_id)
        // enviar email de confirmação ao paciente

        return res.status(200).json({ mensagem: 'Consulta confirmada', consulta_confirmada})
    } catch (error) {
        console.error('Ocorreu um erro ao concluir a consulta:', error)
        return res.status(500).json({ error: `Erro ao concluir a consulta: ${error.message}` })
    }
}

const controllerDefinirHorario = async (req, res) => {
    const { dias_semana, hora_inicio, hora_fim, intervalo_minutos, data_inicio_vigencia, data_fim_vigencia } = req.body

    if (!dias_semana || !hora_inicio || !hora_fim || !intervalo_minutos || !data_inicio_vigencia) {
        return res.status(400).json({ error: 'Preencha os campos obrigatórios'})
    }

    if (hora_fim <= hora_inicio) {
        return res.status(400).json({ error: 'A hora de fim não pode ser menor ou igual à hora de inicio'})
    }

    if (intervalo_minutos <= 0) {
        return res.status(400).json({ error: 'O intervalo deve ser maior que zero'})
    }

    const [hInicio, mInicio] = hora_inicio.split(':').map(Number)
    const [hFim, mFim] = hora_fim.split(':').map(Number)
    const totalMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio)

    if (totalMinutos < intervalo_minutos) {
        return res.status(400).json9({ error: 'O intervalo informado não gera nenhum slot de atendimento'})
    }

    try {
        const usuarioId = req.usuario.id

        if (!usuarioId) {
            return res.status(400).json({ error: 'Erro ao obter o id do médico logado'})
        }

        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)

        for (const dia of dias_semana) {
            const conflito = await queryVerificarConflitoHorario(medico.id, dia, hora_inicio, hora_fim)

            if (conflito) {
                return res.status(409).json({ error: `Já existe um horário que conflita com o dia ${dia}`})
            }
        }

        const horarios = await queryDefinirHorarios(medico.id, dias_semana, hora_inicio, hora_fim, intervalo_minutos, data_inicio_vigencia, data_fim_vigencia)

        return res.status(201).json({ mensagem: 'Horários criados com sucesso', horarios})
    } catch (error) {
        console.error('Ocorreu um erro ao definir horários:', error)
        return res.status(500).json({ error: `Erro ao definir horários: ${error.message}` })
    }
}

const controllerListarHorariosMedico = async (req, res) => {
    try {
        const usuarioId = req.usuario.id
        
        if (!usuarioId) {
            return res.status(400).json({ error: 'Erro ao obter o id do médico logado'})
        }
        
        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)
        const horarios = await queryListarHorariosMedico(medico.id)

        if (!horarios) {
            return res.status(404).json({ error: 'Nenhum horário encontrado'})
        }

        return res.status(200).json({ mensagem: 'Lista de horários', horarios})
    } catch (error) {
        console.error('Ocorreu um erro ao listar horários:', error)
        return res.status(500).json({ error: `Erro ao listar horários: ${error.message}` })
    }
}

const controllerAtualizarHorario = async (req, res) => {
    const { horario_id } = req.params
    const { hora_inicio, hora_fim, intervalo_minutos, ativo, data_fim_vigencia } = req.body

    try {
        const usuarioId = req.usuario.id
        
        if (!usuarioId) {
            return res.status(400).json({ error: 'erro ao obter o id do usuario logado.'})
        }

        const medico = await queryBuscarMedicoPorUsuarioId(usuarioId)
        const horario = await queryBuscarHorarioMedico(horario_id)

        if (!horario) {
            return res.status(404).json({ error: 'Nenhum horario encontrado com esse id'})
        }

        if (horario.medico_id !== medico.id) {
            return res.status(400).json({ error: 'A consulta informada não pertence ao médico logado'})
        }

        const consultasAfetadas = await queryVerificarConsultasNoHorario(horario_id)

        if (consultasAfetadas.length > 0) {
            return res.status(409).json({ error: 'Não é possível alterar o horário pois há consultas agendadas ou confirmadas vinculadas',
                consultas: consultasAfetadas
            })
        }

        const horarioAtualizado = await queryAtualizarHorario(horario_id, hora_inicio, hora_fim, intervalo_minutos, ativo, data_fim_vigencia)

        return res.status(200).json({ mensagem: 'Horário atualizado', horario: horarioAtualizado})
    } catch (error) {
        console.error('Ocorreu um erro ao atualizar o horário:', error)
        return res.status(500).json({ error: `Erro ao atualizar o horário: ${error.message}` })
    }
    
}



module.exports = {
    controllerAgendaMedica,
    controllerPacientesAgendadosMedico,
    controllerDetalheConsultaMedico,
    controllerConcluirConsulta,
    controllerConfirmarConsulta,
    controllerDefinirHorario,
    controllerListarHorariosMedico,
    controllerAtualizarHorario
}