const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().nullable(),
  pixel_id: yup.string().nullable(),
  trigger_boleto: yup.boolean().nullable(),
});
