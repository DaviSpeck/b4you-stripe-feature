const yup = require('yup');

module.exports = yup.object().shape({
  reason: yup.string().nullable(),
  bank_account: yup.object().nullable().default({}).shape({
    bank_code: yup.string().nullable(),
    account_agency: yup.string().nullable(),
    account_number: yup.string().nullable(),
    account_type: yup.number().nullable(),
  }),
});
