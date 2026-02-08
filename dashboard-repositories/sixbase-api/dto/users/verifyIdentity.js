const yup = require('yup');
const { ONLY_DIGITS } = require('../../utils/regex');

module.exports = yup.object().shape({
  birth_date: yup.date().required(),
  bank_code: yup.string().length(3).required(),
  agency: yup.string().max(4).required(),
  occupation: yup.string().required(),
  account_number: yup
    .string()
    .test({
      name: 'test account number',
      message: 'Conta inválida',
      test: (account) => {
        if (!account) return true;
        return ONLY_DIGITS.test(account);
      },
    })
    .required(),
  account_type: yup.string().required(),
});
