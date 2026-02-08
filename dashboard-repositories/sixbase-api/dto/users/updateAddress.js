const yup = require('yup');

module.exports = yup.object().shape({
  zipcode: yup.string().optional(),
  street: yup.string().optional(),
  number: yup.string().optional(),
  complement: yup.string(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  country: yup.string().optional(),
});
