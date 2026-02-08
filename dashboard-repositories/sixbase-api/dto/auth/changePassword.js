const yup = require('yup');

module.exports = yup.object().shape({
  token: yup.string().required(),
  password: yup.string().required(),
});
