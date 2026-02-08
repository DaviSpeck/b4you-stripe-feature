const yup = require('yup');

module.exports = yup.object().shape({
  startDate: yup.date(),
  endDate: yup.date(),
  input: yup.string(),
  product: yup.string(),
  offers: yup.string(),
  page: yup.number().default(0),
  size: yup.number().default(10),
  type_affiliate: yup.boolean(),
});
