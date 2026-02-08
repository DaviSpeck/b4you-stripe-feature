const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().required(),
  pixel_id: yup.string().required(),
  paid_pix: yup.boolean(),
  generated_pix: yup.boolean(),
  is_affiliate: yup.boolean(),
  token: yup.string(),
  domain: yup.string(),
});
