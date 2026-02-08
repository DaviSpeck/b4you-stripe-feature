const yup = require('yup');

module.exports = yup.object().shape({
  show_product_name: yup.boolean().nullable(),
  generated_pix: yup.boolean().nullable(),
  generated_billet: yup.boolean().nullable(),
  paid_pix: yup.boolean().nullable(),
  paid_billet: yup.boolean().nullable(),
  paid_card: yup.boolean().nullable(),
  expired_pix: yup.boolean().nullable(),
  expired_billet: yup.boolean().nullable(),
  requested_refund: yup.boolean().nullable(),
  mail_approved_payment: yup.boolean().nullable(),
});
