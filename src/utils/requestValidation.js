const STATUS_CONSULTA = ['agendada', 'confirmada', 'concluida', 'cancelada']

const validarPaginacao = (pagina, limite) => {
    const paginaNumero = Number(pagina)
    const limiteNumero = Number(limite)

    if (!Number.isInteger(paginaNumero) || paginaNumero < 1) return null
    if (!Number.isInteger(limiteNumero) || limiteNumero < 1 || limiteNumero > 100) return null

    return { pagina: paginaNumero, limite: limiteNumero }
}

const validarStatusConsulta = (status) => !status || STATUS_CONSULTA.includes(status)

const validarDataISO = (data) => {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
    const [ano, mes, dia] = data.split('-').map(Number)
    const dataValidada = new Date(Date.UTC(ano, mes - 1, dia))
    return dataValidada.getUTCFullYear() === ano && dataValidada.getUTCMonth() === mes - 1 && dataValidada.getUTCDate() === dia
}

const validarHorario = (horario) => typeof horario === 'string' && /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(horario)

module.exports = {
    validarPaginacao,
    validarStatusConsulta,
    validarDataISO,
    validarHorario
}
