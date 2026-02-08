const yup = require('yup');

module.exports = yup.object().shape({
  id_event: yup.string().required(),
  url: yup.string().url().required(),
  token: yup.string().required(),
});
