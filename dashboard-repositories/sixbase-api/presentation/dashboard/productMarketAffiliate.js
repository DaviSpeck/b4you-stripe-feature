const { slugify, capitalizeName } = require('../../utils/formatters');
const { findType } = require('../../types/commissionsAffiliatesRules');
const { findAffiliateStatus, affiliateStatus } = require('../../status/affiliateStatus');
const { findProductPageTypeByID } = require('../../types/productPagesTypes');
const DateHelper = require('../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const { availableType } = require('../../types/checkoutTypes');
const { findShortLink } = require('../../database/controllers/short_links');
const { findOwnerType } = require('../../types/ownerTypes');

const [, APPROVED] = affiliateStatus;

const serializeAffiliate = (affiliate) => {
  if (!affiliate) return null;
  return findAffiliateStatus(affiliate.status);
};

const resolvePrices = (offers) => {
  const all = offers.map(({ plans }) => plans).flat();
  if (all.length === 0) return [0, 0];
  const ord = all.sort((a, b) => b.price - a.price);
  return [ord[0].price, ord[ord.length - 1].price];
};

const resolveMinAndMaxPrice = (offers) => {
  const ord = offers.sort((a, b) => b.price - a.price);
  return [ord[0].price, ord[ord.length - 1].price];
};

const serializeProductPages = async (pages, affiliate, is_producer, is_coproducer) => {
  if (is_producer || is_coproducer) {
    return pages.map((p) => ({
      uuid: p.uuid,
      label: capitalizeName(p.label),
      type: findProductPageTypeByID(p.id_type).label,
      url: p.url,
      short_link: null,
    }));
  }

  if (!affiliate || affiliate.status !== APPROVED.id) return null;

  const results = [];

  /* eslint-disable no-await-in-loop */
  for (const p of pages) {
    const url = `${process.env.SIXBASE_URL_PRODUCT}/pages/${p.uuid}/${affiliate.uuid}`;

    const found = await findShortLink({
      type: "PAGE",
      owner_type: findOwnerType("affiliate").id,
      owner_uuid: affiliate.uuid,
      page_uuid: p.uuid,
    });

    results.push({
      uuid: p.uuid,
      label: capitalizeName(p.label),
      type: findProductPageTypeByID(p.id_type).label,
      url,
      short_link: found,
    });
  }
  /* eslint-enable no-await-in-loop */

  return results;
};

const isProducer = (id_user, id_producer) => id_user === id_producer;

const isCoproducer = (id_user, coproductions) =>
  !!coproductions.find((c) => c.id_user === id_user);

const resolveCommissionPrice = (plans) => {
  const ord = plans.sort((a, b) => b.price - a.price);
  return ord[0].price;
};

const serializeAffiliateOffers = async (affiliate, offers, product, is_producer, is_coproducer) => {
  if (!(is_producer || is_coproducer || (affiliate && affiliate.status === APPROVED.id))) {
    return [];
  }

  const offerPlans = offers.map(({ plans }) => plans).flat();
  if (product.payment_type === "subscription" && offerPlans.length === 0) return [];

  const results = [];

  /* eslint-disable no-await-in-loop */
  for (const offer of offers) {
    const { uuid, name, price, plans, toggle_commission, affiliate_commission, shipping_type, shipping_price } = offer;

    let price_commission = plans.length > 0 ? resolveCommissionPrice(plans) : price;
    if (shipping_type === 1) price_commission += shipping_price;

    const url = is_producer || is_coproducer
      ? `${process.env.URL_SIXBASE_CHECKOUT}/${uuid}`
      : `${process.env.URL_SIXBASE_CHECKOUT_PV}/api/product/c/${uuid}/${affiliate.uuid}`;

    let short_link = null;

    if (!is_producer && !is_coproducer && affiliate) {
      short_link = await findShortLink({
        type: "OFFER",
        owner_type: findOwnerType("affiliate").id,
        owner_uuid: affiliate.uuid,
        offer_uuid: uuid,
      });
    }

    const comm = toggle_commission || is_producer || is_coproducer
      ? affiliate_commission
      : affiliate.commission;

    let commission_amount = affiliate
      ? price_commission * (comm / 100)
      : price_commission;

    if (commission_amount > price_commission - 2 - price_commission * 0.069) {
      commission_amount -= 2;
      commission_amount -= commission_amount * 0.069;
    }

    results.push({
      uuid,
      url,
      short_link,
      label: capitalizeName(name),
      price: price_commission,
      commission_percentage: affiliate ? comm : 0,
      commission_amount: commission_amount - 0.01,
    });
  }
  /* eslint-enable no-await-in-loop */

  return results;
};

const serializeProductAffiliateMarket = async (product, id_user, created_at) => {
  const {
    id,
    uuid,
    name,
    logo,
    cover,
    excerpt,
    affiliate,
    sales_page_url,
    product_offer,
    coproductions,
    payment_type,
    support_email,
    affiliate_images,
    available_checkout_link_types,
    producer,
    affiliateSettings,
    pages,
  } = product;

  const { full_name, profile_picture, id: id_producer, uuid: uuid_producer } = producer;

  const {
    click_attribution,
    commission,
    cookies_validity,
    general_rules,
    manual_approve,
    description,
    url_promotion_material,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
  } = affiliateSettings;

  let max_price = 0;
  let min_price = 0;

  if (payment_type === "subscription" && product_offer?.length > 0) {
    [max_price, min_price] = resolvePrices(product_offer);
  } else if (product_offer?.length > 0) {
    [max_price, min_price] = resolveMinAndMaxPrice(product_offer);
  }

  const is_producer = isProducer(id_user, id_producer);
  const is_coproducer = isCoproducer(id_user, coproductions);

  const allPlans = product_offer.map(({ plans }) => plans).flat();
  const hasPlans = allPlans.length > 0;
  const highestOffer = product_offer.sort((a, b) => b.price - a.price)[0];

  const maxPrice = hasPlans
    ? allPlans.sort((a, b) => b.price - a.price)[0].price
    : highestOffer.price + (highestOffer.shipping_type === 1 ? highestOffer.shipping_price : 0);

  const offers = await serializeAffiliateOffers(
    affiliate,
    product_offer,
    product,
    is_producer,
    is_coproducer
  );

  let max_commission = Number(((maxPrice * commission) / 100).toFixed(2));

  if (affiliate && offers.length > 0) {
    max_commission = offers.sort((a, b) => b.commission_amount - a.commission_amount)[0].commission_amount;
  }

  return {
    id,
    uuid,
    name,
    slug: slugify(name),
    cover,
    logo,
    excerpt,
    description,
    url_promotion_material,
    support_email,
    affiliate: affiliate
      ? {
        id: affiliate.id,
        uuid: affiliate.uuid,
        status: affiliate.status,
        commission: affiliate.commission,
      }
      : null,
    affiliate_status: serializeAffiliate(affiliate),
    is_producer,
    is_coproducer,
    sales_page_url,
    producer: {
      uuid: uuid_producer,
      name: capitalizeName(full_name),
      profile_picture,
      created_at: DateHelper(created_at).format(FRONTEND_DATE_WITHOUT_TIME),
    },
    general_rules,
    manual_approve,
    click_attribution: findType(click_attribution).label,
    cookies_validity,
    commission_percentage: affiliate ? affiliate.commission : commission,
    max_commission,
    max_price,
    min_price,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
    pages: await serializeProductPages(pages, affiliate, is_producer, is_coproducer),
    offers,
    affiliate_images: affiliate_images.map((img) => ({
      uuid: img.uuid,
      file: img.file,
      key: img.key,
    })),
    available_checkout_link_types: availableType[available_checkout_link_types],
  };
};

module.exports = class {
  constructor(data, id_user, created_at) {
    this.data = data;
    this.id_user = id_user;
    this.created_at = created_at;
  }

  async adapt() {
    if (!this.data) throw new Error("Expect data to be not undefined or null");

    if (Array.isArray(this.data)) {
      return Promise.all(
        this.data.map((product) =>
          serializeProductAffiliateMarket(product, this.id_user, this.created_at)
        )
      );
    }

    return serializeProductAffiliateMarket(this.data, this.id_user, this.created_at);
  }
};