require('dotenv').config()
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER, 
    pass: process.env.MAILTRAP_PASS
  }
})

const emailAgendamento = async (destinatario, dados) => {
    await transporter.sendMail({
        from: 'MedSync <noreply@medsync.com>',
        to: destinatario,
        subject: 'Consulta agendada com sucesso!',
        html: `
            <h2>Consulta confirmada!</h2>
            <p>Olá, ${dados.paciente_nome}!</p>
            <p>Sua consulta foi agendada com sucesso.</p>
            <ul>
                <li><strong>Médico:</strong> ${dados.medico_nome}</li>
                <li><strong>Especialidade:</strong> ${dados.especialidade}</li>
                <li><strong>Data:</strong> ${new Date(dados.data).toLocaleDateString('pt-BR')}</li>
                <li><strong>Horário:</strong> ${dados.hora_inicio}</li>
            </ul>
        `
    })
}

const emailConfirmacao = async (destinatario, dados) => {
    await transporter.sendMail({
        from: 'MedSync <noreply@medsync.com>',
        to: destinatario,
        subject: 'Sua consulta foi confirmada!',
        html: `
            <h2>Consulta confirmada pelo médico!</h2>
            <p>Olá, ${dados.paciente_nome}!</p>
            <p>O médico confirmou sua consulta.</p>
            <ul>
                <li><strong>Médico:</strong> ${dados.medico_nome}</li>
                <li><strong>Data:</strong> ${new Date(dados.data).toLocaleDateString('pt-BR')}</li>
                <li><strong>Horário:</strong> ${dados.hora_inicio}</li>
            </ul>
        `
    })
}

const emailCancelamento = async (destinatario, dados) => {
    await transporter.sendMail({
        from: 'MedSync <noreply@medsync.com>',
        to: destinatario,
        subject: 'Consulta cancelada',
        html: `
            <h2>Consulta cancelada</h2>
            <p>Olá, ${dados.paciente_nome}!</p>
            <p>Sua consulta foi cancelada.</p>
            <ul>
                <li><strong>Médico:</strong> ${dados.medico_nome}</li>
                <li><strong>Data:</strong> ${new Date(dados.data).toLocaleDateString('pt-BR')}</li>
                <li><strong>Horário:</strong> ${dados.hora_inicio}</li>
                <li><strong>Motivo:</strong> ${dados.motivo}</li>
            </ul> 
        `
    })
}

module.exports = {
    emailAgendamento,
    emailConfirmacao,
    emailCancelamento
}