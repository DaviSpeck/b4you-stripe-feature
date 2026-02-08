const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().nullable(),
  url: yup.string().url().nullable(),
  product_id: yup.string().default(null).nullable(),
  is_affiliate: yup.boolean().default(false),
});
