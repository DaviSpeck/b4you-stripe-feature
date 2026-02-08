const yup = require('yup');

module.exports = yup.object().shape({
  id_rule: yup.number().required(),
  id_list: yup.number().required(),
  ids_tags: yup.array().of(yup.number()).required(),
});
