const yup = require('yup');

module.exports = yup.object().shape({
  email: yup.string().email().required(),
  permissions: yup.array().of(yup.string()).required(),
});
