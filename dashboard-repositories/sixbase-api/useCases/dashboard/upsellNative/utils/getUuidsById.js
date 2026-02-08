const { ProductRepository } = require('../repository/product.repository');
const {
  ProductOfferRepository,
} = require('../repository/productOffer.repository');

async function getUuidsById(props) {
  const { offerId, productId } = props;

  let productUuid = null;
  let offerUuid = null;

  if (productId) {
    const { uuid } = await ProductRepository.findOne({
      where: { id: productId },
      values: ['uuid'],
    });

    productUuid = uuid;
  }

  if (offerId) {
    const { uuid } = await ProductOfferRepository.findOne({
      where: { id: offerId },
      values: ['uuid'],
    });
    offerUuid = uuid;
  }

  return { offerUuid, offerId, productUuid, productId };
}

module.exports = { getUuidsById };
