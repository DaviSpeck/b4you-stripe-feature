const yup = require('yup');

module.exports = yup.object().shape({
  current_token: yup.string().required(),
  new_token: yup.string().required(),
});
