const yup = require('yup');

module.exports = yup.object().shape({
  conversion_label: yup.string().required(),
  label: yup.string().required(),
  pixel_id: yup.string().required(),
  trigger_boleto: yup.boolean().required(),
  trigger_card: yup.boolean().required(),
  trigger_checkout: yup.boolean().required(),
});
