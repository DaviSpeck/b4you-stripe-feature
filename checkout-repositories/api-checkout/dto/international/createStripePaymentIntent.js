const yup = require('yup');

module.exports = yup.object().shape({
  transaction_id: yup.string().uuid().required(),
  order_id: yup.string().required(),
  sale_id: yup.string().required(),
  amount: yup.number().integer().positive().required(),
  currency: yup.string().length(3).lowercase().required(),
  payment_method_types: yup.array().of(yup.string()).default(['card']),
});
