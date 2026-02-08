const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().required(),
  is_default: yup.boolean().default(false).nullable(),
});
