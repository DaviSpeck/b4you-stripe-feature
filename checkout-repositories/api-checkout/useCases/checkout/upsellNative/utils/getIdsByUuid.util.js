const Product_offer = require('../../../../database/models/Product_offer');
const Products = require('../../../../database/models/Products');

async function getIdsByUuid(props) {
  const { offerUuid, productUuid } = props;

  let productId = null;
  let offerId = null;

  if (productUuid) {
    const { id } = await Products.findOne({
      where: { uuid: productUuid },
      attributes: ['id'],
      raw: true,
    });
    productId = id;
  }

  if (offerUuid) {
    const { id } = await Product_offer.findOne({
      where: { uuid: offerUuid },
      attributes: ['id'],
      raw: true,
    });
    offerId = id;
  }

  return { offerId, productId, offerUuid, productUuid };
}

module.exports = { getIdsByUuid };
