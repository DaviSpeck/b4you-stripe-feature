const yup = require('yup');

module.exports = yup.object().shape({
  name: yup.string().required(),
  webhook_url: yup.string().required(),
});
