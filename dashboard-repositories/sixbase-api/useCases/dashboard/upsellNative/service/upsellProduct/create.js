const { ProductRepository } = require('../../repository/product.repository');
const { upsellSerealizer } = require('../../upsellNative.serealizer');
const {
  UpsellNativeProductRepository,
} = require('../../../../../repositories/sequelize/upsellNativeProduct');
const {
  initalUpsellNativeData,
} = require('../../utils/initialUpsellNativeData');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');

async function Create(params) {
  const { uuid, user } = params;

  const product = await verifyProductExists({
    uuid,
    user,
    values: ['id'],
  });
  const product_id = product.id;

  const existingUpsell = await UpsellNativeProductRepository.findOne({
    where: { product_id },
  });

  if (existingUpsell) {
    await ProductRepository.update({
      where: { id: product_id },
      data: { is_upsell_active: true },
    });

    return upsellSerealizer({
      ...existingUpsell,
      is_active: true,
    });
  }

  await ProductRepository.update({
    where: { id: product_id },
    data: { is_upsell_active: true },
  });

  const initialData = initalUpsellNativeData({
    product_id,
  });

  const upsellNativeData = await UpsellNativeProductRepository.create(
    initialData,
  );

  return upsellSerealizer({
    ...upsellNativeData.dataValues,
    is_active: true,
  });
}

module.exports = { Create };
