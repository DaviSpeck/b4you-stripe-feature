const yup = require('yup');

module.exports = yup.object().shape({
  permissions: yup.array().of(yup.string()).required(),
});
