const {
  resolveKeys,
} = require('../../../middlewares/validatorsAndAdapters/common');
const ApiError = require('../../../error/ApiError');
const db = require('../../../database/models');

const validateBody = async (body) => {
  const keys = Object.keys(body);
  if (keys.length === 0) throw ApiError.badRequest('Body da requisição vazio');
  return keys;
};

module.exports = class UpdateProduct {
  #ProductsRepository;

  constructor(ProductsRepository) {
    this.#ProductsRepository = ProductsRepository;
  }

  async save({ product_uuid, id_user, body }) {
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });

    if (!product) throw ApiError.badRequest('Produto não encontrado');

    const keys = await validateBody(body);
    const data = resolveKeys(body, keys);

    data.dimensions = {
      weight: product.dimensions?.weight || 0,
      width: product.dimensions?.width || 0,
      height: product.dimensions?.height || 0,
      length: product.dimensions?.length || 0,
    };

    if (data.weight !== undefined) data.dimensions.weight = data.weight;
    if (data.width !== undefined) data.dimensions.width = data.width;
    if (data.height !== undefined) data.dimensions.height = data.height;
    if (data.length !== undefined) data.dimensions.length = data.length;

    delete data.weight;
    delete data.width;
    delete data.height;
    delete data.length;

    await this.#ProductsRepository.update({ id: product.id }, data);

    // Sincroniza descrição e biografia da área de membros com a tabela de layout
    if (product.content_delivery === 'membership') {
      const { membership_page_layouts: MembershipPageLayouts } =
        db.sequelize.models;

      const [row] = await MembershipPageLayouts.findOrCreate({
        where: { id_product: product.id },
        defaults: {
          id_product: product.id,
          version: '1.0',
        },
      });

      const updateData = {};

      if (data.description !== undefined) {
        updateData.description_title = 'Sobre o Curso';
        updateData.description_use_product_description = false;
        updateData.description_content = data.description;
        updateData.description_show_stats =
          row.description_show_stats === undefined
            ? true
            : row.description_show_stats;
      }

      if (data.biography !== undefined) {
        updateData.producer_biography = data.biography;
      }

      if (Object.keys(updateData).length > 0) {
        await row.update(updateData);
      }
    }

    return product;
  }
};
