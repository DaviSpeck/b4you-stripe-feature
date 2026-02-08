const INHERITABLE_FIELDS = [
  'payment_methods',
  'installments',
  'student_pays_interest',
  'discount_card',
  'discount_pix',
  'discount_billet',
  'allow_coupon',
  'enable_two_cards_payment',
  'default_installment',

  'shipping_type',
  'shipping_price',
  'require_address',
  'allow_shipping_region',
  'shipping_price_no',
  'shipping_price_ne',
  'shipping_price_co',
  'shipping_price_so',
  'shipping_price_su',
  'shipping_text',
  'shipping_region',

  'thankyou_page',
  'thankyou_page_card',
  'thankyou_page_pix',
  'thankyou_page_billet',
  'thankyou_page_upsell',
  'id_upsell',
  'is_upsell_active',
  'is_upsell_native',

  'url_video_checkout',
  'counter',
  'counter_three_steps',
  'popup',
  'checkout_customizations',
  'terms',
  'url_terms',

  'type_exibition_value',
  'is_plan_discount_message',
  'show_cnpj',
];

const inheritOfferConfig = (defaultOffer, dynamicData) => {
  const inherited = {};

  if (defaultOffer) {
    INHERITABLE_FIELDS.forEach((field) => {
      const value = defaultOffer[field];
      if (value !== undefined && value !== null) {
        inherited[field] = value;
      }
    });
  }

  return { ...inherited, ...dynamicData };
};

const extractDefaultOfferFromView = (viewData) => {
  if (!viewData) return null;

  const defaultOffer = {};

  const viewFieldMap = {
    offer_payment_methods: 'payment_methods',
    offer_installments: 'installments',
    offer_student_pays_interest: 'student_pays_interest',
    offer_discount_card: 'discount_card',
    offer_discount_pix: 'discount_pix',
    offer_discount_billet: 'discount_billet',
    offer_allow_coupon: 'allow_coupon',
    offer_enable_two_cards_payment: 'enable_two_cards_payment',
    offer_default_installment: 'default_installment',
    offer_shipping_type: 'shipping_type',
    offer_shipping_price: 'shipping_price',
    offer_require_address: 'require_address',
    offer_allow_shipping_region: 'allow_shipping_region',
    offer_shipping_price_no: 'shipping_price_no',
    offer_shipping_price_ne: 'shipping_price_ne',
    offer_shipping_price_co: 'shipping_price_co',
    offer_shipping_price_so: 'shipping_price_so',
    offer_shipping_price_su: 'shipping_price_su',
    offer_shipping_text: 'shipping_text',
    offer_shipping_region: 'shipping_region',
    offer_thankyou_page: 'thankyou_page',
    offer_thankyou_page_card: 'thankyou_page_card',
    offer_thankyou_page_pix: 'thankyou_page_pix',
    offer_thankyou_page_billet: 'thankyou_page_billet',
    offer_thankyou_page_upsell: 'thankyou_page_upsell',
    offer_id_upsell: 'id_upsell',
    offer_is_upsell_active: 'is_upsell_active',
    offer_is_upsell_native: 'is_upsell_native',
    offer_url_video_checkout: 'url_video_checkout',
    offer_counter: 'counter',
    offer_counter_three_steps: 'counter_three_steps',
    offer_popup: 'popup',
    offer_checkout_customizations: 'checkout_customizations',
    offer_terms: 'terms',
    offer_url_terms: 'url_terms',
    offer_type_exibition_value: 'type_exibition_value',
    offer_is_plan_discount_message: 'is_plan_discount_message',
    offer_show_cnpj: 'show_cnpj',
  };

  Object.entries(viewFieldMap).forEach(([viewField, offerField]) => {
    if (viewData[viewField] !== undefined && viewData[viewField] !== null) {
      defaultOffer[offerField] = viewData[viewField];
    }
  });

  return defaultOffer;
};

module.exports = {
  INHERITABLE_FIELDS,
  inheritOfferConfig,
  extractDefaultOfferFromView,
};
