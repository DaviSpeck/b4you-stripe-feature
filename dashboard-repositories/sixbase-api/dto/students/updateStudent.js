const yup = require('yup');

module.exports = yup.object().shape({
  address: yup.object(),
  credit_card: yup.object(),
  document_number: yup.string(),
  document_type: yup.string(),
  full_name: yup.string(),
  password: yup.string(),
  whatsapp: yup.string(),
});
