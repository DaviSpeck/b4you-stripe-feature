const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  api_token: yup.string().required(),
});
