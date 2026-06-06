function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefone(telefone) {
    const regex = /^(\(?\d{2}\)?\s?)?(9\d{4})[-.\s]?(\d{4})$/;
    return regex.test(telefone);
}

function validarCPF(cpf) {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regex.test(cpf);
}

module.exports = {
    validarEmail,
    validarTelefone,
    validarCPF
}