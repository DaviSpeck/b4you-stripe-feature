const ApiError = require('../../../../error/ApiError');
const {
  UpsellNativeProductRepository,
} = require('../../../../repositories/sequelize/upsellNativeProduct');

async function verifyUpsellProductExists(props) {
  const { product_id, values } = props;

  if (!product_id) {
    throw ApiError.badRequest('product_id do produto é obrigatório');
  }

  let resolvedProductId = product_id;

  const upsellData = await UpsellNativeProductRepository.findOne({
    where: { product_id: resolvedProductId },
    values,
  });

  if (!upsellData) {
    throw ApiError.NotFound('Upsell nativo não existe');
  }

  return upsellData;
}

module.exports = { verifyUpsellProductExists };
