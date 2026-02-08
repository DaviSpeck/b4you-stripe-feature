const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  token: yup.string().required(),
});
