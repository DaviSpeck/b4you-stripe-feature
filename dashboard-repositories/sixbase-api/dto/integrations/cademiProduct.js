const yup = require('yup');

module.exports = yup.object().shape({
  id_rule: yup.number().required(),
});
