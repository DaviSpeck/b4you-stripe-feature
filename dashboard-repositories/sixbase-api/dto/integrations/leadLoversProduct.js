const yup = require('yup');

module.exports = yup.object().shape({
  id_rule: yup.number().required(),
  insert_list: yup.boolean().required(),
  settings: yup.object().shape({
    machineCode: yup.number().required(),
    sequenceCode: yup.number().required(),
    level: yup.number().required(),
  }),
});
