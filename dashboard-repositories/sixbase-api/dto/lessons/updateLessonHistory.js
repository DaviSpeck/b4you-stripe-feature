const yup = require('yup');

module.exports = yup.object().shape({
  lesson_id: yup.string().required(),
  done: yup.boolean().nullable(),
  time: yup.number().nullable(),
});
