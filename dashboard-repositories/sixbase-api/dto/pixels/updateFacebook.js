const yup = require('yup');

module.exports = yup.object().shape({
  label: yup.string().nullable(),
  pixel_id: yup.string().nullable(),
  paid_pix: yup.boolean().nullable(),
  generated_pix: yup.boolean().nullable(),
  is_affiliate: yup.boolean().nullable(),
  token: yup.string().nullable(),
  domain: yup.string().nullable(),
});
