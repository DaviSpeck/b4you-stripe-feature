const yup = require('yup');
const regex = require('../../utils/regex');

module.exports = yup.object().shape({
  label: yup.string().required(),
  pixel_id: yup
    .string()
    .matches(regex.GOOGLE_ADS, 'Insira um pixel válido')
    .required(),
  trigger_boleto: yup.boolean().required(),
  trigger_pix: yup.boolean().required(),
  initiate_checkout: yup.boolean().required(),
  purchase: yup.boolean().required(),
});
