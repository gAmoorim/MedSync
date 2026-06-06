const { queryBuscarPacientePeloCpf, queryPerfilPaciente } = require("../database/querys/queryPacientes")
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

        if (!pacienteId) {
            return res.status(400).json({ error: 'Erro ao obter o id do paciente'})
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

module.exports = {
    controllerCriarPaciente,
    controllerPerfilPaciente
}