const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const Cache = require('../../config/Cache');
const { VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE } = require('../../types/productTypes');

module.exports = async ({
  uuidProduct,
  idUser,
  enabled,
  layout,
  recommendedProducts,
}) => {
  const { products, membership_page_layouts: MembershipPageLayouts } =
    db.sequelize.models;

  const product = await products.findOne({
    where: {
      uuid: uuidProduct,
      id_user: idUser,
    },
  });

  if (!product) {
    throw new ApiError(404, 'Produto não encontrado');
  }

  const allowedTypes = [VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE];
  if (!allowedTypes.includes(product.id_type)) {
    throw new ApiError(
      400,
      'Produtos recomendados disponíveis apenas para produtos do tipo vídeo/curso, e-book, apenas pagamento ou físico',
    );
  }

  if (enabled && recommendedProducts) {
    if (!Array.isArray(recommendedProducts)) {
      throw new ApiError(400, 'recommendedProducts deve ser um array');
    }

    const {
      product_offer: ProductOffer,
      product_pages: ProductPages,
      product_plans: ProductPlans,
    } = db.sequelize.models;

    const validateItem = async (item) => {
      if (!item.id_product || typeof item.order !== 'number') {
        throw new ApiError(
          400,
          'Cada item deve ter id_product e order definidos',
        );
      }

      const recommendedProduct = await products.findOne({
        where: { id: item.id_product },
        attributes: ['id', 'id_user', 'id_type', 'payment_type'],
      });

      if (!recommendedProduct) {
        throw new ApiError(
          404,
          `Produto com id ${item.id_product} não encontrado`,
        );
      }

      if (recommendedProduct.id_user !== product.id_user) {
        throw new ApiError(
          403,
          `Produto ${item.id_product} não pertence ao mesmo produtor`,
        );
      }

      const allowedRecommendedTypes = [VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE];
      if (!allowedRecommendedTypes.includes(recommendedProduct.id_type)) {
        throw new ApiError(
          400,
          `Produto ${item.id_product} não é do tipo vídeo/curso, e-book, apenas pagamento ou físico`,
        );
      }

      if (item.id_offer) {
        const offer = await ProductOffer.findOne({
          where: {
            id: item.id_offer,
            id_product: item.id_product,
            active: true,
          },
          include: [
            {
              model: ProductPlans,
              as: 'plans',
              attributes: ['id'],
              required: false,
            },
          ],
        });

        if (!offer) {
          throw new ApiError(
            404,
            `Oferta com id ${item.id_offer} não encontrada ou inativa para o produto ${item.id_product}`,
          );
        }

        if (recommendedProduct.payment_type === 'subscription') {
          if (!offer.plans || offer.plans.length === 0) {
            throw new ApiError(
              400,
              `A oferta ${item.id_offer} do produto ${item.id_product} é do tipo assinatura e deve ter pelo menos um plano vinculado`,
            );
          }
        }
      }

      if (item.checkout_type !== undefined) {
        if (![1, 2].includes(item.checkout_type)) {
          throw new ApiError(
            400,
            'checkout_type deve ser 1 (single) ou 2 (three-steps)',
          );
        }

        const checkoutTypes =
          recommendedProduct.available_checkout_link_types || 3;
        if (checkoutTypes !== 3 && checkoutTypes !== item.checkout_type) {
          throw new ApiError(
            400,
            `Produto ${item.id_product} não suporta o tipo de checkout ${item.checkout_type}`,
          );
        }
      }

      if (item.id_page) {
        const page = await ProductPages.findOne({
          where: {
            id: item.id_page,
            id_product: item.id_product,
          },
        });

        if (!page) {
          throw new ApiError(
            404,
            `Página com id ${item.id_page} não encontrada para o produto ${item.id_product}`,
          );
        }
      }

      if (item.promotion_enabled) {
        if (!item.promotion_offer_id) {
          throw new ApiError(
            400,
            `promotion_offer_id é obrigatório quando promotion_enabled é true para o produto ${item.id_product}`,
          );
        }

        const promotionOffer = await ProductOffer.findOne({
          where: {
            id: item.promotion_offer_id,
            id_product: item.id_product,
          },
          include: [
            {
              model: ProductPlans,
              as: 'plans',
              attributes: ['id'],
              required: false,
            },
          ],
        });

        if (!promotionOffer) {
          throw new ApiError(
            404,
            `Oferta de promoção com id ${item.promotion_offer_id} não encontrada para o produto ${item.id_product}`,
          );
        }

        if (recommendedProduct.payment_type === 'subscription') {
          if (!promotionOffer.plans || promotionOffer.plans.length === 0) {
            throw new ApiError(
              400,
              `A oferta de promoção ${item.promotion_offer_id} do produto ${item.id_product} é do tipo assinatura e deve ter pelo menos um plano vinculado`,
            );
          }
        }

        if (item.promotion_offer_id === item.id_offer) {
          throw new ApiError(
            400,
            `A oferta de promoção não pode ser a mesma da oferta principal para o produto ${item.id_product}`,
          );
        }
      }
    };

    await Promise.all(recommendedProducts.map(validateItem));
  }

  const validLayout = ['horizontal', 'vertical'].includes(layout)
    ? layout
    : 'horizontal';

  const [layoutRow] = await MembershipPageLayouts.findOrCreate({
    where: { id_product: product.id },
    defaults: {
      id_product: product.id,
      recommended_products_enabled: enabled || false,
      recommended_products_layout: validLayout,
      recommended_products: recommendedProducts || null,
    },
  });

  await layoutRow.update({
    recommended_products_enabled: enabled || false,
    recommended_products_layout: validLayout,
    recommended_products: enabled ? recommendedProducts : null,
  });

  const layoutCacheKey = `membership_page_layout:${uuidProduct}`;
  await Cache.del(layoutCacheKey);

  return {
    enabled: layoutRow.recommended_products_enabled,
    layout: layoutRow.recommended_products_layout,
    recommendedProducts: layoutRow.recommended_products || [],
  };
};
