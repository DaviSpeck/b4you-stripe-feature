const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().nullable(),
  title: yup.string().nullable(),
  product_name: yup.string().nullable(),
  price_before: yup.number().positive().nullable(),
  description: yup.string().nullable(),
  show_quantity: yup.boolean().nullable(),
  max_quantity: yup.number().positive().nullable(),
});
