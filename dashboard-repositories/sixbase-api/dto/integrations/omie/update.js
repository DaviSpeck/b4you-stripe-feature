const yup = require('yup');

module.exports = yup.object().shape({
  app_key: yup.string().optional(),
  app_secret: yup.string().optional(),
  product_code_omie: yup.string().optional(),
  payment_code_omie: yup.string().optional(),
  category_code_omie: yup.string().optional(),
  account_code_omie: yup.number().integer().optional(),
  scenario_code_omie: yup.number().integer().optional(),
});
