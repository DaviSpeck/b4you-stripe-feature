const yup = require('yup');

module.exports = yup.object().shape({
  id_rule: yup.number().required(),
  id_list: yup.string().required(),
  insert_list: yup.boolean().required(),
});
