const Upsell_native_offer = require('../../../../database/models/Upsell_native_offer');
const Upsell_native_product = require('../../../../database/models/Upsell_native_product');
const { getUuidsById } = require('../utils/getUuidsById.util');
const { verifyOfferExists } = require('../validators/offerExists.validator');
const { verifyProductExists } = require('../validators/productExists.validator');

const GetUpsellDataByOfferUuidService = async ({ uuid }) => {
  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product'],
  });

  let upsell = await Upsell_native_offer.findOne({
    where: { offer_id: offer.id },
    raw: true,
  });

  let origin = 'offer';

  if (!upsell) {
    const { id: product_id } = await verifyProductExists({
      id: offer.id_product,
      values: ['id'],
    });

    upsell = await Upsell_native_product.findOne({
      where: { product_id },
      raw: true,
    });

    origin = 'product';
  }

  if (!upsell) return null;

  const { offerUuid, productUuid } = await getUuidsById({
    offerId: upsell.upsell_offer_id,
    productId: upsell.upsell_product_id,
  });

  return {
    ...upsell,
    origin,
    upsell_offer_id: offerUuid,
    upsell_product_id: productUuid ?? null,
  };
};

module.exports = { GetUpsellDataByOfferUuidService };
