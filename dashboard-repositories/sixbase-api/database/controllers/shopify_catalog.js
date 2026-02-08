const { Op } = require('sequelize');
const Shopify_catalog = require('../models/Shopify_catalog');

const findByShopId = async (id_shop_integration, options = {}) => {
  const {
    limit = 100,
    offset = 0,
    order = [['last_seen_at', 'DESC']],
  } = options;
  const { rows, count } = await Shopify_catalog.findAndCountAll({
    where: { id_shop_integration },
    limit,
    offset,
    order,
    attributes: [
      'id',
      'shopify_product_id',
      'shopify_variant_id',
      'sku',
      'handle',
      'product_title',
      'variant_title',
      'full_title',
      'price',
      'compare_at_price',
      'vendor',
      'product_type',
      'image_url',
      'weight_grams',
      'times_seen',
      'times_purchased',
      'total_quantity_sold',
      'total_revenue',
      'first_seen_at',
      'last_seen_at',
    ],
  });
  return { rows, count };
};

const getReportTopSkus = async (
  id_shop_integration,
  limit = 20,
  by = 'times_seen',
) => {
  const orderField = [
    'times_seen',
    'times_purchased',
    'total_quantity_sold',
    'total_revenue',
  ].includes(by)
    ? by
    : 'times_seen';
  return Shopify_catalog.findAll({
    where: { id_shop_integration },
    order: [[orderField, 'DESC']],
    limit: Math.min(limit, 100),
    attributes: [
      'id',
      'sku',
      'full_title',
      'product_title',
      'variant_title',
      'price',
      'vendor',
      'product_type',
      'image_url',
      'times_seen',
      'times_purchased',
      'total_quantity_sold',
      'total_revenue',
      'last_seen_at',
    ],
  });
};

const getReportByVendor = async (id_shop_integration) => {
  const results = await Shopify_catalog.sequelize.query(
    `SELECT vendor, COUNT(*) as variant_count, SUM(times_seen) as total_seen, SUM(times_purchased) as total_purchased, SUM(total_quantity_sold) as total_qty_sold, SUM(total_revenue) as total_revenue
     FROM shopify_catalog
     WHERE id_shop_integration = :id_shop_integration AND vendor IS NOT NULL AND vendor != ''
     GROUP BY vendor
     ORDER BY total_seen DESC`,
    {
      replacements: { id_shop_integration },
      type: Shopify_catalog.sequelize.QueryTypes.SELECT,
    },
  );
  return Array.isArray(results) ? results : [];
};

const getReportByType = async (id_shop_integration) => {
  const results = await Shopify_catalog.sequelize.query(
    `SELECT
       CASE
         WHEN product_type IS NULL OR product_type = '' THEN 'Sem tipo'
         ELSE product_type
       END as productType,
       COUNT(*) as variant_count,
       SUM(times_seen) as total_seen,
       SUM(times_purchased) as total_purchased,
       SUM(total_quantity_sold) as total_qty_sold,
       SUM(total_revenue) as total_revenue
     FROM shopify_catalog
     WHERE id_shop_integration = :id_shop_integration
     GROUP BY CASE
         WHEN product_type IS NULL OR product_type = '' THEN 'Sem tipo'
         ELSE product_type
       END
     ORDER BY total_seen DESC`,
    {
      replacements: { id_shop_integration },
      type: Shopify_catalog.sequelize.QueryTypes.SELECT,
    },
  );
  return Array.isArray(results) ? results : [];
};

const getReportRecent = async (id_shop_integration, limit = 20, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return Shopify_catalog.findAll({
    where: {
      id_shop_integration,
      first_seen_at: { [Op.gte]: since },
    },
    order: [['first_seen_at', 'DESC']],
    limit: Math.min(limit, 100),
    attributes: [
      'id',
      'sku',
      'full_title',
      'product_title',
      'variant_title',
      'price',
      'vendor',
      'product_type',
      'image_url',
      'times_seen',
      'first_seen_at',
      'last_seen_at',
    ],
  });
};

module.exports = {
  findByShopId,
  getReportTopSkus,
  getReportByVendor,
  getReportByType,
  getReportRecent,
};
