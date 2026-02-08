const yup = require('yup');

module.exports = yup.object().shape({
  accept: yup.boolean().required(),
});
