const yup = require('yup');
const regex = require('../../utils/regex');

module.exports = yup.object().shape({
  coupon: yup
    .string()
    .min(4, 'Cupom precisa ter no mínimo 4 caracteres')
    .max(30, 'Cupom pode ter no máximo 30 caracteres')
    .matches(
      regex.COUPONS,
      'Permitido apenas número e letras (sem espaços ou caracteres especiais)',
    )
    .required(),
  id_rule: yup.number().nullable(),
});
