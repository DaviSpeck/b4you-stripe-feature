const yup = require('yup');

module.exports = yup.object().shape({
  title: yup.string().default('').nullable(),
  message: yup.string().required(),
});
