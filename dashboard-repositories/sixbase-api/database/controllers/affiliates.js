const { Op, Sequelize } = require('sequelize');
const Affiliates = require('../models/Affiliates');
const Products = require('../models/Products');
const Product_affiliate_settings = require('../models/Product_affiliate_settings');
const Users = require('../models/Users');
const db = require('../models/index');
const { findAffiliateStatus } = require('../../status/affiliateStatus');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

const createAffiliate = async (affiliateObj) => {
  const affiliate = await Affiliates.create(affiliateObj);
  return affiliate;
};

const findAllAffiliate = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    include: [
      {
        association: 'user',
      },
      {
        association: 'product',
      },
    ],
  });
  return affiliate;
};

const findRawProductsAffiliates = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    group: ['id_product', 'id_user'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
      },
    ],
  });
  return affiliate;
};

const findRawProductsAffiliatesWebhooks = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    group: ['id_product'],
    attributes: ['id_user', 'id_product', 'status'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        attributes: ['name', 'uuid', 'id_type', 'id'],
      },
    ],
  });
  return affiliate;
};

const findAffiliateProduct = async (where) => {
  const affiliate = await Affiliates.findOne({
    nest: true,
    where,
    attributes: ['id_user', 'id_product', 'status'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        attributes: ['uuid'],
      },
    ],
  });
  return affiliate;
};

const findOneAffiliate = async (where) => {
  const affiliate = await Affiliates.findOne({
    raw: true,
    nest: true,
    where,
    paranoid: true,
    include: [
      {
        model: Products,
        as: 'product',
        include: [
          { model: Product_affiliate_settings, as: 'affiliate_settings' },
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
      {
        model: Users,
        as: 'user',
      },
    ],
  });
  return affiliate;
};

const findAllProducerAffiliates = async (id_user, where) => {
  const affiliate = await Affiliates.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        association: 'product',
        attributes: ['name', 'uuid'],
        where: { id_user },
      },
      {
        association: 'user',
        attributes: ['full_name', 'email', 'whatsapp', 'instagram', 'tiktok'],
      },
    ],
  });
  return affiliate;
};

const findFilteredAffiliates = async ({
  id_user,
  product_uuid,
  id_status,
  input,
  page,
  size,
}) => {
  let where = {};
  if (product_uuid) where = { ...where, '$product.uuid$': product_uuid };
  if (id_status) {
    where.status = id_status;
  }
  if (input) {
    let orObject = {};
    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length === input.length) {
      orObject = {
        ...orObject,
        '$user.document_number$': {
          [Op.like]: `%${sanitizedInput}%`,
        },
      };
    } else {
      orObject = {
        '$user.full_name$': { [Op.like]: `%${input}%` },
        '$user.email$': { [Op.like]: `%${input}%` },
      };
    }

    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  const offset = page * size;
  const limit = Number(size);
  const affiliates = await Affiliates.findAndCountAll({
    where,
    offset,
    limit,
    nest: true,
    distinct: true,
    subQuery: false,
    paranoid: true,
    order: [['created_at', 'DESC']],
    group: ['id'],
    include: [
      {
        association: 'product',
        attributes: ['name', 'uuid'],
        where: { id_user },
      },
      {
        association: 'user',
        attributes: [
          'first_name',
          'last_name',
          'full_name',
          'email',
          'whatsapp',
          'instagram',
          'tiktok',
        ],
      },
    ],
  });
  return { rows: affiliates.rows, count: affiliates.count.length };
};

const findAffiliatesWithSales = async ({
  id_user,
  page,
  size,
  start,
  end,
  products,
}) => {
  const offset = page * size;
  const limit = Number(size);

  const dateCondition =
    start && end ? `si.paid_at BETWEEN :start AND :end` : '1=1';

  const parsedProducts = products
    ? products
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !Number.isNaN(p))
    : [];

  const productsCondition =
    parsedProducts.length > 0 ? `and p.id IN (:products)` : '';

  const dataQuery = `
  WITH
  sales_summary AS (
    SELECT
      c.id_user           AS id_user_affiliate,
      COUNT(*)            AS total_items_sold,
      SUM(si.price_base)  AS total_sales_value,
      SUM(c.amount)       AS total_commission
    FROM sales_items si
    JOIN commissions c    ON c.id_sale_item = si.id
    JOIN products p       ON p.id = si.id_product
    WHERE
      si.id_affiliate IS NOT NULL
      AND si.id_status   = 2
      AND c.id_role      = 3
      AND p.id_user      = :id_user
      AND ${dateCondition}
      ${productsCondition}
    GROUP BY c.id_user
  ),
  click_summary AS (
    SELECT
      af.id_user           AS id_user_affiliate,
      SUM(ac.click_amount) AS click_amount
    FROM affiliate_clicks ac
    JOIN affiliates af    ON af.id = ac.id_affiliate
    GROUP BY af.id_user
  )
SELECT
  ss.id_user_affiliate,
  u.full_name,
  u.email,
  u.profile_picture,
  ss.total_items_sold,
  ss.total_sales_value,
  ss.total_commission,
  COALESCE(cs.click_amount, 0) AS click_amount
FROM sales_summary AS ss
JOIN users AS u
  ON u.id = ss.id_user_affiliate
LEFT JOIN click_summary AS cs
  ON cs.id_user_affiliate = ss.id_user_affiliate
ORDER BY ss.total_sales_value DESC
LIMIT  :limit
OFFSET :offset;
  `;

  const countQuery = `
    SELECT COUNT(*) AS total_count FROM (
      SELECT 
        c.id_user
      FROM 
        sales_items si 
      JOIN 
        commissions c on c.id_sale_item = si.id 
      JOIN
        products p on p.id = si.id_product 
      WHERE 
        si.id_affiliate is not null 
        and si.id_status = 2 
        and c.id_role = 3
        and p.id_user = :id_user
        and ${dateCondition}
        ${productsCondition}
      GROUP BY
        c.id_user
    ) AS grouped_affiliates;
`;

  const [results, countResult] = await Promise.all([
    db.sequelize.query(dataQuery, {
      replacements: {
        id_user,
        limit,
        offset,
        start: start
          ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        end: end
          ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        products: parsedProducts,
      },
      type: Sequelize.QueryTypes.SELECT,
    }),
    db.sequelize.query(countQuery, {
      replacements: {
        id_user,
        start: start
          ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        end: end
          ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        products: parsedProducts,
      },
      type: Sequelize.QueryTypes.SELECT,
    }),
  ]);

  return {
    rows: results,
    count: countResult[0].total_count,
  };
};

