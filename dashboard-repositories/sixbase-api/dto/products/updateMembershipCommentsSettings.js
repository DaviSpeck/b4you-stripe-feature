const yup = require('yup');

module.exports = yup.object().shape({
  enabled: yup.boolean().required(),
  auto_approve: yup.boolean().required(),
});

