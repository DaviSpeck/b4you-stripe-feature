const yup = require('yup');

module.exports = yup.object().shape({
  now: yup.boolean().nullable(),
});
