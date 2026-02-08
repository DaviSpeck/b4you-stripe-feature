const yup = require('yup');

module.exports = yup.object().shape({
  list_on_market: yup.boolean().required(),
});