const findAllProductsWithAffiliates = async ({ id_user, id_affiliate }) => {
  const query = `
WITH
  product_summary AS (
    SELECT
      p.id                   AS product_id,
      p.name                 AS product_name,
      a.commission           AS commission,
      a.status               AS status,
      COUNT(si.id)           AS total_items_sold,
      SUM(c.amount)          AS total_commission_value
    FROM sales_items si
    JOIN commissions c      ON c.id_sale_item = si.id
    JOIN products p         ON p.id = si.id_product
    JOIN affiliates a       ON a.id_user = c.id_user
                           AND a.id = si.id_affiliate
    WHERE
      si.id_affiliate IS NOT NULL
      AND c.id_user     = :id_affiliate
      AND si.id_status  = 2
      AND c.id_role     = 3
      AND p.id_user     = :id_user
    GROUP BY
      p.id, p.name, a.commission, a.status
  ),
  click_summary AS (
    SELECT
      ac.id_product         AS product_id,
      SUM(ac.click_amount)  AS click_amount
    FROM affiliate_clicks ac
    JOIN affiliates af     ON af.id = ac.id_affiliate
    WHERE af.id_user = :id_affiliate
    GROUP BY ac.id_product
  )
SELECT
  ps.product_id,
  ps.product_name,
  ps.commission,
  ps.status,
  ps.total_items_sold,
  ps.total_commission_value,
  COALESCE(cs.click_amount, 0) AS click_amount
FROM product_summary ps
LEFT JOIN click_summary cs
  ON cs.product_id = ps.product_id
ORDER BY
  ps.total_commission_value DESC;
  `;

  const results = await db.sequelize.query(query, {
    replacements: { id_user, id_affiliate },
    type: Sequelize.QueryTypes.SELECT,
  });

  const resultsWithStatus = results.map((r) => ({
    ...r,
    status: findAffiliateStatus(r.status),
  }));

  return {
    rows: resultsWithStatus,
  };
};

const updateAffiliate = async (where, affiliateObj) => {
  const Affiliate = await Affiliates.update(affiliateObj, {
    where,
  });
  return Affiliate;
};

const findBestSallersAffiliates = async ({ id_user, start, end, products }) => {
  const dateCondition =
    start && end ? `si.paid_at BETWEEN :start AND :end` : '1=1';

  const parsedProducts = products
    ? products
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !Number.isNaN(p))
    : [];

  const productsCondition =
    parsedProducts.length > 0 ? `AND p.id IN (:products)` : '';

  const dataQuery = `
    SELECT
      u.full_name AS affiliate_name,
      u.profile_picture,
      SUM(si.price_base) AS total_sales_value
    FROM sales_items si
    JOIN commissions c ON c.id_sale_item = si.id
    JOIN products p ON p.id = si.id_product
    JOIN users u ON u.id = c.id_user
    WHERE
      si.id_affiliate IS NOT NULL
      AND si.id_status = 2
      AND c.id_role = 3
      AND p.id_user = :id_user
      AND ${dateCondition}
      ${productsCondition}
    GROUP BY u.full_name, u.profile_picture
    ORDER BY total_sales_value DESC
    LIMIT 3;
  `;

  const results = await db.sequelize.query(dataQuery, {
    replacements: {
      id_user,
      start: start
        ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
        : null,
      end: end
        ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
        : null,
      products: parsedProducts,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  return results;
};

module.exports = {
  createAffiliate,
  findAllAffiliate,
  findAllProducerAffiliates,
  findFilteredAffiliates,
  findOneAffiliate,
  findRawProductsAffiliates,
  updateAffiliate,
  findRawProductsAffiliatesWebhooks,
  findAffiliateProduct,
  findAffiliatesWithSales,
  findAllProductsWithAffiliates,
  findBestSallersAffiliates,
};
