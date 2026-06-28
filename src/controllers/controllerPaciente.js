const { queryVerificarSlotDisponivel, queryVerificarConsultaPaciente, queryAgendarConsulta, queryBuscarConsultaPeloId, queryCancelarConsulta } = require("../database/querys/queryConsultas")
const { queryHorariosDisponiveis } = require("../database/querys/queryHorarioDisp")
const { queryBuscarPacientePeloCpf, queryPerfilPaciente, queryAtualizarPaciente, queryBuscarSenhaAtualPaciente, queryAtualizarSenhaPaciente, queryVerificarHorario, queryBuscarPacientePorUsuarioId } = require("../database/querys/queryPacientes")
const { queryBuscarUsuarioPeloEmail, queryCriarPaciente } = require("../database/querys/queryUsuarios")
const { validarEmail, validarTelefone, validarCPF } = require("../utils/validations")
const bcrypt = require('bcrypt')

const controllerCriarPaciente = async (req, res) => {
    const {nome, email, senha, telefone, data_nascimento, cpf} = req.body

    if (!nome || !email || !senha || !data_nascimento || !cpf) {
        return res.status(400).json({ error: 'Preencha todos os campos necessários'})
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres'})
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'Formato do email inválido' })
    }

    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: 'Formato do cpf inválido'})
    }

    if (telefone) {
        if (!validarTelefone(telefone)) {
            return res.status(400).json({ error: 'Formato de telefone inválido'})
        }
    }

    try {
        const emailFormatado = email.toLowerCase().trim()

        const emailInformado = await queryBuscarUsuarioPeloEmail(emailFormatado)

        if (emailInformado) {
            return res.status(400).json({ error: 'Email já cadastrado'})
        }

        const verificarCpf = await queryBuscarPacientePeloCpf(cpf)

        if (verificarCpf) {
            return res.status(400).json({ error: 'CPF já cadastrado'})
        }

        const senha_hash = await bcrypt.hash(senha, 10)

        const pacienteCadastrado = await queryCriarPaciente(nome, emailFormatado, senha_hash, telefone, data_nascimento, cpf)
        
        return res.status(201).json({ mensagem: 'Paciente cadastrado', Dados: pacienteCadastrado})
    } catch (error) {
        console.error("Ocorreu um erro ao cadastrar o paciente:", error)
        return res.status(500).json({ error: `Erro ao cadastrar o paciente: ${error.message}`})
    }
}

const controllerPerfilPaciente = async (req, res) => {
    try {
        const pacienteId = req.usuario.id
        const tipoPaciente = req.usuario.tipo

        if (!pacienteId) {
            return res.status(400).json({ error: 'Erro ao obter o id do paciente'})
        }

        if (tipoPaciente !== 'paciente') {
            return res.status(400).json({ mensagem: 'Apenas para pacientes'})
        }
        
        const paciente = await queryPerfilPaciente(pacienteId)

        if (!paciente) {
            return res.status(404).json({ error: 'Nenhum dado encontrado desse paciente'})
        }

        return res.status(200).json({ mensagem: 'Dados do paciente', paciente})
    } catch (error) {
        console.error("Ocorreu um erro ao cadastrar o paciente:", error)
        return res.status(500).json({ error: `Erro ao cadastrar o paciente: ${error.message}`})
    }

}

const controllerAtualizarPaciente = async (req, res) => {
    const { nome, telefone, data_nascimento, email, cpf, senha  } = req.body

    if (email || cpf || senha) {
        return res.status(400).json({ error: 'Não é permitido email, cpf ou senha nesta rota'})
    }

    if (!nome && !telefone && !data_nascimento) {
        return res.status(400).json({ error: 'Preencha ao menos um campo para atualizar'})
    }

    try {
        const pacienteId = req.usuario.id

        if (!pacienteId) {
            return res.status(400).json({ error: 'Erro ao obter o id do paciente'})
        }

        const pacienteAtualizado = await queryAtualizarPaciente(pacienteId, nome, telefone, data_nascimento)

        return res.status(200).json({ mensagem: 'Paciente atualizado', Dados: pacienteAtualizado})
    } catch (error) {
        console.error("Ocorreu um erro ao atualizar o paciente:", error)
        return res.status(500).json({ error: `Erro ao atualizar o paciente: ${error.message}`})
    }
}

const controllerAlterarSenhaPaciente = async (req, res) => {
    const { senha_atual, nova_senha, confirmar_nova_senha } = req.body

    if (!senha_atual || !nova_senha || !confirmar_nova_senha) {
        return res.status(400).json({ error: 'Preencha todos os campos'})
    }
    
    try {
        const pacienteLogado = req.usuario
        const pacienteId = req.usuario.id

        if (pacienteLogado.tipo !== 'paciente') {
            return res.status(400).json({ error: 'Apenas para pacientes'})
        }

        if (nova_senha.length < 6) {
            return res.status(400).json({ error:'A nova senha deve conter no mínimo 6 caracteres' })
        }

        if (nova_senha !== confirmar_nova_senha) {
            return res.status(400).json({ error: 'Os campos da nova senha devem ser iguais'})
        }

        const { senha_hash } = await queryBuscarSenhaAtualPaciente(pacienteId)
        
        const verificarSenha = await bcrypt.compare(senha_atual, senha_hash)

        if (!verificarSenha) {
            return res.status(400).json({ erro: 'Senha atual incorreta'})
        }

        const novaSenhaCriptografada = await bcrypt.hash(nova_senha, 10)
        
        await queryAtualizarSenhaPaciente(pacienteId, novaSenhaCriptografada)

        return res.status(200).json({ mensagem: 'Senha atualizada com sucesso.'})
    } catch (error) {
        console.error("Ocorreu um erro ao atualizar a senha:", error)
        return res.status(500).json({ error: `Erro ao atualizar a senha: ${error.message}`})
    }
}

