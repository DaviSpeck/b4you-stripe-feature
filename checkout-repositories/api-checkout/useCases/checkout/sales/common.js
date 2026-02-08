const { Op } = require('sequelize');
const dateHelper = require('../../../utils/helpers/date');
const { creditCardBrandParser } = require('../../../utils/card');
const { validateCouponOffers } = require('./validateCouponOffers');
const Affiliates = require('../../../database/models/Affiliates');
const CommissionsProvider = require('../../common/splits/CalculateProviderCommissions');
const Users = require('../../../database/models/Users');
const redis = require('../../../config/redis');
const ApiError = require('../../../error/ApiError');
const Coupons = require('../../../database/models/Coupons');
const Cache = require('../../../config/Cache');
const date = require('../../../utils/helpers/date');

const offersInclude = {
  association: 'offers',
  attributes: ['id'],
  through: { attributes: [] },
};

/**
 * Normalizes coupon data from Sequelize model or plain object
 * @param {Object|null} coupon - Coupon object (Sequelize model or plain object)
 * @returns {Object|null} Normalized coupon object or null
 */
const normalizeCoupon = (coupon) => {
  if (!coupon) return null;

  const baseCoupon =
    typeof coupon.get === 'function' ? coupon.get({ plain: true }) : coupon;

  return {
    ...baseCoupon,
    offers: Array.isArray(baseCoupon.offers)
      ? baseCoupon.offers.map(({ id }) => ({ id }))
      : [],
    restrict_offers: !!baseCoupon.restrict_offers,
  };
};

/**
 * Checks if a payment method is allowed for a coupon
 * @param {Object|null} couponData - Coupon data object
 * @param {string} payment_method - Payment method to check
 * @returns {boolean} True if payment method is allowed
 */
const paymentMethodAllowed = (couponData, payment_method) => {
  if (!couponData || !couponData.payment_methods) return false;
  return couponData.payment_methods.includes(payment_method);
};

/**
 * Finds and validates a coupon by code, product, and payment method
 * Uses cache for performance optimization
 * @param {Object} params - Search parameters
 * @param {string} params.couponCode - Coupon code to search
 * @param {number} params.id_product - Product ID
 * @param {string} params.payment_method - Payment method to validate
 * @returns {Promise<Object|null>} Coupon object if found and valid, null otherwise
 */
const findCoupon = async ({ couponCode, id_product, payment_method }) => {
  if (!couponCode) return null;
  const key = `coupon_${couponCode}_${id_product}`;
  const cachedCoupon = await Cache.get(key);
  if (cachedCoupon) {
    const couponData = normalizeCoupon(JSON.parse(cachedCoupon));
    if (couponData.expires_at && date().diff(couponData.expires_at) >= 0) {
      await Cache.del(key);
      return null;
    }
    if (!paymentMethodAllowed(couponData, payment_method)) {
      return null;
    }
    return couponData;
  }
  const coupon = await Coupons.findOne({
    where: {
      coupon: couponCode,
      id_product,
      payment_methods: {
        [Op.like]: `%${payment_method}%`,
      },
      active: true,
      expires_at: {
        [Op.or]: {
          [Op.gte]: dateHelper().now(),
          [Op.eq]: null,
        },
      },
    },
    include: [offersInclude],
  });
  if (!coupon) return null;
  const normalizedCoupon = normalizeCoupon(coupon);
  await Cache.set(key, JSON.stringify(normalizedCoupon));
  return normalizedCoupon;
};

/**
 * Checks if a student has already bought a specific product
 * @param {Array<Object>} studentProducts - Array of products the student has purchased
 * @param {Object} product - Product object to check
 * @param {number} product.id - Product ID
 * @returns {Object|undefined} Product if found, undefined otherwise
 */
const studentAlreadyBoughtProduct = (studentProducts, { id }) =>
  studentProducts.find(({ id_product }) => id_product === id);

/**
 * Calculates refund expiration date based on warranty days
 * @param {number} warranty - Number of warranty days
 * @returns {Date} Date when refund expires
 */
const calculateRefund = (warranty) => dateHelper().add(warranty, 'days');

/**
 * Serializes card expiration date from MM/YY to MM/YYYY format
 * @param {string} expirationDate - Expiration date in MM/YY format
 * @returns {string} Expiration date in MM/YYYY format
 */
const serializeExpirationDate = (expirationDate) => {
  const [month, year] = expirationDate.split('/');
  return `${month}/${2000 + Number(year)}`;
};

/**
 * Extracts and formats card data for storage
 * @param {Object} card - Card object
 * @param {string} card.card_number - Full card number
 * @param {string} card.expiration_date - Expiration date in MM/YY format
 * @returns {Object} Formatted card data with last four digits, brand, and expiration
 */
const cardDataToStore = ({ card_number, expiration_date }) => ({
  last_four: card_number.slice(12),
  brand: creditCardBrandParser(card_number),
  expiration_date: serializeExpirationDate(expiration_date),
});

/**
 * Resolves upsell URL with sale item ID and installments parameters
 * @param {string|null} thankyouPage - Thank you page URL
 * @param {string} saleItemUUID - Sale item UUID
 * @param {number|null} [last_installments=null] - Number of installments
 * @returns {string|null} Complete upsell URL or null if thankyouPage is not provided
 */
