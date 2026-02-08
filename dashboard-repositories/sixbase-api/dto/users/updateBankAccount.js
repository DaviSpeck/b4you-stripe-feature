const yup = require('yup');
const { ONLY_DIGITS } = require('../../utils/regex');

module.exports = yup.object().shape({
  bank_code: yup.string().length(3).nullable(),
  agency: yup.string().max(4).nullable(),
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
    .nullable(),
  account_type: yup.string().nullable(),
  operation: yup.string().nullable(),
});
