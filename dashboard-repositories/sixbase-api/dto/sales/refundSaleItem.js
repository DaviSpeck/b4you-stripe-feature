const yup = require('yup');

module.exports = yup.object().shape({
  reason: yup.string().nullable(),
  description: yup.string().nullable(),
});
