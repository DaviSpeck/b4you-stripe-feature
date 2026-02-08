const Sequelize = require('sequelize');
const Classrooms = require('../models/Classrooms');
const Order_bumps = require('../models/Order_bumps');
const Product = require('../models/Products');
const Product_offer = require('../models/Product_offer');
const Product_plans = require('../models/Product_plans');
const { findRoleTypeByKey } = require('../../types/roles');
const logger = require('../../utils/logger');

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
      'description',
      'payment_methods',
      'thankyou_page_upsell',
      'thankyou_page_card',
      'thankyou_page_pix',
      'thankyou_page_billet',
      'require_address',
      'shipping_price',
      'shipping_type',
      'student_pays_interest',
      'id_classroom',
      'quantity',
      'uuid',
      'installments',
      'name',
      'id_shopify',
      'affiliate_visible',
      'allow_affiliate',
      'refund_suppliers',
      'free_sample',
      'bling_sku',
      'tiny_sku',
      'metadata',
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
          'payment_type',
          'id_type',
          'warranty',
          'uuid',
          'name',
          'id_user',
          'nickname',
          'support_email',
          'creditcard_descriptor',
        ],
        required: true,
        include: [
          {
            association: 'affiliate_settings',
            attributes: ['click_attribution'],
          },
          {
            association: 'producer',
            attributes: ['id', 'first_name', 'last_name', 'full_name', 'email'],
          },
        ],
      },
      {
        association: 'order_bumps',
        attributes: ['uuid', 'price_before', 'show_quantity', 'label'],
        include: [
          {
            association: 'offer',
            attributes: ['price', 'id_classroom', 'quantity'],
            include: [
              {
                association: 'offer_product',
                attributes: [
                  'id',
                  'id_type',
                  'uuid',
                  'nickname',
                  'support_email',
                  'name',
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
      'counter_three_steps',
      'quantity',
    ],
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
        ],
      },
      {
        association: 'order_bumps',
        attributes: ['uuid', 'price_before', 'label', 'description'],
        include: [
          {
            association: 'offer',
            attributes: ['price'],
            include: [
              {
                association: 'offer_product',
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

const updateProductOffer = async (id, offer) => {
  logger.info(`offer: ${JSON.stringify(offer)}`);
  const updatedOffer = await Product_offer.update(offer, {
    where: {
      id,
    },
  });
  return updatedOffer;
};

const updateProductOfferWhere = async (where, data) => {
  const updatedOffer = await Product_offer.update(data, {
    where,
  });
  return updatedOffer;
};

const findAllProductOffers = async (where) =>
  Product_offer.findAll({
    raw: true,
    where,
  });

const findRawProductOffer = async (where) => {
  const offer = await Product_offer.findOne({
    where,
    raw: true,
    include: [
      {
        model: Product_plans,
        as: 'plans',
        required: false,
      },
    ],
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
        association: 'order_bumps',
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

const findProductOffersPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const [count, rows] = await Promise.all([
    Product_offer.count({ where }),
    Product_offer.findAll({
      nest: true,
      where,
      order: [['id', 'desc']],
      offset,
      limit,
      attributes: {
        include: [
          [
            Sequelize.literal(`EXISTS (
              SELECT 1
              FROM upsell_native_offer uno
              WHERE uno.offer_id = product_offer.id
            )`),
            'has_native_upsell',
          ],
          [
            Sequelize.literal(`EXISTS (
              SELECT 1
              FROM upsell_native_product unp
              WHERE unp.product_id = product_offer.id_product
            )`),
            'has_native_upsell_product',
          ],
        ],
      },
      include: [
        {
          association: 'order_bumps',
          subQuery: false,
          separate: true,
          attributes: [
            'uuid',
            'title',
            'product_name',
            'label',
            'description',
            'price_before',
            'show_quantity',
            'id_offer',
            'max_quantity',
            'cover',
            'order_bump_plan',
          ],
          include: [
            {
              association: 'offer',
              attributes: ['uuid', 'name', 'price', 'id_product', 'id'],
              required: true,
              paranoid: true,
              where: {
                active: true,
              },
              include: [
                {
                  association: 'classroom',
                  attributes: ['label', 'uuid', 'is_default'],
                },
                {
                  association: 'offer_product',
                  attributes: [
                    'uuid',
                    'name',
                    'cover',
                    'id_user',
                    'id',
                    'payment_type',
                  ],
                  required: true,
                  paranoid: true,
                },
                {
                  association: 'plans',
                  attributes: ['uuid', 'label', 'price'],
                },
              ],
            },
          ],
        },
        {
          association: 'classroom',
          attributes: ['label', 'uuid', 'is_default'],
        },
        {
          association: 'plans',
          attributes: [
            'uuid',
            'label',
            'price',
            'frequency_label',
            'subscription_fee',
            'subscription_fee_price',
            'charge_first',
          ],
        },
        {
          association: 'suppliers', 
          attributes: ['id'], 
        },
      ],
    }),
  ]);

  return { count, rows };
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

const findOffersBackRedirect = async (where) => {
  const offers = await Product_offer.findAll({
    where,
    attributes: ['name', 'price', 'uuid'],
    include: [
      {
        model: Product_plans,
        as: 'plans',
        required: false,
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
      {
        association: 'plans',
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

const findOneOffer = async (where) => Product_offer.findOne({ where });

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

const findOffersCouponDesc = async (where) => {
  const offers = await Product_offer.findAll({
    where,
    attributes: ['id', 'name', 'price', 'uuid'],
    order: [['id', 'DESC']],
  });
  return offers;
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
  findOfferPaginated,
  findRawProductOffer,
  findProductOfferForCart,
  findOffersBackRedirect,
  updateProductOfferWhere,
  findProductOffersPaginated,
  findOffersCouponDesc,
};
