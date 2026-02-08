const { Sequelize } = require('sequelize');
const Coupons = require('../models/Coupons');
const db = require('../models/index');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

const createCoupon = async (data, options = {}) => Coupons.create(data, options);

const findOneCoupon = async (where) => Coupons.findOne({ raw: true, where });

const findCouponsPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);

  const coupons = await Coupons.findAndCountAll({
    nest: true,
    distinct: true,
    col: 'id',
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(si.id)
            FROM coupons_sales cs
            JOIN sales_items si ON si.id_sale = cs.id_sale
            WHERE cs.id_coupon = coupons.id
              AND si.id_status = 2
          )`),
          'total_sold',
        ],
        [
          Sequelize.literal(`(
            SELECT MAX(si.paid_at)
            FROM coupons_sales cs
            JOIN sales_items si ON si.id_sale = cs.id_sale
            WHERE cs.id_coupon = coupons.id
              AND si.id_status = 2
          )`),
          'used_at',
        ],
      ],
    },
    include: [
      {
        association: 'affiliate',
        attributes: ['id'],
        include: [
          {
            association: 'user',
            attributes: ['email', 'full_name'],
          },
        ],
      },
      {
        association: 'offers',
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
    ],
    where,
    offset,
    limit,
    order: [['id', 'desc']],
  });

  const formattedRows = coupons.rows.map((r) => {
    const json = r.toJSON();
    json.total_sold = Number(json.total_sold) || 0;
    json.used_at = json.used_at ? new Date(json.used_at) : null;
    return json;
  });

  return {
    rows: formattedRows,
    count: coupons.count,
  };
};

const updateCoupon = async (where, data, options = {}) =>
  Coupons.update(data, { where, ...options });

const findCouponsRaking = async ({
  page,
  size,
  start,
  end,
  role,
  id_product,
  id_user,
}) => {
  const offset = page * size;
  const limit = Number(size);

  const dateCondition =
    start && end ? `si.paid_at BETWEEN :start AND :end` : '1=1';

  const productCondition =
    id_product !== 'all' ? 'c.id_product = :id_product' : '1=1';

  let roleCondition = '1=1';

  if (role === 'creator') {
    roleCondition = 'c.id_user_created != 0';
  } else if (role === 'productor') {
    roleCondition = 'c.id_user_created = 0';
  }

  const dataQuery = `
      SELECT 
        c.coupon,
        SUM(si.price_base) AS total_sales,
        MAX(si.paid_at) AS used_at,
        SUM(si.discount_amount) AS total_discount,
        COUNT(*) AS total_sold,
        u.full_name AS affiliate_name,
        u.profile_picture
      FROM 
        coupons c 
      JOIN 
        products p ON c.id_product = p.id
      LEFT JOIN 
        users u ON c.id_user_created = u.id
      JOIN 
        coupons_sales cs ON cs.id_coupon = c.id 
      JOIN 
        sales s ON s.id = cs.id_sale 
      JOIN 
        sales_items si ON si.id_sale = s.id
      WHERE 
        p.id_user = :id_user
        AND si.id_status = 2
        AND ${productCondition}
        AND ${dateCondition}
        AND ${roleCondition}
      GROUP BY 
        c.coupon, u.full_name
      ORDER BY
        total_sales DESC
      LIMIT :limit 
      OFFSET :offset;
  `;

  const countQuery = `
    SELECT COUNT(*) AS total_count FROM (
      SELECT 
        c.coupon
      FROM 
        coupons c 
      JOIN 
        products p ON c.id_product = p.id
      LEFT JOIN 
        users u ON c.id_user_created = u.id
      JOIN 
        coupons_sales cs ON cs.id_coupon = c.id 
      JOIN 
        sales s ON s.id = cs.id_sale 
      JOIN 
        sales_items si ON si.id_sale = s.id
      WHERE 
        p.id_user = :id_user
        AND si.id_status = 2
        AND ${productCondition}
        AND ${dateCondition}
        AND ${roleCondition}
       GROUP BY 
        c.coupon, u.full_name
    ) AS grouped_coupons;
  `;

  const metricsQuery = `
    SELECT 
      COALESCE(SUM(total_sales), 0) AS total_sales,
      COALESCE(SUM(total_sold), 0) AS total_sold
    FROM (
      SELECT 
        SUM(si.price_base) AS total_sales,
        COUNT(*) AS total_sold
      FROM 
        coupons c 
      JOIN 
        products p ON c.id_product = p.id
      LEFT JOIN 
        users u ON c.id_user_created = u.id
      JOIN 
        coupons_sales cs ON cs.id_coupon = c.id 
      JOIN 
        sales s ON s.id = cs.id_sale 
      JOIN 
        sales_items si ON si.id_sale = s.id
      WHERE 
        p.id_user = :id_user
        AND si.id_status = 2
        AND ${productCondition}
        AND ${dateCondition}
        AND ${roleCondition}
      GROUP BY 
        c.coupon, u.full_name
      ORDER BY 
        total_sales DESC
      LIMIT :limit
      OFFSET :offset
    ) AS paged_coupons;
  `;

  const [results, countResult, metricsResult] = await Promise.all([
    db.sequelize.query(dataQuery, {
      replacements: {
        limit,
        offset,
        id_product,
        role,
        id_user,
        start: start
          ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        end: end
          ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
      },
      type: Sequelize.QueryTypes.SELECT,
    }),
    db.sequelize.query(countQuery, {
      replacements: { start, end, id_product, role, id_user },
      type: Sequelize.QueryTypes.SELECT,
    }),
    db.sequelize.query(metricsQuery, {
      replacements: {
        limit,
        offset,
        id_product,
        role,
        id_user,
        start: start
          ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
        end: end
          ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
          : null,
      },
      type: Sequelize.QueryTypes.SELECT,
    }),
  ]);

  return {
    rows: results,
    count: countResult[0].total_count,
    metrics: metricsResult[0],
  };
};

const exportCouponsRanking = async ({
  start,
  end,
  role,
  id_product,
  id_user,
}) => {
  const dateCondition =
    start && end ? `si.paid_at BETWEEN :start AND :end` : '1=1';

  const productCondition =
    id_product !== 'all' ? 'c.id_product = :id_product' : '1=1';

  let roleCondition = '1=1';

  if (role === 'creator') {
    roleCondition = 'c.id_user_created != 0';
  } else if (role === 'productor') {
    roleCondition = 'c.id_user_created = 0';
  }

  const dataQuery = `
      SELECT 
        RANK() OVER (ORDER BY SUM(si.price_base) DESC) AS position,
        c.coupon,
        SUM(si.price_base) AS total_sales,
        MAX(si.paid_at) AS used_at,
        SUM(si.discount_amount) AS total_discount,
        COUNT(*) AS total_sold,
        u.full_name AS affiliate_name
      FROM 
        coupons c 
      JOIN 
        products p ON c.id_product = p.id
      LEFT JOIN 
        users u ON c.id_user_created = u.id
      JOIN 
        coupons_sales cs ON cs.id_coupon = c.id 
      JOIN 
        sales s ON s.id = cs.id_sale 
      JOIN 
        sales_items si ON si.id_sale = s.id
      WHERE 
        p.id_user = :id_user
        AND si.id_status = 2
        AND ${productCondition}
        AND ${dateCondition}
        AND ${roleCondition}
      GROUP BY 
        c.coupon, u.full_name
      ORDER BY
        total_sales DESC;
  `;

  const results = await db.sequelize.query(dataQuery, {
    replacements: {
      id_product,
      role,
      id_user,
      start: start
        ? date(start).startOf('day').add(3, 'h').format(DATABASE_DATE)
        : null,
      end: end
        ? date(end).endOf('day').add(3, 'h').format(DATABASE_DATE)
        : null,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  return results;
};

/**
 * @param {Object} where Ex: {id: cart.id}
 * @param {Boolean} force Soft delete = false, Hard delete = true
 */
const deleteCoupon = async (where, force = false) =>
  Coupons.destroy({ where, force });

module.exports = {
  createCoupon,
  deleteCoupon,
  findOneCoupon,
  findCouponsPaginated,
  updateCoupon,
  findCouponsRaking,
  exportCouponsRanking,
};
