const yup = require('yup');

module.exports = yup.object().shape({
  pixel_id: yup.string().required(),
  trigger_purchase_boleto: yup.boolean().required(),
  label: yup.string().nullable(),
});
