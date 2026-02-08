const yup = require('yup');

module.exports = yup.object().shape({
  code: yup.string().required(),
});
