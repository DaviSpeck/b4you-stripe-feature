const yup = require('yup');

module.exports = yup.object().shape({
  content: yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .min(1, 'O comentário não pode ser vazio.')
    .max(2000, 'O comentário deve ter no máximo 2000 caracteres.')
    .required('O comentário é obrigatório.'),
});

