const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().nullable(),
  is_default: yup.boolean().default(false).nullable(),
  modules_ids: yup.array().of(yup.string()),
  all: yup.boolean().default(false).nullable(),
});
