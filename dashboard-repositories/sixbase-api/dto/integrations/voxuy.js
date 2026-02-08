const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  api_key: yup.string().required(),
  api_url: yup.string().required(),
});
