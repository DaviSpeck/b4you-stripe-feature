const { QueryTypes } = require('sequelize');
const Database = require('../../../../database/models/index');
const logger = require('../../../../utils/logger');

class OfferContextService {
  async getOfferContexts(offerIds = []) {
    const uniqueOfferIds = Array.from(
      new Set(offerIds.filter((offerId) => Boolean(offerId))),
    );

    if (!uniqueOfferIds.length) {
      return new Map();
    }

    try {
      const rows = await Database.sequelize.query(
        `
          SELECT
            po.uuid AS offer_id,
            p.uuid AS product_id,
            p.name AS product_name,
            u.uuid AS producer_id,
            u.full_name AS producer_name
          FROM product_offer po
          LEFT JOIN products p ON p.id = po.id_product
          LEFT JOIN users u ON u.id = p.id_user
          WHERE po.uuid IN (:offer_ids)
        `,
        {
          replacements: {
            offer_ids: uniqueOfferIds,
          },
          type: QueryTypes.SELECT,
        },
      );

      const contextMap = new Map();
      rows.forEach((row) => {
        contextMap.set(row.offer_id, {
          product_id: row.product_id || null,
          product_name: row.product_name || null,
          producer_id: row.producer_id || null,
          producer_name: row.producer_name || null,
        });
      });

      return contextMap;
    } catch (error) {
      logger.error(
        JSON.stringify({
          type: 'CHECKOUT_ANALYTICS_ERROR',
          endpoint: 'offer_context',
          error: error.message,
          stack: error.stack,
        }),
      );
      return new Map();
    }
  }

  async getProductContexts(productIds = []) {
    const uniqueProductIds = Array.from(
      new Set(productIds.filter((productId) => Boolean(productId))),
    );

    if (!uniqueProductIds.length) {
      return new Map();
    }

    try {
      const rows = await Database.sequelize.query(
        `
          SELECT
            p.uuid AS product_id,
            p.name AS product_name
          FROM products p
          WHERE p.uuid IN (:product_ids)
        `,
        {
          replacements: {
            product_ids: uniqueProductIds,
          },
          type: QueryTypes.SELECT,
        },
      );

      const contextMap = new Map();
      rows.forEach((row) => {
        contextMap.set(row.product_id, {
          product_id: row.product_id || null,
          product_name: row.product_name || null,
        });
      });

      return contextMap;
    } catch (error) {
      logger.error(
        JSON.stringify({
          type: 'CHECKOUT_ANALYTICS_ERROR',
          endpoint: 'product_context',
          error: error.message,
          stack: error.stack,
        }),
      );
      return new Map();
    }
  }

  async getProducerContexts(producerIds = []) {
    const uniqueProducerIds = Array.from(
      new Set(producerIds.filter((producerId) => Boolean(producerId))),
    );

    if (!uniqueProducerIds.length) {
      return new Map();
    }

    try {
      const rows = await Database.sequelize.query(
        `
          SELECT
            u.uuid AS producer_id,
            u.full_name AS producer_name
          FROM users u
          WHERE u.uuid IN (:producer_ids)
        `,
        {
          replacements: {
            producer_ids: uniqueProducerIds,
          },
          type: QueryTypes.SELECT,
        },
      );

      const contextMap = new Map();
      rows.forEach((row) => {
        contextMap.set(row.producer_id, {
          producer_id: row.producer_id || null,
          producer_name: row.producer_name || null,
        });
      });

      return contextMap;
    } catch (error) {
      logger.error(
        JSON.stringify({
          type: 'CHECKOUT_ANALYTICS_ERROR',
          endpoint: 'producer_context',
          error: error.message,
          stack: error.stack,
        }),
      );
      return new Map();
    }
  }
}

module.exports = OfferContextService;
