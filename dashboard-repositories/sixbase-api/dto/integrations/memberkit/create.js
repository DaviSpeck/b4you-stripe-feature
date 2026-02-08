const yup = require('yup');

module.exports = yup.object().shape({
  api_key: yup.string().required(),
  name: yup.string().required(),
});
