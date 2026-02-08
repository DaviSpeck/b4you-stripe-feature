const { findRoleTypeByKey } = require('../../types/roles');
const Classrooms = require('../models/Classrooms');
const Order_bumps = require('../models/Order_bumps');
const Product = require('../models/Products');
const Product_offer = require('../models/Product_offer');
const Product_plans = require('../models/Product_plans');

const createProductOffer = async (productOfferObj, t = null) => {
  const product_offer = await Product_offer.create(
    productOfferObj,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return product_offer;
};
const findProductOffer = async (where) => {
  const offer = await Product_offer.findOne({
    nest: true,
    where,
    subQuery: false,
    attributes: [
      'id',
      'id_product',
      'price',
      'discount_pix',
      'discount_billet',
      'discount_card',
      'payment_methods',
      'thankyou_page_upsell',
      'thankyou_page_card',
      'thankyou_page_pix',
      'thankyou_page_billet',
      'require_address',
      'shipping_price',
      'shipping_type',
      'allow_shipping_region',
      'student_pays_interest',
      'id_classroom',
      'quantity',
      'uuid',
      'name',
      'allow_affiliate',
      'metadata',
      'offer_image',
      'shipping_price_no',
      'shipping_price_ne',
      'shipping_price_co',
      'shipping_price_so',
      'shipping_price_su',
      'dimensions',
      'default_installment',
      'is_upsell_native',
      'is_upsell_active',
      'id_upsell',
      'enable_two_cards_payment',
      'bling_sku',
    ],
    include: [
      {
        association: 'classroom',
        attributes: ['uuid', 'label', 'is_default'],
      },
      {
        association: 'offer_product',
        attributes: [
          'id',
          'id_user',
          'payment_type',
          'id_type',
          'warranty',
          'uuid',
          'name',
          'nickname',
          'support_email',
          'creditcard_descriptor',
          'content_delivery',
          'dimensions',
          'is_upsell_active'
        ],
        required: true,
        include: [
          {
            association: 'affiliate_settings',
            attributes: ['click_attribution'],
          },
          {
            association: 'producer',
            attributes: [
              'id',
              'first_name',
              'last_name',
              'full_name',
              'email',
              'verified_id',
              'created_at',
              'uuid',
            ],
          },
        ],
      },
      {
        association: 'order_bumps',
        attributes: ['id', 'uuid', 'max_quantity', 'order_bump_plan'],
        include: [
          {
            association: 'offer',
            attributes: [
              'id',
              'price',
              'id_classroom',
              'quantity',
              'uuid',
              'metadata',
              'bling_sku',
            ],
            include: [
              {
                association: 'offer_product',
                attributes: [
                  'id',
                  'id_type',
                  'uuid',
                  'nickname',
                  'name',
                  'support_email',
                  'content_delivery',
                  'id_user',
                  'dimensions',
                  'payment_type',
                ],
              },
              {
                association: 'plans',
                required: false,
                attributes: [
                  'id',
                  'uuid',
                  'price',
                  'subscription_fee',
                  'charge_first',
                  'subscription_fee_price',
                  'frequency_quantity',
                  'payment_frequency',
                ],
              },
            ],
          },
        ],
      },
      {
        association: 'plans',
        attributes: [
          'id',
          'uuid',
          'price',
          'subscription_fee',
          'charge_first',
          'subscription_fee_price',
          'frequency_quantity',
          'payment_frequency',
        ],
      },
    ],
  });

  if (offer) return offer.toJSON();
  return offer;
};

const findProductOfferForCart = async (where) => {
  const offer = await Product_offer.findOne({
    nest: true,
    where,
    subQuery: false,
    attributes: [
      'id',
      'uuid',
      'terms',
      'url_terms',
      'id_product',
      'description',
      'start_offer',
      'end_offer',
      'installments',
      'shipping_type',
      'shipping_price',
      'price',
      'discount_pix',
      'discount_billet',
      'discount_card',
      'payment_methods',
      'thankyou_page_upsell',
      'require_address',
      'student_pays_interest',
      'counter',
      'quantity',
      'name',
      'banner_image',
      'banner_image_secondary',
      'banner_image_mobile',
      'banner_image_mobile_secondary',
      'sidebar_image',
      'url_video_checkout',
      'uuid_offer_back_redirect',
      'hide',
      'metadata',
      'offer_image',
      'alternative_name',
      'shipping_text',
      'checkout_customizations',
      'allow_shipping_region',
      'shipping_price_no',
      'shipping_price_ne',
      'shipping_price_co',
      'shipping_price_so',
      'shipping_price_su',
      'allow_coupon',
      'counter_three_steps',
      'popup',
      'default_installment',
      'is_upsell_native',
      'is_upsell_active',
      'id_upsell',
      'is_plan_discount_message',
      'enable_two_cards_payment',
      'show_cnpj',
    ],
    include: [
      {
        association: 'offer_product',
        required: true,
        attributes: [
          'id',
          'id_user',
          'name',
          'description',
          'content_delivery',
          'cover',
          'warranty',
          'sales_page_url',
          'support_email',
          'support_whatsapp',
          'logo',
          'id_type',
          'excerpt',
          'hex_color',
          'sidebar_picture',
          'header_picture',
          'header_picture_mobile',
          'favicon',
          'second_header_mobile',
          'payment_type',
          'second_header',
          'url_video_checkout',
          'secure_email',
        ],
        include: [
          {
            association: 'pixels',
            required: false,
            attributes: ['id', 'id_type', 'uuid', 'settings'],
            where: {
              id_role: [
                findRoleTypeByKey('producer').id,
                findRoleTypeByKey('coproducer').id,
              ],
            },
          },
          {
            association: 'affiliate_settings',
            attributes: ['click_attribution'],
          },
          {
            association: 'producer',
            attributes: [
              'id',
              'full_name',
              'verified_id',
              'verified_pagarme',
              'verified_company_pagarme',
              'verified_pagarme_3',
              'verified_company_pagarme_3',
            ],
          },
        ],
      },
      {
        association: 'order_bumps',
        attributes: [
          'uuid',
          'order_bump_offer',
          'price_before',
          'label',
          'title',
          'product_name',
          'description',
          'show_quantity',
          'max_quantity',
          'cover',
          'order_bump_plan',
        ],
        include: [
          {
            association: 'offer',
            attributes: ['price', 'offer_image'],
            required: true,
            include: [
              {
                association: 'offer_product',
                required: true,
                attributes: [
                  'id_user',
                  'name',
                  'description',
                  'content_delivery',
                  'cover',
                  'warranty',
                  'sales_page_url',
                  'support_email',
                  'support_whatsapp',
                  'logo',
                  'id_type',
                  'excerpt',
                  'hex_color',
                  'sidebar_picture',
                  'header_picture',
                  'header_picture_mobile',
                  'favicon',
                  'second_header_mobile',
                  'payment_type',
                  'second_header',
                  'url_video_checkout',
                ],
              },
              {
                association: 'plans',
                attributes: [
                  'uuid',
                  'price',
                  'subscription_fee',
                  'charge_first',
                  'subscription_fee_price',
                  'frequency_quantity',
                  'payment_frequency',
                ],
              },
            ],
          },
        ],
      },
      {
        association: 'plans',
        attributes: [
          'uuid',
          'price',
          'label',
          'frequency_label',
          'subscription_fee',
          'subscription_fee_price',
          'charge_first',
        ],
      },
    ],
  });

  if (offer) return offer.toJSON();
  return offer;
};

const getProductOfferAltImage = async (id) => {
  const getOfferAltImage = await Product_offer.findOne({
    attributes: ['offer_image'],
    where: {
      id,
    },
  });

  return getOfferAltImage;
};

const updateProductOffer = async (id, offer) => {
  const updatedOffer = await Product_offer.update(offer, {
    where: {
      id,
    },
  });
  return updatedOffer;
};

const updateProductOfferMetadata = async (id, metadata) => {
  const updatedOfferMetadata = await Product_offer.update(
    { metadata },
    {
      where: {
        id,
      },
    },
  );
  return updatedOfferMetadata;
};

const updateProductOfferImage = async (id, offer_image) => {
  const updatedOfferImage = await Product_offer.update(
    { offer_image },
    {
      where: {
        id,
      },
    },
  );
  return updatedOfferImage;
};

const findAllProductOffers = async (where) =>
  Product_offer.findAll({
    raw: true,
    where,
  });

const findRawProductOffer = async (where) => {
  const offer = await Product_offer.findOne({ where, raw: true });
  return offer;
};

const findProductOfferForEcommerce = async (where) => {
  const offer = await Product_offer.findOne({
    where,
    attributes: [
      'id',
      'uuid',
      'id_product',
      'name',
      'price',
      'metadata',
      'offer_image',
      'banner_image',
      'payment_methods',
      'installments',
      'student_pays_interest',
      'discount_card',
      'discount_pix',
      'discount_billet',
      'allow_coupon',
      'enable_two_cards_payment',
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
      'thankyou_page',
      'thankyou_page_card',
      'thankyou_page_pix',
      'thankyou_page_billet',
      'url_video_checkout',
      'checkout_customizations',
      'default_installment',
      'active',
    ],
  });

  if (offer) return offer.toJSON();
  return offer;
};

const findEcommerceOfferByHash = async (idProduct, offerHash) => {
  const { sequelize } = Product_offer;

  const results = await sequelize.query(
    `SELECT id, uuid, metadata
     FROM product_offer
     WHERE id_product = :idProduct
     AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.h_offer')) = :offerHash
     AND deleted_at IS NULL
     LIMIT 1`,
    {
      replacements: { idProduct, offerHash },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  return (results && results.length > 0) ? results[0] : null;
};

const findLastProductOffer = async (where) => {
  const offer = await Product_offer.findOne({
    where,
    raw: true,
    order: [['created_at', 'DESC']],
  });
  return offer;
};

const findProductOffers = async (where) => {
  const offers = await Product_offer.findAndCountAll({
    distinct: true,
    subQuery: false,
    nest: true,
    where,
    order: [['id', 'desc']],
    include: [
      {
        model: Order_bumps,
        as: 'order_bumps',
        include: [
          {
            association: 'offer',
            required: false,
            where: {
              active: true,
            },
            include: [
              {
                association: 'classroom',
              },
              {
                association: 'offer_product',
                required: true,
                paranoid: true,
              },
            ],
          },
        ],
      },
      {
        model: Classrooms,
        as: 'classroom',
      },
      {
        model: Product_plans,
        as: 'plans',
      },
    ],
  });
  return offers;
};

const deleteProductOffer = async (where) => Product_offer.destroy({ where });

const findOfferPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const offers = await Product_offer.findAndCountAll({
    where,
    offset,
    limit,
    include: [
      {
        association: 'product',
        include: [
          {
            association: 'coproductions',
          },
        ],
      },
    ],
  });
  return offers;
};

const findOfferWithPlans = async (where) =>
  Product_offer.findOne({
    where,
    include: [
      {
        model: Product_plans,
        as: 'plans',
      },
      {
        model: Order_bumps,
        as: 'order_bumps',
      },
    ],
  });

const findOfferWithOrderBumps = async (where) =>
  Product_offer.findOne({
    where,
    include: [
      {
        model: Order_bumps,
        as: 'order_bumps',
      },
    ],
  });

const findSingleOffer = async (where) =>
  Product_offer.findOne({
    where,
    include: [
      {
        association: 'offer_product',
        include: [
          {
            association: 'affiliate_settings',
          },
        ],
      },
    ],
    nest: true,
  });

const findOfferForUpsellAndOrderBump = async ({ offer_id, id_user }) =>
  Product_offer.findOne({
    nest: true,
    where: {
      uuid: offer_id,
    },
    include: [
      {
        association: 'offer_product',
        where: {
          id_user,
        },
      },
    ],
  });

const findOfferWithUpsellAndOrderBumps = async (where) =>
  Product_offer.findOne({
    nest: true,
    where,
    include: [
      {
        association: 'upsell',
      },
      {
        association: 'order_bumps',
        include: [
          {
            association: 'offer',
          },
        ],
      },
    ],
  });

const findOfferWithPixels = async (where) => {
  const offer = await Product_offer.findOne({
    nest: true,
    where,
    subQuery: false,
    include: [
      {
        model: Product,
        as: 'offer_product',
        required: true,
        include: [
          {
            association: 'pixels',
          },
        ],
      },
    ],
  });

  if (offer) return offer.toJSON();
  return offer;
};

const findOneOffer = async (where) => {
  const offer = await Product_offer.findOne({
    where,
    include: [
      {
        association: 'offer_product',
        required: true,
        attributes: ['id_user'],
        include: [
          {
            association: 'affiliate_settings',
            attributes: ['click_attribution'],
          },
        ],
      },
    ],
  });

  if (offer) return offer.toJSON();
  return offer;
};

const findOfferPaginatedLinks = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const offers = await Product_offer.findAndCountAll({
    where,
    offset,
    limit,
    attributes: ['name', 'price', 'uuid'],
  });
  return offers;
};

const findOffersCoupon = async (where) => {
  const offers = await Product_offer.findAll({
    where,
    attributes: ['name', 'price', 'uuid'],
  });
  return offers;
};

const updateProductOfferWhere = async (where, data) => {
  const updatedOffer = await Product_offer.update(data, { where });
  return updatedOffer;
};

module.exports = {
  findOffersCoupon,
  findOfferPaginatedLinks,
  createProductOffer,
  deleteProductOffer,
  findAllProductOffers,
  findOfferForUpsellAndOrderBump,
  findOfferWithOrderBumps,
  findOfferWithPixels,
  findOfferWithPlans,
  findOfferWithUpsellAndOrderBumps,
  findOneOffer,
  findProductOffer,
  findProductOffers,
  findSingleOffer,
  updateProductOffer,
  updateProductOfferWhere,
  findOfferPaginated,
  findRawProductOffer,
  findProductOfferForCart,
  updateProductOfferMetadata,
  updateProductOfferImage,
  findLastProductOffer,
  getProductOfferAltImage,
  findProductOfferForEcommerce,
  findEcommerceOfferByHash,
};
