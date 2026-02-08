const yup = require('yup');
const { CREDIT_CARD_DESCRIPTION } = require('../../utils/regex');

module.exports = yup.object().shape({
  creditcard_descriptor: yup
    .string()
    .matches(
      CREDIT_CARD_DESCRIPTION,
      'Somente serão aceitos números e letras (sem acentuação ou caracteres especiais). Também há limite de 13 caracteres',
    )
    .nullable(),
  hex_color: yup.string().max(7).nullable(),
  checkout_description: yup.string().nullable(),
});
