const ApiError = require('../../../../error/ApiError');
const {
  UpsellNativeOfferRepository,
} = require('../../../../repositories/sequelize/upsellNativeOffer');

async function verifyUpsellOfferExists(props) {
  const { offer_id, user, values } = props;

  if (!offer_id) {
    throw ApiError.badRequest('offer_id é obrigatório');
  }

  const where = { offer_id };

  const upsellData = await UpsellNativeOfferRepository.findOne({
    where,
    values,
  });

  if (!upsellData) {
    throw ApiError.NotFound('Upsell nativo não existe');
  }

  return upsellData;
}

module.exports = { verifyUpsellOfferExists };
