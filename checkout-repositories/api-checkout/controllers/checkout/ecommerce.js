const ApiError = require('../../error/ApiError');
const {
  findShopIntegrationByDomain,
  findShopIntegrationByUuid,
  findShopIntegrationForCheckout,
  getCheckoutDataByDomain,
  getCheckoutDataByUuid,
  createOrderBump,
  findOrderBumpsByOffer,
} = require('../../database/controllers/shop_integrations');
const {
  createProductOffer,
  findProductOfferForEcommerce,
  findEcommerceOfferByHash,
} = require('../../database/controllers/product_offer');
const {
  inheritOfferConfig,
  extractDefaultOfferFromView,
} = require('../../utils/helpers/inheritOfferConfig');
const logger = require('../../utils/logger');
const { generateOfferHash } = require('../../utils/helpers/offerHash');
const {
  upsertShopifyCatalog,
} = require('../../database/controllers/shopify_catalog');
const { extractUnitsFromCatalog } = require('../../utils/helpers/shopifyUnits');

// ============================================
// BUMPS RESOLVER
// ============================================

const resolveBumps = (orderBumps) => {
  if (!orderBumps || orderBumps.length === 0) {
    return [];
  }

  return orderBumps.map((bump) => ({
    id: bump.id,
    uuid: bump.uuid,
    id_bump_offer: bump.order_bump_offer,
    product_name: bump.product_name,
    title: bump.title,
    label: bump.label,
    description: bump.description,
    price: bump.offer_price || bump.offer?.price || null,
    price_before: bump.price_before,
    cover: bump.cover,
    show_quantity: bump.show_quantity,
    max_quantity: bump.max_quantity,
    offer: bump.offer || {
      price: bump.offer_price,
      name: bump.offer_name,
    },
  }));
};

// ============================================
// MAIN RESOLVER
// ============================================

