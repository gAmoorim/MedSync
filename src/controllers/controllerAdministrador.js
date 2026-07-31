const { queryBuscarUsuarioPeloEmail } = require("../database/querys/queryUsuarios")
const { queryBuscarMedicoPorCRM, queryCadastrarMedico, queryListarMedicos } = require("../database/querys/queryAdministrador")
const { validarEmail, validarCRM, validarTelefone } = require("../utils/validations")
const bcrypt = require('bcrypt')

const controllerCadastrarMedico = async (req, res) => {
    const { nome, email, senha, crm, especialidade_id, telefone } = req.body

    if (!nome || !email || !senha || !crm || !especialidade_id) {
        return res.status(400).json({ error: 'Preencha os campos obrigatórios'})
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres'})
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'Formato do email inválido' })
    }

    if (!validarCRM(crm)) {
        return res.status(400).json({ error: 'Formato incorreto do CRM'})
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

        const crmInformado = await queryBuscarMedicoPorCRM(crm)

        if (crmInformado) {
            return res.status(400).json({ error: 'CRM já cadastrado'})
        }

        const senha_hash = await bcrypt.hash(senha, 10)
        const medicoCadastrado = await queryCadastrarMedico(nome, emailFormatado, senha_hash, crm, especialidade_id, telefone)

        return res.status(201).json({ mensagem: 'Médico cadastrado', dados: medicoCadastrado})
    } catch (error) {
        console.error('Ocorreu um erro ao cadastrar o médico', error)
        return res.status(500).json({ error: `Erro ao cadastrar o médico: ${error.message}`})
    }
}

const controllerListarMedicos = async (req, res) => {
    const { especialidade, ativo, pagina = 1, limite = 10 } = req.query

    try {
        const medicos = await queryListarMedicos(especialidade, ativo, pagina, limite)

        if (!medicos) {
            return res.status(404).json({ error: 'Nenhum médico encontrado'})
        }

        return res.status(200).json({ mensagem: 'Médicos encontrados', medicos})
    } catch (error) {
        console.error('Ocorreu um erro ao listar os médicos', error)
        return res.status(500).json({ error: `Erro ao listar os médicos: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarMedico,
    controllerListarMedicos
}