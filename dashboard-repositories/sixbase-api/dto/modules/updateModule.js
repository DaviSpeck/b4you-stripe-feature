const yup = require('yup');

module.exports = yup.object().shape({
  title: yup.string().nullable(),
  description: yup.string().nullable(),
  active: yup.boolean().nullable(),
  release: yup.number().integer().min(0).nullable(),
  classrooms_ids: yup.array().of(yup.string()).nullable(),
  all: yup.boolean().default(false).nullable(),
});
