const yup = require('yup');
const {
  isValid,
  isExpirationDateValid,
  isSecurityCodeValid,
} = require('creditcard.js');
const DateHelper = require('../../utils/helpers/date');
const { EXPIRATION_CARD_DATE } = require('../../types/dateTypes');

module.exports = yup.object().shape({
  card_number: yup
    .string()
    .min(16)
    .max(18)
    .required()
    .test({
      name: 'test credit card number',
      message: 'Número inválido',
      test: (card_number) => {
        if (!card_number) return false;
        return isValid(card_number);
      },
    }),
  card_holder: yup.string().required('Campo obrigatório'),
  expiration_date: yup
    .string()
    .length(7)
    .required()
    .test({
      name: 'test expiration date',
      test: (expiration_date) => {
        if (!expiration_date) return false;
        if (!DateHelper(expiration_date, EXPIRATION_CARD_DATE).isValid())
          return false;
        const [month, year] = expiration_date.split('/');
        return isExpirationDateValid(month, year);
      },
      message: 'Data inválida',
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
      message: 'Cvv inválido',
    }),
});
