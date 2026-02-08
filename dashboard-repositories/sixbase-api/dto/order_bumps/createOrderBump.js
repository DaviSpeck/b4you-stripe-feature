const yup = require('yup');

module.exports = yup.object().shape({
  offer_id: yup.string().required(),
  price_before: yup.number().positive().nullable(),
  description: yup.string().default(null).nullable(),
  title: yup.string().required(),
  product_name: yup.string().required(),
  label: yup.string().required(),
  show_quantity: yup.boolean().nullable(),
  max_quantity: yup.number().positive().nullable(),
  plan_id: yup.string().nullable(),
});
