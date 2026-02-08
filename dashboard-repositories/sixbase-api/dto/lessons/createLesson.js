const yup = require('yup');

module.exports = yup.object().shape({
  title: yup.string().required(),
  active: yup.boolean().default(true).nullable(),
  release: yup.number().integer().min(0).default(0).nullable(),
});
