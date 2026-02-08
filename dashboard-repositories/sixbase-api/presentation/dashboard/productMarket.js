const { resolveType, resolveProductCategoriesById } = require('../common');
const { slugify, capitalizeName } = require('../../utils/formatters');
const { findType } = require('../../types/commissionsAffiliatesRules');

const serializeProductsMarket = (product) => {
  const {
    uuid,
    name,
    id_type,
    cover,
    excerpt,
    category,
    producer: { first_name, last_name },
    affiliate_settings: { commission, click_attribution, cookies_validity },
    product_offer,
  } = product;
  let min_offer_price = 0;
  let max_offer_price = 0;
  if (product_offer.length > 0) {
    min_offer_price = product_offer.reduce(
      (min, b) => Math.min(min, b.price),
      product_offer[0].price,
    );
    max_offer_price = product_offer.reduce(
      (max, b) => Math.max(max, b.price),
      product_offer[0].price,
    );
  }
  return {
    uuid,
    name,
    slug: slugify(name),
    type: resolveType(id_type),
    category: resolveProductCategoriesById(category),
    cover,
    excerpt,
    producer_name: capitalizeName(`${first_name} ${last_name}`),
    commission,
    click_attribution: findType(click_attribution).label,
    cookies_validity,
    min_offer_price,
    max_offer_price,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeProductsMarket);
    }
    return serializeProductsMarket(this.data);
  }
};
