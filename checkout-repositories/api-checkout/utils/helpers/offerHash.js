const crypto = require('crypto');

const generateOfferHash = (offerData, orderBumps = []) => {
  // Normalize order bumps for hash (only IDs matter for uniqueness)
  const normalizedBumps = Array.isArray(orderBumps)
    ? orderBumps
        .map((b) => b.order_bump_offer || b.id_bump_offer || b.id)
        .filter(Boolean)
        .sort((a, b) => a - b)
    : [];

  const hashableFields = {
    id_product: offerData.id_product,
    name: offerData.name || '',
    description: offerData.description || '',
    price: parseFloat(offerData.price) || 0,

    // Payment settings
    payment_methods: offerData.payment_methods || '',
    installments: offerData.installments || 0,
    default_installment: offerData.default_installment || null,
    discount_card: parseFloat(offerData.discount_card) || 0,
    discount_pix: parseFloat(offerData.discount_pix) || 0,
    discount_billet: parseFloat(offerData.discount_billet) || 0,
    student_pays_interest: !!offerData.student_pays_interest,
    allow_coupon: offerData.allow_coupon !== undefined ? !!offerData.allow_coupon : true,
    enable_two_cards_payment: !!offerData.enable_two_cards_payment,

    // Shipping settings
    shipping_type: offerData.shipping_type || 0,
    shipping_price: parseFloat(offerData.shipping_price) || 0,
    shipping_text: offerData.shipping_text || '',
    shipping_region: offerData.shipping_region || null,
    require_address: !!offerData.require_address,
    allow_shipping_region: offerData.allow_shipping_region || 0,
    shipping_price_no: parseFloat(offerData.shipping_price_no) || 0,
    shipping_price_ne: parseFloat(offerData.shipping_price_ne) || 0,
    shipping_price_co: parseFloat(offerData.shipping_price_co) || 0,
    shipping_price_su: parseFloat(offerData.shipping_price_su) || 0,
    shipping_price_so: parseFloat(offerData.shipping_price_so) || 0,

    // Thank you pages & upsell
    thankyou_page: offerData.thankyou_page || '',
    thankyou_page_card: offerData.thankyou_page_card || '',
    thankyou_page_pix: offerData.thankyou_page_pix || '',
    thankyou_page_billet: offerData.thankyou_page_billet || '',
    thankyou_page_upsell: offerData.thankyou_page_upsell || '',
    id_upsell: offerData.id_upsell || null,
    is_upsell_active: !!offerData.is_upsell_active,
    is_upsell_native: !!offerData.is_upsell_native,

    // Checkout customizations
    url_video_checkout: offerData.url_video_checkout || '',
    counter: offerData.counter || null,
    counter_three_steps: offerData.counter_three_steps || null,
    popup: offerData.popup || null,
    checkout_customizations: offerData.checkout_customizations || {},
    terms: offerData.terms || null,
    url_terms: offerData.url_terms || '',
    type_exibition_value: offerData.type_exibition_value || null,
    is_plan_discount_message: !!offerData.is_plan_discount_message,
    show_cnpj: !!offerData.show_cnpj,

    // Other
    offer_image: offerData.offer_image || null,
    metadata: offerData.metadata || {},
    dimensions: offerData.dimensions || {},
    allow_affiliate: !!offerData.allow_affiliate,

    // Order bumps (detect config changes)
    order_bump_ids: normalizedBumps,
  };

  const sortedKeys = Object.keys(hashableFields).sort();
  const normalizedObject = {};
  sortedKeys.forEach((key) => {
    normalizedObject[key] = hashableFields[key];
  });

  const jsonString = JSON.stringify(normalizedObject);

  const hash = crypto.createHash('sha256').update(jsonString, 'utf8').digest('hex');

  return hash;
};

const isValidOfferHash = (hash) => {
  if (typeof hash !== 'string') return false;
  return /^[a-f0-9]{64}$/i.test(hash);
};

module.exports = {
  generateOfferHash,
  isValidOfferHash,
};
