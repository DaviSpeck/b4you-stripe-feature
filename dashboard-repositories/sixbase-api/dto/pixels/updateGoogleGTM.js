const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().required(),
  pixel_id: yup.string().required(),
  trigger_boleto: yup.boolean().required(),
  trigger_pix: yup.boolean().required(),
  initiate_checkout: yup.boolean().required(),
  purchase: yup.boolean().required(),
});
