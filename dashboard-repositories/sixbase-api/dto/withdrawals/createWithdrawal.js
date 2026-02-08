const yup = require('yup');

module.exports = yup.object().shape({
  amount: yup.number().required(),
});
