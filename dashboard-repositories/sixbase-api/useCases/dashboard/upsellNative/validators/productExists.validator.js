const ApiError = require('../../../../error/ApiError');
const { ProductRepository } = require('../repository/product.repository');

async function verifyProductExists(props) {
  const { uuid, id, user, values } = props;

  if (!uuid && !id) {
    throw ApiError.badRequest('UUID ou ID do produto é obrigatório');
  }

  const where = {};

  if (uuid) where.uuid = uuid;
  if (id) where.id = id;
  if (user?.id) where.id_user = user.id;

  const productData = await ProductRepository.findOne({
    where,
    values,
  });

  if (!productData) {
    throw ApiError.NotFound('Produto não existe ou não pertence ao usuário');
  }

  return productData;
}

module.exports = { verifyProductExists };
