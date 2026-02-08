const yup = require('yup');

module.exports = yup.object().shape({
  message: yup.string().required(),
});
