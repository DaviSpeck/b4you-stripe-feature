const { Op } = require('sequelize');
const Shopify_catalog = require('../models/Shopify_catalog');
const { findProductOffer } = require('./product_offer');
const { findShopIntegrationByProductId } = require('./shop_integrations');
const logger = require('../../utils/logger');

/**
 * Record a completed purchase: for each line_item (SKU/variant), update catalog
 * times_purchased, total_quantity_sold, total_revenue by shopify_variant_id (and fallback to sku).
 * Used when a sale is completed for an ecommerce offer (container product with line_items).
 *
 * @param {number} id_shop_integration
 * @param {Array<{ variant_id?: number|string, sku?: string, quantity: number, price: number|string }>} lineItems
 * @returns {Promise<void>}
 */
const recordPurchaseByLineItems = async (id_shop_integration, lineItems) => {
  if (
    !id_shop_integration ||
    !Array.isArray(lineItems) ||
    lineItems.length === 0
  ) {
    return;
  }

  const now = new Date();

  const validItems = lineItems
    .map((item) => {
      const qty = Math.max(0, parseInt(item.quantity, 10) || 0);
      if (qty === 0) return null;

      const price = parseFloat(item.price) || 0;
      const revenue = price * qty;

      const variantId =
        item.variant_id != null ? Number(item.variant_id) : null;
      const sku =
        item.sku && String(item.sku).trim()
          ? String(item.sku).trim()
          : null;

      const orConditions = [];
      if (variantId != null && !Number.isNaN(variantId)) {
        orConditions.push({ shopify_variant_id: variantId });
      }
      if (sku) {
        orConditions.push({ sku });
      }

      if (orConditions.length === 0) return null;

      return {
        qty,
        revenue,
        where: {
          id_shop_integration,
          [Op.or]: orConditions,
        },
      };
    })
    .filter(Boolean);

  await Promise.all(
    validItems.map(async ({ qty, revenue, where }) => {
      const row = await Shopify_catalog.findOne({ where });
      if (!row) return;

      await row.increment({
        times_purchased: 1,
        total_quantity_sold: qty,
        total_revenue: revenue,
      });

      await row.update({ last_purchased_at: now });
    }),
  );
};

/**
 * Upsert a catalog entry from Shopify cart item (resolve-offer flow).
 * Creates record on first see, updates price/attributes and increments times_seen on subsequent sees.
 *
 * @param {Object} data
 * @param {number} data.id_shop_integration
 * @param {number} data.shopify_product_id
 * @param {number} data.shopify_variant_id
 * @param {string} [data.sku]
 * @param {string} [data.handle]
 * @param {string} [data.product_title]
 * @param {string} [data.variant_title]
 * @param {string} [data.full_title]
 * @param {number} [data.price] - already in reais
 * @param {number} [data.compare_at_price] - already in reais
 * @param {string} [data.vendor]
 * @param {string} [data.product_type]
 * @param {Array} [data.options] - options_with_values
 * @param {string} [data.image_url]
 * @param {number} [data.weight_grams]
 * @param {boolean} [data.requires_shipping]
 * @param {Object} [data.raw_cart_item]
 * @returns {Promise<Model>}
 */
const upsertShopifyCatalog = async (data) => {
  const existing = await Shopify_catalog.findOne({
    where: {
      id_shop_integration: data.id_shop_integration,
      [Op.or]: [
        { sku: data.sku },
        { shopify_variant_id: data.shopify_variant_id },
      ],
    },
  });

  const now = new Date();
  const payload = {
    shopify_product_id: data.shopify_product_id,
    shopify_variant_id: data.shopify_variant_id,
    sku: data.sku ?? null,
    handle: data.handle ?? null,
    product_title: data.product_title ?? null,
    variant_title: data.variant_title ?? null,
    full_title: data.full_title ?? null,
    price: data.price ?? null,
    compare_at_price: data.compare_at_price ?? null,
    vendor: data.vendor ?? null,
    product_type: data.product_type ?? null,
    options: data.options ?? null,
    image_url: data.image_url ?? null,
    weight_grams: data.weight_grams ?? 0,
    requires_shipping: data.requires_shipping !== false,
    raw_cart_item: data.raw_cart_item ?? null,
    last_seen_at: now,
  };

  if (existing) {
    await existing.update({
      ...payload,
      times_seen: (existing.times_seen || 1) + 1,
    });
    return existing;
  }

  return Shopify_catalog.create({
    ...payload,
    id_shop_integration: data.id_shop_integration,
    first_seen_at: now,
    times_seen: 1,
    times_purchased: 0,
    total_quantity_sold: 0,
    total_revenue: 0,
    is_active: true,
  });
};

/**
 * If the offer is ecommerce (metadata.source === 'ecommerce' and has line_items),
 * finds the shop by container product and records the purchase per SKU/variant.
 * Call after a sale is completed (e.g. in afterCommit). Idempotent per sale.
 *
 * @param {number} id_offer - Product offer id (numeric)
 * @returns {Promise<void>}
 */
const recordEcommerceSaleIfApplicable = async (id_offer) => {
  if (!id_offer) return;
  try {
    const offer = await findProductOffer({ id: id_offer });
    if (!offer || !offer.id_product) return;

    let {metadata} = offer;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        return;
      }
    }
    if (
      !metadata ||
      metadata.source !== 'ecommerce' ||
      !Array.isArray(metadata.line_items) ||
      metadata.line_items.length === 0
    ) {
      return;
    }

    const shop = await findShopIntegrationByProductId(offer.id_product);
    if (!shop) return;

    await recordPurchaseByLineItems(shop.id, metadata.line_items);
  } catch (err) {
    logger.warn(
      '[ECOMMERCE] recordEcommerceSaleIfApplicable failed:',
      err.message,
    );
  }
};

async function findCatalogByVariantId(variantId) {
  return Shopify_catalog.findOne({
    where: { shopify_variant_id: variantId },
  });
}

module.exports = {
  upsertShopifyCatalog,
  recordPurchaseByLineItems,
  recordEcommerceSaleIfApplicable,
  findCatalogByVariantId,
};
