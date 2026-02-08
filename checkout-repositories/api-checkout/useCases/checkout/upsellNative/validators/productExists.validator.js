const Products = require('../../../../database/models/Products');
const ApiError = require('../../../../error/ApiError');

async function verifyProductExists(props) {
  const { id, uuid, values } = props;

  const productData = await Products.findOne({
    where: uuid ? { uuid } : { id },
    raw: true,
    ...(values && values.length && { attributes: values }),
  });

  if (!productData) {
    throw ApiError.notFound('Produto não existe');
  }

  return productData;
}

module.exports = { verifyProductExists };
