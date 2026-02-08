const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  api_url_lead: yup.string().required(),
});
