const yup = require('yup');

module.exports = yup.object().shape({
  generate_invoice: yup.boolean().required().default(false),
  shipping: yup.string().required(),
  shipping_service: yup.string().required(),
  nat_operacao: yup.string().default('Venda de Mercadorias'),
  api_key: yup.string().required(),
});
