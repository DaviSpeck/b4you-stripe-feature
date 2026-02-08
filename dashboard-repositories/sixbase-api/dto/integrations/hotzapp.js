const yup = require('yup');

module.exports = yup.object().shape({
  url: yup.string().required(),
  product_uuid: yup.string().nullable(),
  allProducts: yup.boolean().nullable(),
});
