const ApiError = require('../../../../error/ApiError');
const {
  ProductOfferRepository,
} = require('../repository/productOffer.repository');

async function verifyOfferExists(params) {
  const { uuid, user, values } = params;

  if (!uuid) {
    throw ApiError.badRequest('UUID da oferta é obrigatório');
  }

  const where = {};

  if (uuid) where.uuid = uuid;

  const offerData = await ProductOfferRepository.findOne({
    where,
    values,
  });

  if (!offerData) {
    throw ApiError.NotFound('Oferta não existe');
  }

  return offerData;
}

module.exports = { verifyOfferExists };
