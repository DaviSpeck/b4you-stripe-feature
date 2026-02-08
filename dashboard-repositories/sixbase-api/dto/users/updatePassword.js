const yup = require('yup');

module.exports = yup.object().shape({
  password: yup.string().required(),
  new_password: yup.string().min(6).required(),
});
