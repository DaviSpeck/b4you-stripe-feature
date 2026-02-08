const Product_offer = require('../../../../database/models/Product_offer');
const Products = require('../../../../database/models/Products');

async function getUuidsById(props) {
  const { offerId, productId } = props;

  let productUuid = null;
  let offerUuid = null;

  if (productId) {
    const { uuid } = await Products.findOne({
      where: { id: productId },
      attributes: ['uuid'],
      raw: true,
    });

    productUuid = uuid;
  }

  if (offerId) {
    const { uuid } = await Product_offer.findOne({
      where: { id: offerId },
      attributes: ['uuid'],
      raw: true,
    });
    offerUuid = uuid;
  }

  return { offerUuid, offerId, productUuid, productId };
}

module.exports = { getUuidsById };
