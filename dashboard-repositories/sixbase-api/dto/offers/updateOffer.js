const yup = require('yup');
const dateHelper = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');
const regex = require('../../utils/regex');

const { MIN_PRICE } = process.env;

module.exports = yup.object().shape({
  name: yup.string().min(3).nullable(),
  quantity: yup.string().min(1).nullable(),
  description: yup.string().nullable(),
  alternative_name: yup.string().nullable(),
  shipping_text: yup.string().nullable(),
  bling_sku: yup.string().nullable(),
  tiny_sku: yup.string().nullable(),
  allow_shipping_region: yup.number().nullable(),
  shipping_price_no: yup.number().nullable(),
  shipping_price_ne: yup.number().nullable(),
  shipping_price_co: yup.number().nullable(),
  shipping_price_so: yup.number().nullable(),
  shipping_price_su: yup.number().nullable(),
  is_upsell_native: yup.boolean(),
  is_upsell_active: yup.boolean(),
  price: yup.number().when('free_sample', {
    is: true,
    then: 0,
    otherwise: yup.number().positive().min(MIN_PRICE).nullable(),
  }),
  active: yup.boolean().nullable(),
  terms: yup.boolean().nullable(),
  allow_coupon: yup.boolean().nullable(),
  url_terms: yup
    .string()
    .nullable()
    .when('terms', {
      is: true,
      then: yup.string().matches(regex.URL, 'Insira uma URL válida'),
    }),
  start_offer: yup
    .string()
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
  allow_affiliate: yup.boolean().nullable(),
  toggle_commission: yup.boolean().nullable(),
  affiliate_commission: yup.number().max(100).nullable(),
  thankyou_page_upsell: yup.string().url().nullable(),
  thankyou_page_card: yup.string().url().nullable(),
  thankyou_page_pix: yup.string().url().nullable(),
  thankyou_page_billet: yup.string().url().nullable(),
  dimensions: yup
    .object()
    .shape({
      height: yup.number().positive().nullable(),
      width: yup.number().positive().nullable(),
      length: yup.number().positive().nullable(),
      weight: yup.number().positive().nullable(),
    })
    .default(undefined)
    .nullable()
    .notRequired(),
  metadata: yup.string().nullable(),
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
  require_address: yup.boolean().nullable(),
  shipping_type: yup.number().nullable(),
  shipping_price: yup.number().when('free_sample', {
    is: true,
    then: yup.number().positive().min(MIN_PRICE).nullable(),
    otherwise: yup.number().nullable().default(0),
  }),
  id_shopify: yup.string().nullable(),
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
  affiliate_visible: yup.boolean().nullable().default(false),
  refund_suppliers: yup.boolean().nullable().default(false),
  free_sample: yup.boolean().nullable().default(false),
  popup: yup
    .object()
    .shape({
      active: yup.boolean().nullable(),
      mouseMove: yup.boolean().nullable(),
      closePage: yup.boolean().nullable(),
      afterTime: yup.boolean().nullable(),
      coupon: yup.string().nullable(),
      popup_delay: yup.string().nullable(),
      popup_title: yup.string().nullable(),
      popup_discount_text: yup.string().nullable(),
      popup_button_text: yup.string().nullable(),
      popup_secondary_text: yup.string().nullable(),
      hex_color_bg: yup
        .string()
        .matches(regex.HEX_COLOR, 'Invalid hex color')
        .nullable(),
      hex_color_text: yup
        .string()
        .matches(regex.HEX_COLOR, 'Invalid hex color')
        .nullable(),
      hex_color_button: yup
        .string()
        .matches(regex.HEX_COLOR, 'Invalid hex color')
        .nullable(),
      hex_color_button_text: yup
        .string()
        .matches(regex.HEX_COLOR, 'Invalid hex color')
        .nullable(),
    })
    .nullable(),
  is_plan_discount_message: yup.boolean().nullable(),
  show_cnpj: yup.boolean().nullable(),
  enable_two_cards_payment: yup.boolean().nullable(),
  available_checkout_link_types: yup.number().nullable(),
});
