const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().nullable(),
  pixel_id: yup.string().nullable(),
  trigger_boleto: yup.boolean().nullable(),
  trigger_pix: yup.boolean().nullable(),
  initiate_checkout: yup.boolean().nullable(),
  purchase: yup.boolean().nullable(),
});
