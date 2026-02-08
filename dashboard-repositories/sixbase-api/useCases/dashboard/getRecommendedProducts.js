const ApiError = require('../../error/ApiError');
const db = require('../../database/models');

/**
 * Busca a configuração de produtos recomendados
 */
module.exports = async ({ uuidProduct, idUser }) => {
  const { products, membership_page_layouts: MembershipPageLayouts } =
    db.sequelize.models;

  const product = await products.findOne({
    where: {
      uuid: uuidProduct,
      id_user: idUser,
    },
  });

  if (!product) {
    throw new ApiError('Produto não encontrado', 404);
  }

  const layoutRow = await MembershipPageLayouts.findOne({
    where: { id_product: product.id },
  });

  if (!layoutRow) {
    return {
      enabled: false,
      layout: 'horizontal',
      recommendedProducts: [],
    };
  }

  return {
    enabled: layoutRow.recommended_products_enabled || false,
    layout: layoutRow.recommended_products_layout || 'horizontal',
    recommendedProducts: layoutRow.recommended_products || [],
  };
};
