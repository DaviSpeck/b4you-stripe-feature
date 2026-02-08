const SerializeOrderBumps = require('./orderBump');
const SerializePlans = require('./plans');
const { capitalizeName } = require('../../utils/formatters');

const { URL_SIXBASE_CHECKOUT } = process.env;

const resolveClassroom = (classroom) => {
  if (!classroom) return null;
  const { label, uuid, is_default } = classroom;
  return {
    uuid,
    label,
    is_default,
  };
};

const resolveOrderBumps = (order_bumps) => {
  if (!Array.isArray(order_bumps)) return [];
  return new SerializeOrderBumps(order_bumps).adapt();
};

const resolvePlans = (plans) => {
  if (!Array.isArray(plans)) return [];
  return new SerializePlans(plans).adapt();
};

const serializeSingleOffer = (
  {
    uuid,
    name,
    price,
    description,
    alternative_name,
    shipping_text,
    allow_shipping_region,
    shipping_price_no,
    shipping_price_ne,
    shipping_price_co,
    shipping_price_so,
    shipping_price_su,
    start_offer,
    end_offer,
    created_at,
    updated_at,
    is_upsell_native,
    is_upsell_active,
    active,
    classroom,
    allow_affiliate,
    order_bumps,
    plans,
    sales_page_url,
    thankyou_page_upsell,
    thankyou_page_card,
    thankyou_page_pix,
    thankyou_page_billet,
    dimensions,
    discount_pix,
    discount_billet,
    discount_card,
    installments,
    installments_without_interest,
    payment_methods,
    student_pays_interest,
    payment_type,
    shipping_type,
    shipping_price,
    require_address,
    counter,
    counter_three_steps,
    quantity,
    banner_image,
    banner_image_mobile,
    banner_image_mobile_secondary,
    offer_image,
    sidebar_image,
    banner_image_secondary,
    url_video_checkout,
    uuid_offer_back_redirect,
    terms,
    url_terms,
    id_shopify,
    affiliate_visible,
    refund_suppliers,
    toggle_commission,
    affiliate_commission,
    free_sample,
    allow_coupon,
    bling_sku = null,
    tiny_sku = null,
    last_ob_created,
    popup,
    is_plan_discount_message,
    has_native_upsell,
    has_native_upsell_product,
    show_cnpj,
    enable_two_cards_payment,
    suppliers,
    metadata,
  },
  has_bling,
  has_tiny,
) => ({
  uuid,
  name: capitalizeName(name),
  price,
  counter,
  counter_three_steps,
  quantity,
  allow_affiliate,
  toggle_commission,
  affiliate_commission,
  sales_page_url,
  discount_pix,
  discount_billet,
  discount_card,
  thankyou_page_upsell,
  thankyou_page_card,
  thankyou_page_pix,
  thankyou_page_billet,
  dimensions,
  url_checkout: `${URL_SIXBASE_CHECKOUT}/${uuid}`,
  description: capitalizeName(description),
  alternative_name,
  shipping_text,
  allow_shipping_region,
  shipping_price_no,
  shipping_price_ne,
  shipping_price_co,
  shipping_price_so,
  shipping_price_su,
  start_offer,
  end_offer,
  classroom: resolveClassroom(classroom),
  plans: resolvePlans(plans),
  order_bumps: resolveOrderBumps(order_bumps),
  installments,
  installments_without_interest,
  shipping_type,
  shipping_price,
  require_address,
  payment_methods,
  student_pays_interest,
  payment_type,
  active,
  created_at,
  updated_at,
  banner: banner_image,
  banner_secondary: banner_image_secondary,
  banner_mobile: banner_image_mobile,
  banner_mobile_secondary: banner_image_mobile_secondary,
  offer_image,
  sidebar: sidebar_image,
  url_video_checkout,
  uuid_offer_back_redirect,
  terms,
  url_terms,
  id_shopify,
  affiliate_visible,
  refund_suppliers,
  free_sample,
  allow_coupon,
  has_bling,
  bling_sku,
  has_tiny,
  is_upsell_native: Boolean(is_upsell_native),
  is_upsell_active: Boolean(is_upsell_active),
  tiny_sku,
  last_ob_created,
  popup,
  is_plan_discount_message: Boolean(is_plan_discount_message),
  has_native_upsell: Boolean(has_native_upsell),
  has_native_upsell_product: Boolean(has_native_upsell_product),
  show_cnpj,
  enable_two_cards_payment: Boolean(enable_two_cards_payment),
  has_supplier: Array.isArray(suppliers) && suppliers.length > 0,
  metadata,
});

module.exports = class {
  constructor(data, has_bling = false, has_tiny = false) {
    this.data = data;
    this.has_bling = has_bling;
    this.has_tiny = has_tiny;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((e) =>
        serializeSingleOffer(e, this.has_bling, this.has_tiny),
      );
    }
    return serializeSingleOffer(this.data, this.has_bling, this.has_tiny);
  }
};
