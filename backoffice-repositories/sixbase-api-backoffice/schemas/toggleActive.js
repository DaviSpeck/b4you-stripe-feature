const yup = require('yup');

module.exports = yup.object().shape({
  active: yup.boolean().required(),
});
