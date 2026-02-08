const yup = require('yup');

module.exports = yup.object().shape({
  student_id: yup.string().required(),
});
