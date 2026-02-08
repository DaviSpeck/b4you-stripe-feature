const yup = require('yup');

module.exports = yup.object().shape({
    playerId: yup
        .string()
        .trim()
        .required('O campo playerId é obrigatório')
        .min(10, 'O playerId deve ter no mínimo 10 caracteres')
        .max(64, 'O playerId pode ter no máximo 64 caracteres'),
});