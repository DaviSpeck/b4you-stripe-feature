const yup = require('yup');

module.exports = yup.object().shape({
  allow: yup.boolean().required(),
});