const resolveUpsellURL = (
  thankyouPage,
  saleItemUUID,
  last_installments = null,
) => {
  if (!thankyouPage) return null;
  if (thankyouPage.includes('?'))
    return `${thankyouPage}&sale_item_id=${saleItemUUID}&last_installments=${last_installments}`;
  return `${thankyouPage}?sale_item_id=${saleItemUUID}&last_installments=${last_installments}`;
};

/**
 * Sums amounts by user ID from nested arrays
 * @param {Array<Array<Object>>} data - Nested array of objects with id_user and amount
 * @returns {Array<Object>} Array of objects with summed amounts per user
 */
const sumAmountsById = (data) => {
  const result = {};

  data.flat().forEach((item) => {
    if (result[item.id_user]) {
      result[item.id_user] += item.amount;
    } else {
      result[item.id_user] = item.amount;
    }
  });

  return Object.keys(result).map((id) => ({
    id_user: parseInt(id, 10),
    amount: Number(result[id]),
  }));
};

/**
 * Calculates provider commissions for sales items
 * Handles affiliate commissions and provider splits
 * @param {Object} params - Commission calculation parameters
 * @param {Array<Object>} params.salesItemsToSplit - Array of sale items to calculate commissions for
 * @param {Object|null} params.affiliate - Affiliate object if applicable
 * @param {string} params.user_field_cpf - User field name for CPF recipient ID
 * @param {string} params.user_field_cnpj - User field name for CNPJ recipient ID
 * @param {string} params.user_field_status_cpf - User field name for CPF verification status
 * @param {string} params.user_field_status_cnpj - User field name for CNPJ verification status
 * @param {Object} params.product - Product object
 * @param {string} params.shipping_type - Shipping type
 * @returns {Promise<Array<Object>>} Array of commission objects for payment gateway split
 */
const providerCommissions = async ({
  salesItemsToSplit,
  affiliate,
  user_field_cpf,
  user_field_cnpj,
  user_field_status_cpf,
  user_field_status_cnpj,
  product,
  shipping_type,
}) => {
  const commissionsToSplit = [];
  for await (const s of salesItemsToSplit) {
    let productAffiliate = null;
    if (affiliate) {
      productAffiliate = await Affiliates.findOne({
        raw: true,
        nest: true,
        where: {
          id_user: affiliate.id_user,
          id_product: s.product.id,
          status: 2,
        },
      });
    }
    const data = await CommissionsProvider.calculate({
      affiliate: productAffiliate,
      sale_item: s,
      shipping_type,
    });
    commissionsToSplit.push(data);
  }
  const totalCommissions = sumAmountsById(commissionsToSplit);
  const users = [];
  for await (const { id_user } of totalCommissions) {
    const key = `user_${process.env.ENVIRONMENT}_${id_user}`;
    const cachedUser = await redis.get(key);
    if (cachedUser) {
      // eslint-disable-next-line
      console.log('cached user -> ', cachedUser);
      users.push(JSON.parse(cachedUser));
    } else {
      const user = await Users.findOne({
        raw: true,
        attributes: [
          'verified_company_pagarme',
          'verified_pagarme',
          'pagarme_recipient_id_cnpj',
          'pagarme_recipient_id',
          'verified_company_pagarme_3',
          'verified_pagarme_3',
          'pagarme_recipient_id_cnpj_3',
          'pagarme_recipient_id_3',
          'id',
        ],
        where: {
          id: id_user,
        },
      });
      users.push(user);
    }
  }
  const allCommissions = [];
  for await (const item of totalCommissions) {
    const match = users.find((element) => element.id === item.id_user);
    if (!match) {
      allCommissions.push(null);
    }
    const idSeller =
      // eslint-disable-next-line
      match[user_field_status_cnpj] === 3
        ? match[user_field_cnpj]
        : match[user_field_status_cpf] === 3
        ? match[user_field_cpf]
        : null;
    if (idSeller === null) {
      throw ApiError.badRequest('Recebedor não verificado');
    }
    await redis.set(
      `user_${process.env.ENVIRONMENT}_${item.id_user}`,
      JSON.stringify(match),
      'EX',
      1800,
    );
    allCommissions.push({
      is_seller: match.id === product.id_user,
      id_user: item.id_user,
      id_seller: idSeller,
      amount: item.amount,
    });
  }
  allCommissions.filter(Boolean);
  return allCommissions;
};

const ensureCouponOfferAllowed = (coupon, id_offer) => {
  if (!coupon) {
    return null;
  }
  const { coupon: validatedCoupon, isAllowed } = validateCouponOffers(
    coupon,
    id_offer,
  );

  if (!isAllowed) {
    return null;
  }

  return validatedCoupon;
};

const resolveShippingPrice = ({
  shipping_type,
  integration_shipping_price,
  shipping_region_price,
  shipping_price,
  has_freenet = false,
}) => {
  if (shipping_type === 0) {
    return 0;
  }
  if (has_freenet) {
    return integration_shipping_price;
  }
  if (integration_shipping_price !== null) {
    return integration_shipping_price;
  }
  if (shipping_region_price > 0) {
    return shipping_region_price;
  }

  return shipping_price;
};

module.exports = {
  resolveShippingPrice,
  studentAlreadyBoughtProduct,
  calculateRefund,
  cardDataToStore,
  resolveUpsellURL,
  providerCommissions,
  findCoupon,
  ensureCouponOfferAllowed,
};
