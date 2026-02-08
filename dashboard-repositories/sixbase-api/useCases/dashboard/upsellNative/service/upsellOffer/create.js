const ApiError = require('../../../../../error/ApiError');
const { upsellSerealizer } = require('../../upsellNative.serealizer');
const {
  initalUpsellNativeData,
} = require('../../utils/initialUpsellNativeData');
const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');
const {
  ProductOfferRepository,
} = require('../../repository/productOffer.repository');
const {
  UpsellNativeOfferRepository,
} = require('../../../../../repositories/sequelize/upsellNativeOffer');

async function Create(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const {
    id: offer_id,
    id_product,
    offer_uuid,
  } = offer;

  const product = await verifyProductExists({
    id: id_product,
    user,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellOffer = await UpsellNativeOfferRepository.findOne({
    where: { offer_id },
    values: ['id'],
  });

  if (upsellOffer) {
    throw ApiError.NotFound('Está oferta já tem um upsell nativo configurado');
  }

  const initialData = initalUpsellNativeData({
    product_id,
  });

  const upsellNativeData = await UpsellNativeOfferRepository.create({
    ...initialData,
    offer_id,
    product_id,
  });

  await ProductOfferRepository.update({
    where: { id: offer_id },
    data: { is_upsell_native: true, is_upsell_active: true },
  });

  return upsellSerealizer({
    ...initialData,
    creation_origin: 'self',
    upsell_product_id: null,
    upsell_offer_id: null,
    offerId: offer_uuid,
    is_active: true,
    is_one_click: Boolean(upsellNativeData.is_one_click),
    is_embed_video: Boolean(upsellNativeData.is_embed_video),
    is_active_message: Boolean(upsellNativeData.is_active_message),
    is_multi_offer: Boolean(upsellNativeData.is_multi_offer),
  });
}

module.exports = { Create };
