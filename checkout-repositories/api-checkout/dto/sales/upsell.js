const yup = require('yup');
const { isValid, isSecurityCodeValid } = require('creditcard.js');
const date = require('../../utils/helpers/date');

const expirationDateRegex = '^(0[1-9]|1[0-2])/([0-9]{2})$';
const expirationDateMessage =
  'Data de vencimento inválida. Use o formato MM/AA (ex.: 05/28)';

module.exports = yup.object().shape({
  offer_id: yup.string().default('').nullable(),
  sale_item_id: yup.string().default('').nullable(),
  plan_id: yup.string().default(null).nullable(),
  payment_method: yup
    .string()
    .oneOf(['card', 'pix'])
    .default('card')
    .nullable(),
  card: yup
    .object()
    .shape({
      card_number: yup
        .string()
        .min(16)
        .max(18)
        .required()
        .test({
          name: 'test credit card number',
          message: 'Número Inválido',
          test: (card_number) => {
            if (!card_number) return false;
            return isValid(card_number);
          },
        }),
      card_holder: yup.string().required(),
      expiration_date: yup
        .string()
        .length(5)
        .matches(expirationDateRegex, expirationDateMessage)
        .required()
        .test({
          name: 'testing expiration date',
          message: 'Data Inválida',
          test: (value) => date(value, 'MM/YY').diff(date(), 'M') >= 0,
        }),
      cvv: yup
        .string()
        .min(3)
        .max(4)
        .required()
        .test({
          name: 'test cvv',
          test: (cvv, { parent: { card_number } }) =>
            isSecurityCodeValid(card_number, cvv),
          message: 'cvv Inválido',
        }),
    })
    .default(null)
    .nullable(),
  installments: yup
    .number()
    .integer()
    .positive()
    .min(1)
    .max(12)
    .default(1)
    .nullable(),
});
