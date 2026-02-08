const { upsellSerealizer } = require('../../upsellNative.serealizer');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');
const { getUuidsById } = require('../../utils/getUuidsById');
const {
  verifyUpsellProductExists,
} = require('../../validators/upsellProductExist.validator');
const { multiOffer } = require('../../utils/multiOffer');

async function Get(params) {
  const { uuid, user } = params;

  const { id: product_id, is_upsell_active } = await verifyProductExists({
    uuid,
    user,
    values: ['id', 'is_upsell_active'],
  });

  const upsell = await verifyUpsellProductExists({
    product_id,
  });

  const upsellData = { ...upsell };

  // eslint-disable-next-line no-extra-boolean-cast
  if (Boolean(upsellData.is_multi_offer)) {
    upsellData.offers = await multiOffer({
      user_id: user.id,
      upsell_id: upsellData.id,
    });
  }

  const { offerUuid, productUuid } = await getUuidsById({
    productId: upsellData.upsell_product_id,
    offerId: upsellData.upsell_offer_id,
  });

  return upsellSerealizer({
    ...upsellData,
    is_active: Boolean(is_upsell_active),
    upsell_product_id: productUuid,
    upsell_offer_id: offerUuid,
  });
}

module.exports = { Get };
