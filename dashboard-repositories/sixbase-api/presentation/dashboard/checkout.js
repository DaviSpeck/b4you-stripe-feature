const { capitalizeName } = require('../../utils/formatters');
const { CHECKOUT_BASE_URLS } = require('../../utils/urlTransparentCheckout');

// eslint-disable-next-line arrow-body-style
const SerializeCheckoutAbandoned = (
  user_id,
  {
    uuid,
    product,
    sale_item,
    offer,
    email,
    full_name,
    whatsapp,
    updated_at,
    id_affiliate,
    address,
    coupon,
  },
) => {
  const isAffiliated =
    sale_item?.id_affiliate === user_id || id_affiliate === user_id;
  const productModel = product.dataValues;
  delete productModel.products_affiliations;

  const [affiliate] = product.affiliates;

  let checkout = null;
  let checkoutWithCoupon = null;
  const baseUrl =
    CHECKOUT_BASE_URLS[product.id] || process.env.URL_SIXBASE_CHECKOUT;
  if (isAffiliated && offer?.uuid && affiliate) {
    checkout = `${process.env.URL_SIXBASE_CHECKOUT_PV}/api/product/cart/${offer.uuid}/${affiliate.uuid}/${uuid}`;
  } else if (offer?.uuid) {
    checkout = `${baseUrl}/carrinho/${uuid}/${offer.uuid}`;
  }

  if (checkout && coupon?.code) {
    checkoutWithCoupon = `${checkout}?cupom=${coupon?.code}`;
  }

  return {
    uuid,
    full_name: capitalizeName(full_name),
    email,
    whatsapp,
    updated_at,
    offer,
    isAffiliated,
    checkout,
    checkoutWithCoupon,
    id_affiliate,
    address,
    coupon,
    ...(productModel && {
      product: productModel,
    }),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt(user_id) {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((data) => SerializeCheckoutAbandoned(user_id, data));
    }
    return SerializeCheckoutAbandoned(user_id, this.data);
  }
};
