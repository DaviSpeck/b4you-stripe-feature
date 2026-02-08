const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().nullable(),
  url: yup.string().url().nullable(),
  token: yup.string().nullable(),
  product_id: yup.string().default(null).nullable(),
  events: yup.array().of(yup.number().integer()),
  is_affiliate: yup.boolean().default(false),
  is_supplier: yup.boolean().default(false),
});