const controllerHorariosDisponiveis = async (req, res) => {
    const { data, especialidade, medico_id } = req.query

    if (!data) {
        return res.status(400).json({ error: 'O campo data é obrigatório.'})
    }

    const hoje = new Date().toISOString().split('T')[0]

    if (data < hoje) {
        return res.status(400).json({ error: 'Não pode ser uma data passada' })
    }

    try {
        const horarios = await queryHorariosDisponiveis(data, especialidade, medico_id)

        return res.status(200).json({ mensagem: 'Horários disponíveis', horarios})
    } catch (error) {
        console.error('Ocorreu um erro ao buscar horários', error)
        return res.status(500).json({ error: `Erro ao buscar horários: ${error.message}`})
    }
}

const controllerAgendarConsulta = async (req, res) => {
    const { horario_id, observacoes } = req.body
    const { data, hora_inicio } = req.query

    if (!data || !horario_id || !hora_inicio) {
        return res.status(400).json({ error: 'horario_id é obrigatório'})
    }

    try {
        const usuarioId = req.usuario.id
        const paciente = await queryBuscarPacientePorUsuarioId(usuarioId)

        if (!paciente) {
            return res.status(400).json({ error: 'Paciente não encontrado' })
        }

        const pacienteId = paciente.id
        
        const horario = await queryVerificarHorario(horario_id)

        if (!horario) {
            return res.status(400).json({ error: 'Horário indisponivel'})
        }

        const pacienteOcupado = await queryVerificarConsultaPaciente(pacienteId, data, hora_inicio)

        if (pacienteOcupado) {
            return res.status(409).json({ error: 'Você já possui uma consulta neste horário' })
        }

        const slotOcupado = await queryVerificarSlotDisponivel(horario.medico_id, data, hora_inicio)

        if (slotOcupado) {
            return res.status(409).json({ error: 'Este horário já está ocupado' })
        }

        const consulta = await queryAgendarConsulta(
            pacienteId,
            horario.medico_id,
            horario_id,
            data,
            hora_inicio,
            horario.intervalo_minutos,
            observacoes
        )

        // ENVIAR EMAIL CONFIRMANDO CONSULTA

        return res.status(201).json({ mensagem: 'consulta agendada', consulta})

    } catch (error) {
        console.error('Ocorreu um erro ao agendar consulta:', error)
        return res.status(500).json({ error: `Erro ao agendar consulta: ${error.message}`})
    }
}

const controllerCancelarConsultaPaciente = async (req, res) => {
    const {consulta_id} = req.params

    if (!consulta_id) {
        return res.status(400).json({ error: 'consulta_id é obrigatório'})
    }

    try {
        const usuarioLogado = req.usuario.id
        const paciente = await queryBuscarPacientePorUsuarioId(usuarioLogado)

        const consulta = await queryBuscarConsultaPeloId(consulta_id)

        if (!consulta) {
            return res.status(404).json({ error: 'Nenhuma consulta encontrada'})
        }

        if (consulta.paciente_id !== paciente.id) {
            return res.status(403).json({ error: 'Você não tem permissão para cancelar esta consulta'})
        }

        const statusAtual = consulta.status

        if (statusAtual !== "agendada" && statusAtual !== "confirmada") {
            return res.status(400).json({ error: "a consulta só pode ser cancelada se o status dela for confirmada ou agendada"})
        }

        const agora = new Date()
        const dataHoraConsula = new Date(`${consulta.data}T${consulta.hora_inicio}`)

        const diferencaHoras = (dataHoraConsula - agora) / (1000 * 60 * 60)

        if (diferencaHoras < 2) {
            return res.status(400).json({ error: 'Não é possível cancelar com menos de 2 horas de antecedência'})
        }

        await queryCancelarConsulta(consulta_id)

        return res.status(200).json({ mensagem: 'Consulta cancelada com sucesso' })

        //Enviar e-mail de confirmação de cancelamento ao paciente
    } catch (error) {
        console.error('Ocorreu um erro cancelar a consulta:', error)
        return res.status(500).json({ error: `Erro ao cancelar a consulta: ${error.message}`})
    }
}

module.exports = {
    controllerCriarPaciente,
    controllerPerfilPaciente,
    controllerAtualizarPaciente,
    controllerAlterarSenhaPaciente,
    controllerHorariosDisponiveis,
    controllerAgendarConsulta,
    controllerCancelarConsultaPaciente
}