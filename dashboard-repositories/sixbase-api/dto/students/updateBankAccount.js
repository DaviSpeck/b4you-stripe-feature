const yup = require('yup');
const { findBank } = require('../../utils/banks');

module.exports = yup.object().shape({
  bank_code: yup
    .string()
    .required()
    .test({
      name: 'test bank_code',
      test: (bank_code) => {
        if (!bank_code) return false;
        const bank = findBank(bank_code);
        if (!bank) return false;
        return true;
      },
      message: 'Código bancário inválido',
    }),
  account_number: yup.string().required(),
  account_agency: yup.string().max(4).required(),
});
