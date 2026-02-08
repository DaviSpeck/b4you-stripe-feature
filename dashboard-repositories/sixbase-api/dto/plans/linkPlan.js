const yup = require('yup');

module.exports = yup.object().shape({
  plan_id: yup.string().required(),
});
