const yup = require('yup');

module.exports = yup.object().shape({
  lessons_ids: yup.array().of(yup.string()).required(),
});
