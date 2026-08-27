const { queryBuscarUsuarioPeloEmail } = require("../database/querys/queryUsuarios")
const { queryBuscarMedicoPorCRM, queryCadastrarMedico, queryListarMedicos, queryDetalheMedico, queryBuscarMedicoPorId, queryAtualizarMedico, queryInativarMedico } = require("../database/querys/queryAdministrador")
const { validarEmail, validarCRM, validarTelefone } = require("../utils/validations")
const { queryVerificarConsultasFuturasMedico } = require("../database/querys/queryConsultas")
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

const controllerDetalheMedico = async (req,res) => {
    const {medico_id} = req.params

    if (!medico_id) {
        return res.status(400).json({ error: 'Informe o id do médico'})
    }

    try {
        const medico = await queryDetalheMedico(medico_id)

        if (!medico) {
            return res.status(404).json({ error: 'Nenhum resultado obtido com o id informado'})
        }

        return res.status(200).json({ mensagem: 'Detalhes do médico encontrado', medico})
    } catch (error) {
        console.error('Ocorreu um erro ao detalhar o médico', error)
        return res.status(500).json({ error: `Erro ao detalhar o médico: ${error.message}`})
    }
}

const controllerAtualizarMedico = async (req, res) => {
    const { medico_id } = req.params
    const {nome, email, crm, especialidade_id, telefone, ativo} = req.body

    if (!medico_id) {
        return res.status(400).json({ error: 'Informe o id do médico'})
    }

    try {
        const medico = await queryBuscarMedicoPorId(medico_id)

        if (!medico) {
            return res.status(404).json({ error: 'Nenhum médico encontrado com o id informado.'})
        }

        if (email) {
            const emailExistente = await queryBuscarUsuarioPeloEmail(email)

            if (emailExistente && emailExistente.id !== medico.usuario_id) {
                return res.status(409).json({ error: 'Este email já está cadastrado'})
            }
        }

        if (crm) {
            const crmExistente = await queryBuscarMedicoPorCRM(crm)

            if (crmExistente && crmExistente.id !== Number(medico_id)) {
                return res.status(409).json({ error: 'Este CRM já está cadastrado' })
            }
        }

        const dadosAtualizados = await queryAtualizarMedico(medico_id, medico.usuario_id, nome, email, crm, especialidade_id, telefone, ativo)

        return res.status(200).json({ mensagem: 'Médico atualizado com sucesso', medico: dadosAtualizados})
    } catch (error) {
        console.error('Ocorreu um erro ao atualizar o médico', error)
        return res.status(500).json({ error: `Erro ao atualizar o médico: ${error.message}` })
    }

}

const controllerInativarMedico = async (req,res) => {
    const { medico_id } = req.params

    if (!medico_id) {
        return res.status(400).json({ error: 'Informe o Id do médico'})
    }

    try {
        const medico = await queryBuscarMedicoPorId(medico_id)

        if (!medico) {
            return res.status(404).json({ error: 'Nenhum médico encontrado com o id informado.'})
        }

        if (!medico.ativo) {
            return res.status(400).json({ error: 'Este médico já está inativo' })
        }

        const consultasFuturas  = await queryVerificarConsultasFuturasMedico(medico_id)

        if (consultasFuturas .length > 0) {
            return res.status(409).json({ error: 'Não é possível inativar o médico pois há consultas futuras pendentes',
                consultas: consultasFuturas
            })
        }

        await queryInativarMedico(medico.usuario_id)

        return res.status(200).json({ mensagem: 'Médico inativado'})
    } catch (error) {
        console.error('Ocorreu um erro ao inativar o médico', error)
        return res.status(500).json({ error: `Erro ao inativar o médico: ${error.message}`})
    }
}

module.exports = {
    controllerCadastrarMedico,
    controllerListarMedicos,
    controllerDetalheMedico,
    controllerAtualizarMedico,
    controllerInativarMedico
}