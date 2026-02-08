const yup = require('yup');

module.exports = yup.object().shape({
  conversion_label: yup.string().nullable(),
  label: yup.string().nullable(),
  pixel_id: yup.string().nullable(),
  trigger_boleto: yup.boolean().nullable(),
  trigger_card: yup.boolean().nullable(),
  trigger_checkout: yup.boolean().nullable(),
});
