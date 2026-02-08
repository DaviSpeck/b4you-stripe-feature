const { Op } = require('sequelize');
const Classrooms = require('../models/Classrooms');
const Coproductions = require('../models/Coproductions');
const Lessons = require('../models/Lessons');
const Lessons_attachments = require('../models/Lessons_attachments');
const Modules = require('../models/Modules');
const Order_bumps = require('../models/Order_bumps');
const Product_affiliate_settings = require('../models/Product_affiliate_settings');
const Product_offer = require('../models/Product_offer');
const Products = require('../models/Products');
const Study_history = require('../models/Study_history');
const Users = require('../models/Users');
const Affiliates = require('../models/Affiliates');
const { coproductionStatus } = require('../../status/coproductionsStatus');
const Product_plans = require('../models/Product_plans');
const { SINGLE } = require('../../types/productTypes');
const {
  findProductMarketStatusByKey,
} = require('../../status/productMarketStatus');
const { productCategories } = require('../../types/productCategories');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

const [, ACTIVE] = coproductionStatus;

const createProduct = async (productObj) => {
  try {
    const product = await Products.create(productObj);
    return product;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (where) => Products.destroy({ where });

const updateProduct = async (id, productObj) => {
  const product = await Products.update(productObj, {
    where: {
      id,
    },
  });
  return product;
};
const findAllIntegrationsProducts = async (where) =>
  Products.findAll({
    where,
    raw: true,
  });

const findAllproducts = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const include = [
    {
      model: Users,
      as: 'producer',
    },
    {
      model: Product_affiliate_settings,
      as: 'affiliate_settings',
    },
    {
      model: Coproductions,
      as: 'coproductions',
      required: false,
      where: {
        status: ACTIVE.id,
      },
    },
    {
      model: Product_offer,
      as: 'product_offer',
      required: false,
      where: {
        active: true,
      },
      separate: true,
    },
    {
      model: Affiliates,
      as: 'affiliates',
      required: false,
    },
  ];
  const [count, rows] = await Promise.all([
    Products.count({
      where,
      distinct: true,
      include,
    }),
    Products.findAll({
      separate: true,
      where,
      offset,
      limit,
      nest: true,
      distinct: true,
      group: 'id',
      include,
      subQuery: false,
    }),
  ]);
  return { count, rows };
};

const findProductByStudent = async (id_student, uuid) => {
  try {
    const product = Classrooms.findOne({
      where: { id_student },
      nest: true,
      distinct: true,
      subQuery: false,
      include: [
        {
          model: Products,
          as: 'product',
          where: { uuid },
          include: [
            {
              model: Modules,
              as: 'module',
              include: [
                {
                  model: Lessons,
                  as: 'lesson',
                  include: [
                    {
                      model: Lessons_attachments,
                      as: 'lesson_attachment',
                    },
                    {
                      model: Study_history,
                      as: 'study_history',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ['product', 'id', 'ASC'],
        ['product', 'module', 'order', 'ASC'],
        ['product', 'module', 'lesson', 'order', 'ASC'],
      ],
    });
    return product;
  } catch (error) {
    throw error;
  }
};

const findProducts = async (where) => {
  const products = await Products.findAll({
    nest: true,
    where,
    include: [
      {
        model: Product_offer,
        as: 'product_offer',
        separate: true,
      },
      {
        model: Users,
        as: 'producer',
      },
    ],
  });

  return products;
};

const findProductsMarket = async (page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const products = await Products.findAndCountAll({
    where: {
      allow_affiliate: true,
      id_status_market: findProductMarketStatusByKey('active').id,
    },
    offset,
    limit,
    nest: true,
    distinct: true,
    subQuery: false,
    include: [
      {
        model: Users,
        as: 'producer',
      },
      {
        model: Product_offer,
        as: 'product_offer',
        separate: true,
        where: { active: true, allow_affiliate: true },
      },
      {
        model: Product_affiliate_settings,
        as: 'affiliate_settings',
        where: { list_on_market: true },
      },
    ],
  });
  return products;
};

const findOneProductMarket = async (uuid) => {
  const product = await Products.findOne({
    nest: true,
    where: { uuid, allow_affiliate: true },
    include: [
      {
        association: 'affiliate_images',
        required: false,
      },
      {
        association: 'producer',
        attributes: [
          'id',
          'uuid',
          'full_name',
          'profile_picture',
          'email',
          'created_at',
        ],
      },
      {
        association: 'coproductions',
        required: false,
        where: {
          status: [1, 2],
        },
      },
      {
        association: 'product_offer',
        required: false,
        where: { active: true, allow_affiliate: true, affiliate_visible: true },
        include: [
          {
            association: 'upsell',
            include: [
              {
                association: 'offer_product',
              },
            ],
          },
          {
            association: 'plans',
          },
          {
            model: Order_bumps,
            as: 'order_bumps',
            separate: true,
            include: [
              {
                association: 'offer',
                include: [
                  {
                    association: 'offer_product',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  return product ? product.toJSON() : product;
};

const findSingleProductWithProducer = async (where) => {
  const product = await Products.findOne({
    where,
    include: [
      {
        model: Users,
        as: 'producer',
      },
    ],
  });
  if (product) return product.toJSON();
  return null;
};

const findSingleProductAffiliateOrCoproducer = async (where) =>
  Products.findOne({
    where,
    subQuery: false,
    include: [
      {
        association: 'producer',
        required: false,
      },
      { association: 'coproductions', required: false },
      { association: 'affiliates', required: false },
    ],
  });

const findRawUserProducts = async (id_user) => {
  const products = await Products.findAll({
    nest: true,
    where: { id_user },
    paranoid: false,
  });

  return products;
};

const findRawUserProductsInvision = async (id_user) => {
  const products = await Products.findAll({
    nest: true,
    where: { id_user, payment_type: 'subscription' },
    attributes: ['name', 'uuid'],
    paranoid: true,
  });

  return products;
};

const findAllProductsForSelectUpsellAndOrderBump = async ({
  id_user,
  subscriptions,
}) => {
  let where = {
    id_user,
  };

  if (!subscriptions) {
    where = {
      ...where,
      payment_type: {
        [Op.eq]: SINGLE,
      },
    };
  }

  const products = await Products.findAll({
    nest: true,
    where,
    include: [
      {
        model: Product_offer,
        as: 'product_offer',
        separate: true,
        include: [
          {
            association: 'plans',
          },
          {
            association: 'order_bumps',
            attributes: ['uuid', 'title', 'order_bump_plan'],
          },
        ],
      },
    ],
  });

  return products;
};

const findProducstWithPlan = async (id_user) => {
  const products = await Products.findAll({
    where: { id_user, payment_type: 'subscription' },
    nest: true,
    attributes: ['uuid', 'name'],
    include: [
      {
        model: Product_plans,
        as: 'product_plans',
        attributes: [
          'uuid',
          'price',
          'label',
          'payment_frequency',
          'frequency_label',
          'frequency_quantity',
        ],
      },
    ],
  });
  return products;
};

const findProducerProductsPaginated = async ({ where, page, size }) => {
  const factor = parseInt(page, 10);
  const limit = parseInt(size, 10);
  const offset = factor * limit;
  const count = await Products.count({
    where,
    nest: true,
    limit,
    offset,
    distinct: true,
    subQuery: false,
    include: [
      {
        model: Users,
        as: 'producer',
      },
    ],
  });
  const rows = await Products.findAll({
    nest: true,
    raw: true,
    limit,
    offset,
    where,
    subQuery: false,
    include: [
      {
        model: Users,
        as: 'producer',
      },
    ],
  });

  return {
    count,
    rows: rows.map((p) => ({
      product: p,
    })),
  };
};

const findProducerProduct = async ({ id_user, uuid }) =>
  Products.findOne({
    nest: true,
    subQuery: false,
    where: {
      uuid,
      [Op.or]: [
        {
          id_user,
        },
        {
          [Op.and]: {
            '$coproductions.id_user$': id_user,
            '$coproductions.allow_access$': true,
          },
        },
        {
          [Op.and]: {
            '$affiliates.id_user$': id_user,
            '$affiliates.allow_access$': true,
          },
        },
      ],
    },
    include: [
      { required: false, association: 'affiliates' },
      { required: false, association: 'coproductions' },
      {
        association: 'ebooks',
        separate: true,
      },
      {
        association: 'producer',
      },
      {
        association: 'progress',
        where: {
          id_student: 0,
        },
        required: false,
      },
      {
        association: 'anchors',
        order: [['order', 'asc']],
        separate: true,
        include: [
          {
            association: 'modules',
            attributes: ['id'],
          },
        ],
      },
    ],
  });

const findProductColors = async (where) =>
  Products.findOne({
    where,
    raw: true,
    attributes: [
      'hex_color_membership_primary',
      'hex_color_membership_secondary',
    'hex_color_membership_text',
    'hex_color_membership_hover',
      'apply_membership_colors',
    ],
  });

const findProductIdByUuid = async (where) =>
  Products.findOne({
    where,
    raw: true,
    attributes: ['id'],
  });

const findCheckoutConfiguration = async (where) =>
  Product_offer.findOne({
    where: {
      [Op.and]: [
        { checkout_customizations: { [Op.ne]: null } },
        { checkout_customizations: { [Op.ne]: {} } },
        where,
      ],
    },
    raw: true,
    nest: true,
    attributes: ['checkout_customizations', 'default_installment'],
  });

const findProductsRanking = async ({
  page,
  size,
  start,
  end,
  order_by,
  id_category,
  id_user,
}) => {
  const offset = page * size;
  const limit = Number(size);

  const dateCondition =
    start && end ? `si.paid_at BETWEEN :start AND :end` : '1=1';

  const categoryCondition =
    id_category !== 'all' ? 'p.category = :id_category' : '1=1';

  let orderBy = '';

  if (order_by === 'total-sold') {
    orderBy = 'total_sold DESC';
  } else if (order_by === 'product-name-asc') {
    orderBy = 'p.name ASC';
  } else if (order_by === 'product-name-desc') {
    orderBy = 'p.name DESC';
  } else {
    orderBy = 'total_sales DESC';
  }

  if (start) {
    start = date(start).startOf('d').add(3, 'h').format(DATABASE_DATE);
  }

  if (end) {
    end = date(end).endOf('d').add(3, 'h').format(DATABASE_DATE);
  }

  const dataQuery = `
    SELECT 
      p.id,
      p.cover,
      p.name AS product, 
      p.category, 
      SUM(si.price_product) AS total_sales, 
      COUNT(*) AS total_sold
    FROM 
      products p 
    JOIN 
      sales_items si ON si.id_product = p.id
    WHERE 
      p.id_user =:id_user 
      AND si.id_status = 2
      AND p.deleted_at IS NULL
      AND ${dateCondition}
      AND ${categoryCondition}
    GROUP BY
      p.id, p.name, p.category
    ORDER BY
      ${orderBy}
    LIMIT :limit 
    OFFSET :offset;
  `;

  const countQuery = `
  SELECT COUNT(*) AS total_count FROM (
    SELECT 
      p.id
    FROM 
      products p 
    JOIN 
      sales_items si ON si.id_product = p.id
    WHERE 
      p.id_user = :id_user
      AND si.id_status = 2
      AND p.deleted_at IS NULL
      AND ${dateCondition}
      AND ${categoryCondition}
    GROUP BY
      p.id
  ) AS grouped_products;
  `;

  const [count, rows] = await Promise.all([
    Products.sequelize.query(countQuery, {
      replacements: {
        id_user,
        start,
        end,
        id_category,
      },
      type: Products.sequelize.QueryTypes.SELECT,
    }),
    Products.sequelize.query(dataQuery, {
      replacements: {
        id_user,
        start,
        end,
        id_category,
        limit,
        offset,
      },
      type: Products.sequelize.QueryTypes.SELECT,
    }),
  ]);

  const products = rows.map((product) => ({
    ...product,
    category: productCategories.find(
      (category) => category.id === product.category,
    ).label,
  }));

  return {
    count: count[0].total_count,
    rows: products,
  };
};

module.exports = {
  findCheckoutConfiguration,
  findProductIdByUuid,
  findProductColors,
  findRawUserProductsInvision,
  createProduct,
  deleteProduct,
  findAllproducts,
  findOneProductMarket,
  findProducstWithPlan,
  findProductByStudent,
  findProducts,
  findProductsMarket,
  findRawUserProducts,
  findSingleProductWithProducer,
  findAllProductsForSelectUpsellAndOrderBump,
  updateProduct,
  findProducerProductsPaginated,
  findProducerProduct,
  findSingleProductAffiliateOrCoproducer,
  findAllIntegrationsProducts,
  findProductsRanking,
};
