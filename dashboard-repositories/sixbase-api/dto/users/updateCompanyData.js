const yup = require('yup');

module.exports = yup.object().shape({
  cnpj: yup.string().required(),
  annual_revenue: yup.string().required(),
  bank_code: yup.string().required(),
  agency: yup.string().required(),
  account_number: yup.string().required(),
  account_type: yup.string().required(),
  birth_date: yup.string().required(),
});
