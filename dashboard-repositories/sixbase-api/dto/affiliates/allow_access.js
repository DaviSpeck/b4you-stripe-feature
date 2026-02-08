const yup = require('yup');

module.exports = yup.object().shape({
  allow_access: yup.boolean().default(false).required(),
});
