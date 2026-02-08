const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  UpsellNativeOfferRepository,
} = require('../../../../../repositories/sequelize/upsellNativeOffer');
const {
  UpsellNativeProductRepository,
} = require('../../../../../repositories/sequelize/upsellNativeProduct');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');

async function GetCheck(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid', 'thankyou_page_upsell'],
    user
  });

  const product = await verifyProductExists({
    id: offer.id_product,
    user,
    values: ['id'],
  });

  const productUpsellNative = await UpsellNativeProductRepository.findOne({
    where: { product_id: product.id },
    values: ['id', 'product_id'],
  });

  const offerUpsellNative = await UpsellNativeOfferRepository.findOne({
    where: { offer_id: offer.id },
    values: ['id'],
  });

  return {
    isUpsellNativeOffer: Boolean(offerUpsellNative),
    isUpsellProduct: Boolean(productUpsellNative),
    isUpsell:
      Boolean(productUpsellNative) ||
      Boolean(offerUpsellNative) ||
      Boolean(offer.thankyou_page_upsell),
  };
}

module.exports = { GetCheck };
