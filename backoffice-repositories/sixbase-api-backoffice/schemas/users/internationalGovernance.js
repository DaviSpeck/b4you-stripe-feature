const yup = require('yup');

module.exports = yup.object().shape({
  status: yup
    .string()
    .required()
    .oneOf(['enabled', 'blocked'], 'status deve ser enabled ou blocked'),
  international_stripe_enabled: yup.boolean().required(),
  reason: yup
    .string()
    .trim('Motivo inválido')
    .min(3, 'Motivo deve ter no mínimo 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .required('Motivo é obrigatório'),
  rules: yup.object().nullable().default({}),
});
