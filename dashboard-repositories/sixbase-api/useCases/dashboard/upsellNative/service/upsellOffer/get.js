const {
  UpsellNativeOfferRepository,
} = require('../../../../../repositories/sequelize/upsellNativeOffer');
const { upsellSerealizer } = require('../../upsellNative.serealizer');
const { getUuidsById } = require('../../utils/getUuidsById');
const {
  initalUpsellNativeData,
} = require('../../utils/initialUpsellNativeData');
const { multiOffer } = require('../../utils/multiOffer');
const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');
const {
  verifyUpsellProductExists,
} = require('../../validators/upsellProductExist.validator');

async function Get(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });

  const product = await verifyProductExists({
    id: offer.id_product,
    user,
    values: ['id'],
  });

  const offerUpsell = await UpsellNativeOfferRepository.findOne({
    where: { offer_id: offer.id },
  });

  let upsellNativeOffer = {
    ...initalUpsellNativeData({ product_id: null }),
    offer_id: null,
  };

  if (offerUpsell) {
    upsellNativeOffer = { ...offerUpsell };
  }

  if (!offerUpsell) {
    const productUpsell = await verifyUpsellProductExists({
      product_id: product.id,
    });
    upsellNativeOffer = { ...productUpsell };
  }

  const { productUuid, offerUuid } = await getUuidsById({
    productId: upsellNativeOffer.upsell_product_id,
    offerId: upsellNativeOffer.upsell_offer_id,
  });

  if (upsellNativeOffer.is_multi_offer) {
    upsellNativeOffer.offers = await multiOffer({
      user_id: user.id,
      upsell_id: upsellNativeOffer.id,
    });
  }

  return upsellSerealizer({
    ...upsellNativeOffer,
    offerId: offer.uuid,
    upsellProductId: productUuid,
    upsellOfferId: offerUuid,
    creationOrigin: offerUpsell ? 'self' : 'product',
  });
}

module.exports = { Get };
