const { findType } = require('../../types/commissionsAffiliatesRules');
const { capitalizeName } = require('../../utils/formatters');
const { findProductMarketStatus } = require('../../status/productMarketStatus');

const serializeCoproductions = (coproductions) =>
  coproductions.map(
    ({ commission_percentage, user: { first_name, last_name } }) => ({
      commission_percentage,
      name: capitalizeName(`${first_name} ${last_name}`),
    }),
  );

const resolveOffers = (offers) => {
  if (offers.length === 0)
    return {
      count: 0,
      max_price: 0,
    };

  const { price: max_price } = offers.reduce((prev, current) =>
    prev.price > current.price ? prev : current,
  );
  return {
    count: offers.length,
    max_price,
  };
};

const serializeIntegrationAffiliateSettings = (settings) => {
  const {
    manual_approve,
    email_notification,
    show_customer_details,
    list_on_market,
    support_email,
    description,
    general_rules,
    commission,
    click_attribution,
    cookies_validity,
    url_promotion_material,
    uuid,
    coproductions,
    allow_affiliate,
    product_offer,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
    allow_access,
    id_status_market,
  } = settings;
  return {
    uuid,
    manual_approve,
    email_notification,
    show_customer_details,
    list_on_market,
    support_email,
    description,
    general_rules,
    commission,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
    allow_affiliate,
    click_attribution: click_attribution
      ? findType(click_attribution).name
      : null,
    cookies_validity,
    url_promotion_material,
    invite_link: `${process.env.SIXBASE_URL_INVITE}${uuid}`,
    coproductions: serializeCoproductions(coproductions),
    offers: resolveOffers(product_offer),
    allow_access,
    status_market: findProductMarketStatus(id_status_market),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeIntegrationAffiliateSettings);
    }
    return serializeIntegrationAffiliateSettings(this.data);
  }
};
