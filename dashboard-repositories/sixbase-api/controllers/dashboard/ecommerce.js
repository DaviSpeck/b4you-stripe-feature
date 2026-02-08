const fs = require('fs');
const ApiError = require('../../error/ApiError');
const {
  findShopIntegrationsByUser,
  findShopIntegrationByUuid,
  findShopIntegrationWithProduct,
  updateShopIntegration,
  // Order Bumps (Product-level)
  findOrderBumpsByOffer,
  createOrderBump,
  updateOrderBump,
  deleteOrderBump,
} = require('../../database/controllers/shop_integrations');
const {
  findOneOrderBump,
  updateOrderBumpImage,
} = require('../../database/controllers/order_bumps');
const {
  findByShopId,
  getReportTopSkus,
  getReportByVendor,
  getReportByType,
  getReportRecent,
} = require('../../database/controllers/shopify_catalog');
const Shop_integrations = require('../../database/models/Shop_integrations');
const Products = require('../../database/models/Products');
const Product_offer = require('../../database/models/Product_offer');
const ImageHelper = require('../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../utils/files');
const uuidHelper = require('../../utils/helpers/uuid');
const { PHYSICAL_TYPE } = require('../../types/productTypes');

/**
 * List all shop integrations for the current user
 * GET /api/dashboard/integrations/ecommerce/shops
 */
module.exports.listShops = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const shops = await findShopIntegrationsByUser(id_user);
    return res.status(200).json(
      shops.map((shop) => ({
        id: shop.id,
        uuid: shop.uuid,
        platform: shop.platform,
        shop_domain: shop.shop_domain,
        shop_name: shop.shop_name,
        active: shop.active,
        access_token: shop.access_token ? '***' : null, // Masked for security
        id_product: shop.id_product,
        id_default_offer: shop.id_default_offer,
        container_product: shop.container_product
          ? {
            id: shop.container_product.id,
            uuid: shop.container_product.uuid,
            name: shop.container_product.name,
          }
          : null,
        created_at: shop.created_at,
        updated_at: shop.updated_at,
      })),
    );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Get a single shop integration by UUID with product and offer data
 * GET /api/dashboard/integrations/ecommerce/shops/:uuid
 */
