const { ProductRepository } = require('../repository/product.repository');
const {
  ProductOfferRepository,
} = require('../repository/productOffer.repository');

async function getIdsByUuid(props) {
  const { offerUuid, productUuid } = props;

  let productId = null;
  let offerId = null;

  if (productUuid) {
    const { id } = await ProductRepository.findOne({
      where: { uuid: productUuid },
      values: ['id'],
    });
    productId = id;
  }

  if (offerUuid) {
    const { id } = await ProductOfferRepository.findOne({
      where: { uuid: offerUuid },
      values: ['id'],
    });
    offerId = id;
  }

  return { offerId, productId, offerUuid, productUuid };
}

module.exports = { getIdsByUuid };
