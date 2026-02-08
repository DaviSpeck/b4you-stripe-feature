const yup = require('yup');

module.exports = yup.object().shape({
  modules_ids: yup.array().of(yup.string()).required(),
});
