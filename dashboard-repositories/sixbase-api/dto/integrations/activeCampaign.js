const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  apiKey: yup.string().required(),
  apiUrl: yup.string().required(),
});
