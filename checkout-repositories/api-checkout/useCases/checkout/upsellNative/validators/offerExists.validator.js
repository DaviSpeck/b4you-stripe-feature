const Product_offer = require('../../../../database/models/Product_offer');
const ApiError = require('../../../../error/ApiError');

async function verifyOfferExists(params) {
  const { uuid, values } = params;

  const offerData = await Product_offer.findOne({
    where: { uuid },
    raw: true,
    ...(values && values.length > 0 && { attributes: values }),
  });

  if (!offerData) {
    throw ApiError.notFound('Oferta não existe');
  }

  return offerData;
}

module.exports = { verifyOfferExists };
