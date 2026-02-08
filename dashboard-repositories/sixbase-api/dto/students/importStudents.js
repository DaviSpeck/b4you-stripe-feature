const yup = require('yup');

module.exports = yup.object().shape({
  data: yup.array().of(yup.string().email().required()).required(),
  classroom_id: yup.string().nullable(),
});