module.exports.getShop = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;

  try {
    const shop = await findShopIntegrationWithProduct(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    return res.status(200).json({
      id: shop.id,
      uuid: shop.uuid,
      platform: shop.platform,
      shop_domain: shop.shop_domain,
      shop_name: shop.shop_name,
      active: shop.active,
      access_token: shop.access_token ? '***' : null, // Masked for security
      id_product: shop.id_product,
      id_default_offer: shop.id_default_offer,
      container_product: shop.container_product
        ? {
          id: shop.container_product.id,
          uuid: shop.container_product.uuid,
          name: shop.container_product.name,
        }
        : null,
      default_offer: shop.default_offer
        ? {
          id: shop.default_offer.id,
          uuid: shop.default_offer.uuid,
          name: shop.default_offer.name,
          order_bumps: shop.default_offer.order_bumps || [],
        }
        : null,
      created_at: shop.created_at,
      updated_at: shop.updated_at,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Create a new shop integration with auto-created container product
 * POST /api/dashboard/integrations/ecommerce/shops
 *
 * This function creates:
 * 1. A container product (physical type) to hold all shop offers
 * 2. A default offer for the container product (with minimal defaults)
 * 3. The shop integration linked to the product and offer
 *
 * Required fields: shop_name, shop_domain, access_token
 * Shipping and payment configurations should be set AFTER creation via product container offer.
 *
 * Order bumps and upsells should be configured on the product's default offer
 * and will apply to ALL offers generated from this shop.
 */
module.exports.createShop = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { shop_domain, shop_name, access_token } = req.body;
  const { sequelize } = Shop_integrations;

  const t = await sequelize.transaction();

  try {
    if (!shop_domain) {
      await t.rollback();
      return res.status(400).json({ error: 'shop_domain is required' });
    }

    if (!shop_name) {
      await t.rollback();
      return res.status(400).json({ error: 'shop_name is required' });
    }

    if (!access_token) {
      await t.rollback();
      return res.status(400).json({ error: 'access_token is required' });
    }

    // Normalize shop_domain: remove protocol and trailing slashes
    const normalizedDomain = shop_domain
      .replace(/^https?:\/\//, '') // Remove http:// or https://
      .replace(/\/+$/, '') // Remove trailing slashes
      .trim();

    const existingShop = await Shop_integrations.findOne({
      where: { shop_domain: normalizedDomain },
      transaction: t,
    });

    if (existingShop) {
      await t.rollback();
      return res.status(409).json({
        error: 'Uma loja com este domínio já existe',
        code: 'DOMAIN_ALREADY_EXISTS',
      });
    }

    // 1. Create the container product (physical type, hidden from product list)
    const product = await Products.create(
      {
        id_user,
        name: `${shop_name} - E-commerce`,
        id_type: PHYSICAL_TYPE, // 4 = physical product type
        payment_type: 'single',
        visible: false,
        category: 0,
      },
      { transaction: t },
    );

    // 2. Create default offer for the container product
    // Ecommerce container offers MUST be created with a finalized shipping state
    // because shipping is resolved externally (Shopify)
    const offer = await Product_offer.create(
      {
        id_product: product.id,
        name: `${shop_name} - Oferta Padrão`,
        price: 0, // Dynamic price from cart
        active: true,
        installments: 12, // Default, can be updated later
        payment_methods: 'credit_card,pix,billet', // Default, can be updated later

        // =====================================
        // SHIPPING DEFAULTS — ECOMMERCE
        // =====================================
        require_address: true,      // Address is still required
        shipping_type: 0,           // FIX (no shipping method selection)
        shipping_price: 0,          // Shipping resolved by Shopify
        allow_shipping_region: 0,   // Disable region-based shipping
        shipping_region: null,
        shipping_text: null,
      },
      { transaction: t },
    );

    // 3. Create shop integration linked to product and offer
    // Generate UUID explicitly to ensure it's set (hook may not fire in transaction)
    const shop = await Shop_integrations.create(
      {
        id_user,
        platform: 'shopify',
        shop_domain: normalizedDomain, // Use normalized domain
        shop_name,
        uuid: uuidHelper.nanoid(16), // Generate UUID explicitly
        access_token, // Store Shopify Admin API access token
        config: {}, // Empty config - shipping/payment configs go in product offer
        active: true,
        id_product: product.id,
        id_default_offer: offer.id,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(201).json({
      id: shop.id,
      uuid: shop.uuid,
      platform: shop.platform,
      shop_domain: shop.shop_domain,
      shop_name: shop.shop_name,
      active: shop.active,
      access_token: shop.access_token ? '***' : null, // Masked for security
      id_product: shop.id_product,
      id_default_offer: shop.id_default_offer,
      container_product: {
        id: product.id,
        uuid: product.uuid,
        name: product.name,
      },
      default_offer: {
        id: offer.id,
        uuid: offer.uuid,
        name: offer.name,
      },
      message:
        'Shop created successfully. Configure shipping and payment settings in the product container offer.',
    });
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Update a shop integration
 * PUT /api/dashboard/integrations/ecommerce/shops/:uuid
 */
module.exports.updateShop = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;
  const { shop_domain, shop_name, access_token, active } = req.body;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    const updateData = {};
    if (shop_domain !== undefined) updateData.shop_domain = shop_domain;
    if (shop_name !== undefined) updateData.shop_name = shop_name;
    if (access_token !== undefined) updateData.access_token = access_token;
    if (active !== undefined) updateData.active = active;

    await updateShopIntegration(shop.id, updateData);

    const updatedShop = await findShopIntegrationByUuid(uuid);

    return res.status(200).json({
      id: updatedShop.id,
      uuid: updatedShop.uuid,
      platform: updatedShop.platform,
      shop_domain: updatedShop.shop_domain,
      shop_name: updatedShop.shop_name,
      active: updatedShop.active,
      access_token: updatedShop.access_token ? '***' : null, // Masked for security
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Delete (soft) a shop integration and its container product
 * DELETE /api/dashboard/integrations/ecommerce/shops/:uuid
 *
 * This function deletes:
 * 1. The shop integration
 * 2. The container product (and all its offers via cascade)
 */
module.exports.deleteShop = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;
  const { sequelize } = Shop_integrations;

  const t = await sequelize.transaction();

  try {
    const shop = await Shop_integrations.findOne({
      where: { uuid, id_user },
      transaction: t,
    });

    if (!shop) {
      await t.rollback();
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    // Store product ID before deleting shop
    const containerProductId = shop.id_product;

    // 1. Delete shop integration first
    await Shop_integrations.update(
      { active: false },
      { where: { id: shop.id }, transaction: t },
    );
    await Shop_integrations.destroy({
      where: { id: shop.id },
      transaction: t,
    });

    // 2. Delete container product (if exists)
    // Note: Offers will remain (soft delete) but won't be accessible without the shop
    if (containerProductId) {
      await Products.destroy({
        where: { id: containerProductId, id_user },
        transaction: t,
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: 'Shop and container product deleted successfully',
    });
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

// ============================================
// ORDER BUMPS (Product-level, applies to all offers)
// ============================================

/**
 * List order bumps for a shop's default offer
 * GET /api/dashboard/integrations/ecommerce/shops/:uuid/bumps
 */
module.exports.listBumps = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    if (!shop.id_default_offer) {
      return res.status(200).json([]);
    }

    const bumps = await findOrderBumpsByOffer(shop.id_default_offer);

    return res.status(200).json(bumps);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Create a new order bump for the shop's default offer
 * POST /api/dashboard/integrations/ecommerce/shops/:uuid/bumps
 */
module.exports.createBump = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;
  const {
    order_bump_offer,
    product_name,
    title,
    label,
    description,
    price_before,
    show_quantity,
    max_quantity,
    cover,
  } = req.body;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    if (!shop.id_default_offer) {
      return res
        .status(400)
        .json({ error: 'Shop does not have a default offer configured' });
    }

    if (!order_bump_offer || !title || !label) {
      return res
        .status(400)
        .json({ error: 'order_bump_offer, title, and label are required' });
    }

    const bump = await createOrderBump({
      id_offer: shop.id_default_offer,
      order_bump_offer,
      product_name: product_name || title,
      title,
      label,
      description: description || null,
      price_before: price_before || null,
      show_quantity: show_quantity !== undefined ? show_quantity : true,
      max_quantity: max_quantity || null,
      cover: cover || null,
    });

    return res.status(201).json(bump);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Update an order bump
 * PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId
 */
module.exports.updateBump = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid, bumpId } = req.params;
  const {
    order_bump_offer,
    product_name,
    title,
    label,
    description,
    price_before,
    show_quantity,
    max_quantity,
    cover,
  } = req.body;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    const updateData = {};
    if (order_bump_offer !== undefined)
      updateData.order_bump_offer = order_bump_offer;
    if (product_name !== undefined) updateData.product_name = product_name;
    if (title !== undefined) updateData.title = title;
    if (label !== undefined) updateData.label = label;
    if (description !== undefined) updateData.description = description;
    if (price_before !== undefined) updateData.price_before = price_before;
    if (show_quantity !== undefined) updateData.show_quantity = show_quantity;
    if (max_quantity !== undefined) updateData.max_quantity = max_quantity;
    if (cover !== undefined) updateData.cover = cover;

    await updateOrderBump(bumpId, updateData);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Delete an order bump
 * DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId
 */
module.exports.deleteBump = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid, bumpId } = req.params;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    await deleteOrderBump(bumpId);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Upload order bump cover image
 * PUT /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover
 */
module.exports.uploadBumpCover = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid, bumpId } = req.params;
  const { file } = req;

  try {
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    if (!shop.id_default_offer) {
      return res
        .status(400)
        .json({ error: 'Shop does not have a default offer configured' });
    }

    // Verify bump exists and belongs to shop's default offer
    const bump = await findOneOrderBump({
      id: parseInt(bumpId, 10),
      id_offer: shop.id_default_offer,
    });

    if (!bump) {
      return res.status(404).json({ error: 'Order bump not found' });
    }

    // Format and process image
    const fileBufferCover = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.PRODUCT_COVER,
    );

    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);

    // Delete temporary file
    fs.unlinkSync(file.path);

    const { file: url, key } = dataCover;

    // Update bump with new image
    await updateOrderBumpImage(bump.id, {
      cover: url,
      cover_key: key,
    });

    return res.status(200).json({
      success: true,
      message: 'Imagem do order bump atualizada',
      url,
    });
  } catch (error) {
    // Clean up file if error occurred
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        // Ignore unlink errors
      }
    }

    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Delete order bump cover image
 * DELETE /api/dashboard/integrations/ecommerce/shops/:uuid/bumps/:bumpId/cover
 */
module.exports.deleteBumpCover = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid, bumpId } = req.params;

  try {
    const shop = await findShopIntegrationByUuid(uuid);

    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    if (!shop.id_default_offer) {
      return res
        .status(400)
        .json({ error: 'Shop does not have a default offer configured' });
    }

    // Verify bump exists and belongs to shop's default offer
    const bump = await findOneOrderBump({
      id: parseInt(bumpId, 10),
      id_offer: shop.id_default_offer,
    });

    if (!bump) {
      return res.status(404).json({ error: 'Order bump not found' });
    }

    // Remove image
    await updateOrderBumpImage(bump.id, {
      cover: null,
      cover_key: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Imagem do order bump removida',
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * List Shopify catalog entries for a shop (paginated)
 * GET /api/dashboard/integrations/ecommerce/shops/:uuid/catalog
 * Query: limit, offset, order
 */
module.exports.listCatalog = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;
  const { limit, offset, order } = req.query;

  try {
    const shop = await findShopIntegrationByUuid(uuid);
    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    const opts = {};
    if (limit) opts.limit = Math.min(parseInt(limit, 10) || 100, 100);
    if (offset) opts.offset = Math.max(0, parseInt(offset, 10));
    if (
      order === 'times_seen' ||
      order === 'times_purchased' ||
      order === 'last_seen_at'
    ) {
      opts.order = [[order, 'DESC']];
    }

    const { rows, count } = await findByShopId(shop.id, opts);
    return res.status(200).json({ data: rows, total: count });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/**
 * Catalog reports for a shop
 * GET /api/dashboard/integrations/ecommerce/shops/:uuid/catalog/reports?report=top-skus|by-vendor|by-type|recent
 * Query: report (required), limit, by (for top-skus: times_seen|times_purchased|total_quantity_sold|total_revenue), days (for recent, default 30)
 */
module.exports.getCatalogReports = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { uuid } = req.params;
  const { report, limit, by, days } = req.query;

  try {
    const shop = await findShopIntegrationByUuid(uuid);
    if (!shop || shop.id_user !== id_user) {
      return res.status(404).json({ error: 'Shop integration not found' });
    }

    const id_shop_integration = shop.id;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const daysNum = Math.min(parseInt(days, 10) || 30, 365);

    switch (report) {
      case 'top-skus':
        return res.status(200).json({
          report: 'top-skus',
          data: await getReportTopSkus(
            id_shop_integration,
            limitNum,
            by || 'times_seen',
          ),
        });
      case 'by-vendor':
        return res.status(200).json({
          report: 'by-vendor',
          data: await getReportByVendor(id_shop_integration),
        });
      case 'by-type':
        return res.status(200).json({
          report: 'by-type',
          data: await getReportByType(id_shop_integration),
        });
      case 'recent':
        return res.status(200).json({
          report: 'recent',
          data: await getReportRecent(id_shop_integration, limitNum, daysNum),
        });
      default:
        return res.status(400).json({
          error: 'Invalid report. Use report=top-skus|by-vendor|by-type|recent',
        });
    }
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
