const { resolveType, serializeProducer } = require('../common');
const { findType } = require('../../types/commissionsAffiliatesRules');
const dateHelper = require('../../utils/helpers/date');
const { slugify } = require('../../utils/formatters');
const { findAffiliateStatus } = require('../../status/affiliateStatus');

const countOffers = (offers) => offers.length;

const resolveRules = (product, requester) => {
  if (product.id_user === requester) return null;
  const { coproductions, affiliate_settings } = product;
  const coproducer = coproductions.find((c) => c.id_user === requester);
  if (coproducer) {
    const {
      commission_percentage,
      accepted_at,
      expires_at,
      split_invoice,
      allow_access,
    } = coproducer;
    return {
      split_invoice,
      commission: commission_percentage,
      accepted_at,
      expires_at: dateHelper(expires_at).isValid() ? expires_at : null,
      allow_access,
    };
  }
  const {
    manual_approve,
    click_attribution,
    cookies_validity,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
  } = affiliate_settings;
  const { affiliates } = product;
  const affiliate = affiliates.find((a) => a.id_user === requester);

  return {
    manual_approve,
    commission: affiliate.commission,
    allow_access: affiliate.allow_access,
    cookies_validity,
    status: findAffiliateStatus(affiliate.status),
    click_attribution: click_attribution
      ? findType(click_attribution).name
      : null,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
  };
};

const serializeSingleProduct = (product, requester) => {
  const {
    uuid,
    name,
    id_type,
    product_offer,
    payment_type,
    producer,
    nickname,
    biography,
  } = product;
  return {
    uuid,
    name,
    slug: slugify(name),
    producer: serializeProducer({
      full_name: producer.full_name,
      profile_picture: producer.profile_picture,
      nickname,
      biography,
    }),
    type: resolveType(id_type),
    active_offers: countOffers(product_offer),
    rules: resolveRules(product, requester),
    payment_type,
  };
};

module.exports = class {
  constructor(data, requester) {
    this.data = data;
    this.requester = requester;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((data) =>
        serializeSingleProduct(data, this.requester),
      );
    }
    return serializeSingleProduct(this.data, this.requester);
  }
};
