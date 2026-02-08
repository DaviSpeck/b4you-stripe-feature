const yup = require('yup');

module.exports = yup.object().shape({
  release_pix: yup.number().min(0).max(30).nullable(),
  release_billet: yup.number().min(0).max(30).nullable(),
  release_credit_card: yup.number().min(0).max(30).nullable(),
  withheld_balance_percentage: yup
    .number()
    .min(0)
    .max(80)
    .default(null)
    .nullable(),
  use_highest_sale: yup.boolean().default(null).nullable(),
  fee_variable_card_service: yup
    .object()
    .shape({
      1: yup.number(),
      2: yup.number(),
      3: yup.number(),
      4: yup.number(),
      5: yup.number(),
      6: yup.number(),
      7: yup.number(),
      8: yup.number(),
      9: yup.number(),
      10: yup.number(),
      11: yup.number(),
      12: yup.number(),
    })
    .required(),
  fee_fixed_card_service: yup
    .object()
    .shape({
      1: yup.number(),
      2: yup.number(),
      3: yup.number(),
      4: yup.number(),
      5: yup.number(),
      6: yup.number(),
      7: yup.number(),
      8: yup.number(),
      9: yup.number(),
      10: yup.number(),
      11: yup.number(),
      12: yup.number(),
    })
    .required(),
  fee_variable_pix_service: yup.number().required(),
  fee_variable_billet_service: yup.number().required(),
  fee_fixed_billet_service: yup.number().required(),
  fee_fixed_pix_service: yup.number().required(),
});
