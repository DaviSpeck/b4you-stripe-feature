const yup = require('yup');
const dateHelper = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');
const regex = require('../../utils/regex');

const { MIN_PRICE } = process.env;

module.exports = yup.object().shape({
  name: yup.string().min(3).required(),
  description: yup.string().default('').nullable(),
  alternative_name: yup.string().nullable(),
  shipping_text: yup.string().nullable(),
  allow_shipping_region: yup.number().nullable(),
  shipping_price_no: yup.number().nullable(),
  shipping_price_ne: yup.number().nullable(),
  shipping_price_co: yup.number().nullable(),
  shipping_price_so: yup.number().nullable(),
  shipping_price_su: yup.number().nullable(),
  price: yup.number().when('free_sample', {
    is: true,
    then: 0,
    otherwise: yup.number().positive().min(MIN_PRICE).nullable(),
  }),
  active: yup.boolean().default(true).nullable(),
  start_offer: yup
    .string()
    .default(null)
    .nullable()
    .test({
      name: 'test start offer',
      message: 'invalid start offer',
      test: (start_offer) => {
        if (!start_offer) return true;
        return dateHelper(start_offer, FRONTEND_DATE).isValid();
      },
    }),
  end_offer: yup
    .string()
    .default(null)
    .nullable()
    .test({
      name: 'end offer',
      message: 'invalid end offer',
      test: (end_offer) => {
        if (!end_offer) return true;
        return dateHelper(end_offer, FRONTEND_DATE).isValid();
      },
    }),
  classroom_id: yup.string().nullable(),
  sales_page_url: yup.string().matches(regex.URL, 'Insira uma URL valida'),
  allow_affiliate: yup.boolean().default(false).nullable(),
  discount_pix: yup.number().default(0).min(0).max(80).nullable(),
  discount_billet: yup.number().default(0).min(0).max(80).nullable(),
  discount_card: yup.number().default(0).min(0).max(80).nullable(),
  installments: yup
    .number()
    .integer()
    .positive()
    .min(1)
    .max(12)
    .nullable()
    .default(1),
  payment_methods: yup
    .string()
    .oneOf([
      'credit_card,billet,pix',
      'credit_card,billet',
      'credit_card,pix',
      'credit_card',
      'pix',
    ])
    .nullable()
    .default('credit_card'),
  student_pays_interest: yup.boolean().nullable().default(true),
  installments_without_interest: yup.number().nullable().default(null),
  require_address: yup.boolean().nullable().default(false),
  shipping_type: yup.number().nullable().default(0),
  shipping_price: yup.number().when('free_sample', {
    is: true,
    then: yup.number().positive().min(MIN_PRICE).nullable(),
    otherwise: yup.number().nullable().default(0),
  }),
  counter: yup
    .object()
    .shape({
      label: yup.string(),
      active: yup.boolean(),
      label_end: yup.string(),
      seconds: yup.number(),
      color: yup.string(),
    })
    .nullable(),
    counter_three_steps: yup
    .object()
    .shape({
      label: yup.string(),
      active: yup.boolean(),
      label_end: yup.string(),
      seconds: yup.number(),
    })
    .nullable(),
  quantity: yup.number().positive().default(1).nullable(),
  affiliate_visible: yup.boolean().nullable().default(false),
  allow_coupon: yup.boolean().nullable().default(false),
  free_sample: yup.boolean().nullable().default(false),
});