const resolveOfferByCart = async (req, res, next) => {
  try {
    const { shop_domain, shop_uuid, cart_data, checkout_url } = req.body;

    if (!shop_domain && !shop_uuid) {
      return res.status(400).json({
        error: 'shop_domain or shop_uuid is required',
      });
    }

    if (!cart_data || !cart_data.items || !Array.isArray(cart_data.items)) {
      return res.status(400).json({
        error: 'cart_data.items is required and must be an array',
      });
    }

    if (cart_data.items.length === 0) {
      return res.status(400).json({
        error: 'Cart is empty',
      });
    }

    let shopData;
    let useViewData = false;

    try {
      shopData = shop_uuid
        ? await getCheckoutDataByUuid(shop_uuid)
        : await getCheckoutDataByDomain(shop_domain);

      if (shopData) {
        useViewData = true;
      }
    } catch (viewError) {
      logger.warn(
        'VIEW query failed, using traditional query:',
        viewError.message,
      );
    }

    if (!shopData) {
      shopData = await findShopIntegrationForCheckout(shop_domain, shop_uuid);
    }

    if (!shopData) {
      return res.status(404).json({
        error: 'Shop integration not found',
      });
    }

    const defaultOfferConfig = useViewData
      ? extractDefaultOfferFromView(shopData)
      : shopData.default_offer?.dataValues || shopData.default_offer || null;

    const shopIntegration = useViewData
      ? {
        id: shopData.shop_id,
        uuid: shopData.shop_uuid,
        id_user: shopData.id_user,
        id_product: shopData.id_product,
        id_default_offer: shopData.id_default_offer,
        platform: shopData.platform,
        shop_domain: shopData.shop_domain,
        shop_name: shopData.shop_name,
        config: shopData.shop_config,
        order_bumps: shopData.order_bumps || [],
        default_offer: defaultOfferConfig,
      }
      : {
        ...shopData.dataValues,
        order_bumps: shopData.default_offer?.order_bumps || [],
        default_offer: defaultOfferConfig,
      };

    const idProduct = shopIntegration.id_product || shopData.id_product;
    if (!idProduct) {
      return res.status(400).json({
        error:
          'Shop does not have a container product configured. Please recreate the shop.',
      });
    }

    const config = shopIntegration.config || {};
    const cartItems = [];
    let totalPrice = 0;
    let totalQuantity = 0;

    for (const item of cart_data.items) {
      const sku = item.sku ? String(item.sku).trim() : null;
      const variantId = item.variant_id?.toString();
      if (variantId) {
        const identity = sku || `variant:${variantId}`;

        const unitsFromVariant = extractUnitsFromCatalog(item);
        const quantity = (Number(item.quantity) || 1) * unitsFromVariant;

        const linePriceCentsRaw =
          item.final_line_price ??
          item.line_price ??
          (Number(item.price) * quantity);

        const linePriceCents = Number(linePriceCentsRaw) || 0;
        const unitPrice = (linePriceCents / 100) / quantity;

        cartItems.push({
          sku,
          identity,
          variant_id: variantId,
          title: item.title || item.name,
          unit_price: unitPrice,
          quantity,
          image: item.image || item.featured_image?.url,
          grams: item.grams || '0',
        });

        totalPrice += (linePriceCents / 100);
        totalQuantity += quantity;
      }
    }

    const shopId = shopIntegration.id;
    const catalogUpsertPromises = cart_data.items
      .filter((item) => item.sku || item.variant_id)
      .map((item) => {
        const unitsFromVariant = extractUnitsFromCatalog(item);
        const quantity = (Number(item.quantity) || 1) * unitsFromVariant;

        const linePriceCentsRaw =
          item.final_line_price ??
          item.line_price ??
          (Number(item.price) * quantity);

        const linePriceCents = Number(linePriceCentsRaw) || 0;

        const priceReais = (linePriceCents / 100) / quantity;

        const compareReais = item.compare_at_price
          ? parseFloat(item.compare_at_price) / 100
          : null;
        const imageUrl =
          typeof item.image === 'string'
            ? item.image
            : item.featured_image?.url || item.image || null;

        return upsertShopifyCatalog({
          id_shop_integration: shopId,
          shopify_product_id: item.product_id || item.variant_id,
          shopify_variant_id: item.variant_id,
          sku: item.sku || null,
          handle: item.handle || null,
          product_title: item.product_title || item.title || null,
          variant_title: item.variant_title || null,
          full_title: item.title || item.name || null,
          price: priceReais,
          compare_at_price: compareReais,
          vendor: item.vendor || null,
          product_type: item.product_type || item.type || null,
          options: item.options_with_values || null,
          image_url: imageUrl,
          weight_grams: item.grams || 0,
          requires_shipping: item.requires_shipping !== false,
          raw_cart_item: item,
        }).catch((catalogErr) => {
          logger.warn(
            '[ECOMMERCE] Shopify catalog upsert failed:',
            catalogErr.message,
          );
        });
      });

    await Promise.all(catalogUpsertPromises);

    cartItems.sort((a, b) =>
      `${a.sku}-${a.variant_id}`.localeCompare(`${b.sku}-${b.variant_id}`)
    );

    const lineItems = cartItems.map((cs) => ({
      title: cs.title,
      variant_id: cs.variant_id,
      sku: cs.sku,
      price: cs.unit_price.toFixed(2),
      quantity: cs.quantity,
      grams: cs.grams,
      image: cs.image,
    }));

    let offerName = cartItems
      .map((cs) => (cs.quantity > 1 ? `${cs.quantity}x ${cs.title}` : cs.title))
      .join(' + ');
    offerName = offerName.replace(/'/g, '').replace(/&#39;/g, '');

    const offerImages = cartItems
      .filter((cs) => cs.image)
      .map((cs) => ({
        image: cs.image,
        variant_id: cs.variant_id,
      }));

    const dynamicOfferData = {
      id_product: idProduct,
      id_user: shopIntegration.id_user,
      name: offerName,
      price: totalPrice.toFixed(2),
      description:
        config.description ||
        `${shopIntegration.shop_name || shop_domain} - E-commerce`,
      banner_image: cartItems[0]?.image || '',
      start_offer: config.start_offer || new Date(),
      end_offer: config.end_offer || new Date('2029-12-31'),
      metadata: {
        line_items: lineItems,
        source: 'ecommerce',
        platform: shopIntegration.platform,
        shop_domain: shopIntegration.shop_domain,
        id_parent_offer: shopIntegration.id_default_offer,
      },
      offer_image: offerImages,
      active: true,
    };

    const offerData = inheritOfferConfig(
      shopIntegration.default_offer,
      dynamicOfferData,
    );

    if (!offerData.payment_methods) {
      offerData.payment_methods = config.payment_methods || 'credit_card,pix';
    }
    if (!offerData.installments) {
      offerData.installments = config.installments || 12;
    }
    if (offerData.student_pays_interest === undefined) {
      offerData.student_pays_interest = config.student_pays_interest !== false;
    }

    if (config.shipping_rules) {
      const rules = config.shipping_rules;
      if (
        rules.free_shipping_threshold &&
        totalPrice >= rules.free_shipping_threshold
      ) {
        offerData.shipping_price = 0;
      }
    }

    if (config.dynamic_supplier) {
      offerData.supplier_email = config.dynamic_supplier.email;
      offerData.supplier_amount = config.dynamic_supplier.amount || 0;

      if (config.dynamic_supplier.calculation) {
        const calc = config.dynamic_supplier.calculation;
        if (calc.type === 'per_item') {
          offerData.supplier_amount = totalQuantity * calc.value;
        }
      }
    }

    // Generate comprehensive hash including ALL offer fields for exact matching
    // Include order bumps to detect config changes in default offer
    const offerHash = generateOfferHash(offerData, shopIntegration.order_bumps);

    // Find existing offer with matching hash
    const matchingOffer = await findEcommerceOfferByHash(idProduct, offerHash);

    let offer;
    if (matchingOffer) {
      // Hash matches perfectly - offer is identical, just reuse it
      offer = await findProductOfferForEcommerce({ id: matchingOffer.id });

      // Check if existing offer has order_bumps, if not, copy from default offer
      const existingBumps = await findOrderBumpsByOffer(matchingOffer.id);

      if (
        (!existingBumps || existingBumps.length === 0) &&
        shopIntegration.order_bumps &&
        shopIntegration.order_bumps.length > 0
      ) {
        for (const bump of shopIntegration.order_bumps) {
          const bumpData = {
            id_offer: matchingOffer.id,
            order_bump_offer: bump.order_bump_offer || bump.id_bump_offer,
            label: bump.label || bump.title || 'Oferta Especial',
            title: bump.title,
            description: bump.description,
            price_before: bump.price_before,
            cover: bump.cover,
            product_name: bump.product_name,
            show_quantity: bump.show_quantity || 0,
            max_quantity: bump.max_quantity,
            order_bump_plan: bump.order_bump_plan,
          };
          try {
            // eslint-disable-next-line no-await-in-loop
            await createOrderBump(bumpData);
          } catch (bumpError) {
            logger.warn(
              `[ECOMMERCE] Failed to copy order bump: ${bumpError.message}`,
            );
          }
        }
      }
    } else {
      // Double-check to catch race conditions
      const doubleCheckOffer = await findEcommerceOfferByHash(
        idProduct,
        offerHash,
      );

      if (doubleCheckOffer) {
        offer = await findProductOfferForEcommerce({ id: doubleCheckOffer.id });
      } else {
        // No race condition - proceed with creation
        offerData.metadata.h_offer = offerHash;
        offerData.id_shopify = shop_domain;
        const createdOffer = await createProductOffer(offerData);
        offer = await findProductOfferForEcommerce({ id: createdOffer.id });

        // Copy order_bumps from default offer to the new dynamic offer
        if (
          shopIntegration.order_bumps &&
          shopIntegration.order_bumps.length > 0
        ) {
          for (const bump of shopIntegration.order_bumps) {
            const bumpData = {
              id_offer: createdOffer.id,
              order_bump_offer: bump.order_bump_offer || bump.id_bump_offer,
              label: bump.label || bump.title || 'Oferta Especial',
              title: bump.title,
              description: bump.description,
              price_before: bump.price_before,
              cover: bump.cover,
              product_name: bump.product_name,
              show_quantity: bump.show_quantity || 0,
              max_quantity: bump.max_quantity,
              order_bump_plan: bump.order_bump_plan,
            };
            try {
              // eslint-disable-next-line no-await-in-loop
              await createOrderBump(bumpData);
            } catch (bumpError) {
              logger.warn(
                `[ECOMMERCE] Failed to copy order bump: ${bumpError.message}`,
              );
            }
          }
        }
      }
    }

    const bumps = resolveBumps(shopIntegration.order_bumps);

    const checkoutUrl = `${checkout_url ?? process.env.URL_SIXBASE_CHECKOUT ?? 'https://checkout.b4you.com.br'}/${offer.uuid}/3Steps`;

    return res.status(200).json({
      success: true,
      offer: {
        id: offer.id,
        uuid: offer.uuid,
        name: offer.name,
        price: offer.price,
      },
      checkoutUrl,
      combo: null,
      bumps,
      upsells: [],
      downsells: [],
      restrictions: null,
      cart_summary: {
        total_items: totalQuantity,
        total: totalPrice.toFixed(2),
      },
    });
  } catch (error) {
    logger.error('Error resolving offer:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getShopConfig = async (req, res, next) => {
  try {
    const { shop_domain, shop_uuid } = req.query;

    if (!shop_domain && !shop_uuid) {
      return res.status(400).json({
        error: 'shop_domain or shop_uuid is required',
      });
    }

    const shopIntegration = shop_uuid
      ? await findShopIntegrationByUuid(shop_uuid)
      : await findShopIntegrationByDomain(shop_domain);

    if (!shopIntegration) {
      return res.status(404).json({
        error: 'Shop integration not found',
      });
    }

    return res.status(200).json({
      uuid: shopIntegration.uuid,
      shop_name: shopIntegration.shop_name,
      config: shopIntegration.config || {},
      active: shopIntegration.active,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  resolveOfferByCart,
  getShopConfig,
};
