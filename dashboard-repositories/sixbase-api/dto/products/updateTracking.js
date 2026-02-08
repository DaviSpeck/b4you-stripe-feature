const yup = require('yup');

module.exports = yup.object().shape({
  default_url_tracking: yup.string().required(),
});
