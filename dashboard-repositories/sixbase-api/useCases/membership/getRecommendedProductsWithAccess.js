const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const Cache = require('../../config/Cache');
const { VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE } = require('../../types/productTypes');

const CONTENT_TYPES = [VIDEOTYPE, EBOOKTYPE];
const STORE_TYPES = [PAYMENT_ONLY_TYPE, PHYSICAL_TYPE];

module.exports = async ({ uuidProduct, idStudent }) => {
  const cacheKey = `recommended_products:${uuidProduct}:${idStudent}`;
  const cached = await Cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const {
    products,
    membership_page_layouts: MembershipPageLayouts,
    product_offer: ProductOffer,
    product_pages: ProductPages,
    student_products: StudentProducts,
    subscriptions,
    modules: Modules,
    products_ebooks: ProductsEbooks,
  } = db.sequelize.models;

  const product = await products.findOne({
    where: { uuid: uuidProduct },
  });

  if (!product) {
    throw new ApiError('Produto não encontrado', 404);
  }

  const layoutRow = await MembershipPageLayouts.findOne({
    where: { id_product: product.id },
  });

  if (
    !layoutRow ||
    !layoutRow.recommended_products_enabled ||
    !layoutRow.recommended_products ||
    layoutRow.recommended_products.length === 0
  ) {
    const result = {
      enabled: false,
      layout: 'horizontal',
      products: [],
      contentProducts: [],
      storeProducts: [],
    };
    await Cache.set(cacheKey, JSON.stringify(result), 10);
    return result;
  }

  const recommendedIds = layoutRow.recommended_products.map(
    (item) => item.id_product,
  );

  const recommendedProducts = await products.findAll({
    where: { id: recommendedIds },
    attributes: [
      'id',
      'uuid',
      'name',
      'cover',
      'description',
      'content_delivery',
      'support_whatsapp',
      'id_type',
    ],
    include: [
      {
        model: ProductOffer,
        as: 'product_offer',
        attributes: ['id', 'uuid', 'price', 'active'],
        required: false,
      },
      {
        model: ProductPages,
        as: 'product_pages',
        attributes: ['id', 'uuid', 'label', 'url'],
        required: false,
      },
      {
        model: Modules,
        as: 'module',
        attributes: ['id'],
        required: false,
      },
      {
        model: ProductsEbooks,
        as: 'ebooks',
        attributes: ['id'],
        required: false,
      },
    ],
  });

  const productsWithContent = recommendedProducts.filter((prod) => {
    if (prod.id_type === VIDEOTYPE) {
      return prod.module && prod.module.length > 0;
    }
    if (prod.id_type === EBOOKTYPE) {
      return prod.ebooks && prod.ebooks.length > 0;
    }
    if (prod.id_type === PAYMENT_ONLY_TYPE || prod.id_type === PHYSICAL_TYPE) {
      return true;
    }
    return false;
  });

  const productsWithPrice = productsWithContent.filter((prod) => {
    if (!prod.product_offer || prod.product_offer.length === 0) {
      return false;
    }
    return prod.product_offer.some((offer) => offer.price > 0);
  });

  const configMap = {};
  layoutRow.recommended_products.forEach((item) => {
    configMap[item.id_product] = {
      order: item.order,
      id_offer: item.id_offer || null,
      checkout_type: item.checkout_type || null,
      id_page: item.id_page || null,
      promotion_enabled: item.promotion_enabled || false,
      promotion_offer_id: item.promotion_offer_id || null,
    };
  });

  const processedProducts = await Promise.all(
    productsWithPrice.map(async (prod) => {
      const config = configMap[prod.id] || {
        order: 999,
        id_offer: null,
        checkout_type: null,
        id_page: null,
        promotion_enabled: false,
        promotion_offer_id: null,
      };

      const isContentProduct = CONTENT_TYPES.includes(prod.id_type);
      const isStoreProduct = STORE_TYPES.includes(prod.id_type);

      let hasAccess = false;
      if (isContentProduct) {
        const studentProduct = await StudentProducts.findOne({
          where: {
            id_student: idStudent,
            id_product: prod.id,
          },
        });

        if (studentProduct) {
          hasAccess = true;
        } else {
          const subscription = await subscriptions.findOne({
            where: {
              id_student: idStudent,
              id_product: prod.id,
              active: true,
              canceled_at: null,
              [Op.or]: [
                { valid_until: null },
                { valid_until: { [Op.gte]: new Date() } },
              ],
            },
          });

          if (subscription) {
            hasAccess = true;
          }
        }
      }

      let selectedOffer = null;
      const activeOffers = (prod.product_offer || []).filter(
        (offer) => offer.active,
      );

      if (config.id_offer && activeOffers.length > 0) {
        selectedOffer = activeOffers.find(
          (offer) => offer.id === config.id_offer,
        );
      }
      if (!selectedOffer && activeOffers.length > 0) {
        [selectedOffer] = activeOffers;
      }

      let checkoutUrl = null;
      const shouldGenerateCheckout = isStoreProduct || !hasAccess;

      if (shouldGenerateCheckout && selectedOffer) {
        const checkoutType = config.checkout_type || 1;
        const offerUuid = selectedOffer.uuid;

        if (checkoutType === 2) {
          checkoutUrl = `${process.env.URL_SIXBASE_CHECKOUT}/${offerUuid}/3steps`;
        } else {
          checkoutUrl = `${process.env.URL_SIXBASE_CHECKOUT}/${offerUuid}`;
        }
      } else if (shouldGenerateCheckout && prod.uuid) {
        const checkoutType = config.checkout_type || 1;
        if (checkoutType === 2) {
          checkoutUrl = `${process.env.URL_SIXBASE_CHECKOUT}/${prod.uuid}/3steps`;
        } else {
          checkoutUrl = `${process.env.URL_SIXBASE_CHECKOUT}/${prod.uuid}`;
        }
      }

      let pageUrl = null;
      if (config.id_page && prod.product_pages) {
        const selectedPage = prod.product_pages.find(
          (page) => page.id === config.id_page,
        );
        if (
          selectedPage &&
          selectedPage.url &&
          selectedPage.url.trim() !== ''
        ) {
          pageUrl = selectedPage.url;
        }
      }

      let promotionPrice = null;
      if (
        config.promotion_enabled &&
        config.promotion_offer_id &&
        prod.product_offer
      ) {
        const promotionOffer = prod.product_offer.find(
          (offer) => offer.id === config.promotion_offer_id,
        );
        if (promotionOffer) {
          promotionPrice = promotionOffer.price;
        }
      }

      return {
        id: prod.id,
        uuid: prod.uuid,
        name: prod.name,
        cover: prod.cover,
        price: selectedOffer ? Math.round(selectedOffer.price * 100) : 0,
        description: prod.description,
        contentDelivery: prod.content_delivery,
        hasAccess,
        order: config.order || 999,
        checkoutUrl,
        pageUrl,
        supportWhatsapp: prod.support_whatsapp || null,
        promotionEnabled: config.promotion_enabled || false,
        promotionPrice: promotionPrice
          ? Math.round(promotionPrice * 100)
          : null,
        productType: isContentProduct ? 'content' : 'store',
        idType: prod.id_type,
      };
    }),
  );

  const contentProducts = processedProducts
    .filter((p) => p.productType === 'content')
    .sort((a, b) => a.order - b.order);

  const storeProducts = processedProducts
    .filter((p) => p.productType === 'store')
    .sort((a, b) => a.order - b.order);

  const result = {
    enabled: true,
    layout: layoutRow.recommended_products_layout || 'horizontal',
    products: processedProducts.sort((a, b) => a.order - b.order),
    contentProducts,
    storeProducts,
  };

  await Cache.set(cacheKey, JSON.stringify(result), 10);

  return result;
};
