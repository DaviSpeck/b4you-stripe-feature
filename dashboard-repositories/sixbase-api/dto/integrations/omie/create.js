const yup = require('yup');

module.exports = yup.object().shape({
  app_key: yup.string().required(),
  app_secret: yup.string().required(),
  product_code_omie: yup.string().required(),
  payment_code_omie: yup.string().required(),
  category_code_omie: yup.string().required(),
  account_code_omie: yup.number().integer().required(),
  scenario_code_omie: yup.number().integer().optional(),
});
