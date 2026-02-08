const yup = require('yup');

const FIRST_CLICK = 'first-click';
const LAST_CLICK = 'last-click';

module.exports = yup.object().shape({
  allow_affiliate: yup.boolean(),
  manual_approve: yup.boolean(),
  email_notification: yup.boolean(),
  show_customer_details: yup.boolean(),
  list_on_market: yup.boolean(),
  support_email: yup.string(),
  description: yup.string(),
  general_rules: yup.string(),
  commission: yup.number().min(1).max(100).nullable(),
  subscription_fee: yup.boolean().default(false).nullable(),
  subscription_fee_commission: yup
    .number()
    .min(1)
    .max(80)
    .default(1)
    .nullable(),
  commission_all_charges: yup.boolean().default(true).nullable(),
  click_attribution: yup
    .string()
    .default(LAST_CLICK)
    .test({
      name: 'test click_attribution',
      message: 'click_attribution must be first-click or last-click',
      test: (value) => {
        if (!value) return true;
        return value === FIRST_CLICK || value === LAST_CLICK;
      },
    }),
  cookies_validity: yup.number().nullable().default(null),
  url_promotion_material: yup.string(),
  subscription_fee_only: yup.boolean().default(false).nullable(),
  allow_access: yup.boolean().default(false).nullable(),
});
