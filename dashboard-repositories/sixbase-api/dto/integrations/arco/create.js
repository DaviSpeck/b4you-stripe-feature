const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  url: yup.string().url().required(),
  token: yup.string().required(),
  product_id: yup.string().default(null).nullable(),
  is_affiliate: yup.boolean().required().default(false),
  is_supplier: yup.boolean().required().default(false),
  id_type: yup.number().default(3).nullable(),
});
