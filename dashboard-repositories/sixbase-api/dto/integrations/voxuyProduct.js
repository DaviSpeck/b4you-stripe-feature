const yup = require('yup');

module.exports = yup.object().shape({
  id_rule: yup.number().required(),
  settings: yup.object().shape({
    plan_id: yup.string().required(),
  }),
});
