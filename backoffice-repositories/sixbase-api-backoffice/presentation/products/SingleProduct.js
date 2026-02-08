const {
  findClickAttributionType,
} = require('../../types/commissionsAffiliatesRules');
const { findProductCategoriesById } = require('../../types/productCategories');
const { capitalizeName } = require('../../utils/formatters');
const { findProductFormat } = require('../../types/productFormat');
const { findProductMarketStatus } = require('../../status/productMarketStatus');

const serializeOffers = (offers) => {
  if (!offers || !Array.isArray(offers)) return [];
  return offers.map(({ uuid, name, price, allow_affiliate, hide, active }) => ({
    uuid,
    name,
    price,
    allow_affiliate,
    link: `https://checkout.b4you.com.br/${uuid}`,
    hide,
    active,
  }));
};

const serializeAffiliateSettings = (affiliateSettings) => {
  if (!affiliateSettings) return null;
  const {
    manual_approve,
    support_email,
    description,
    general_rules,
    commission,
    click_attribution,
    cookies_validity,
    url_promotion_material,
    commission_all_charges,
    subscription_fee,
    subscription_fee_commission,
    subscription_fee_only,
  } = affiliateSettings;

  return {
    manual_approve,
    support_email,
    description,
    general_rules,
    commission,
    click_attribution: findClickAttributionType(click_attribution),
    cookies_validity,
    url_promotion_material,
    commission_all_charges,
    subscription_fee,
    subscription_fee_commission,
    subscription_fee_only,
  };
};

const serializeProducts = ({
  uuid,
  name,
  payment_type,
  warranty,
  id_type,
  cover,
  sales_page_url,
  support_email,
  support_whatsapp,
  logo,
  nickname,
  creditcard_descriptor,
  created_at,
  deleted_at,
  category,
  description,
  allow_affiliate,
  affiliate_settings,
  refund_average,
  product_offer,
  producer,
  list_on_market,
  id_status_market,
  recommended_market,
  recommend_market_position,
  secure_email,
}) => ({
  uuid,
  name: capitalizeName(name),
  payment_type,
  warranty_days: warranty,
  type:
    (findProductFormat(id_type) && findProductFormat(id_type).label) || null,
  cover,
  sales_page_url,
  support_email,
  support_whatsapp,
  logo,
  nickname,
  creditcard_descriptor,
  created_at,
  category: findProductCategoriesById(category),
  description,
  allow_affiliate,
  affiliate_settings: serializeAffiliateSettings(affiliate_settings),
  deleted_at,
  refund_average,
  offers: serializeOffers(product_offer),
  producer: {
    full_name: producer && producer.full_name ? producer.full_name : null,
    email: producer && producer.email ? producer.email : null,
  },
  list_on_market,
  market_status: id_status_market
    ? findProductMarketStatus(id_status_market)
    : null,
  recommended_market,
  recommend_market_position,
  secure_email,
});

module.exports = class SerializeProduct {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeProducts);
    }
    return serializeProducts(this.data);
  }
};
