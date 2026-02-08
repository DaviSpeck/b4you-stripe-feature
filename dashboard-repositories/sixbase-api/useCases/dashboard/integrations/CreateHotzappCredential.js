const ApiError = require('../../../error/ApiError');
const { findIntegrationType } = require('../../../types/integrationTypes');
const { createPlugin } = require('../../../database/controllers/plugins');
const {
  findSingleProductWithProducer,
} = require('../../../database/controllers/products');

module.exports = class {
  constructor({ id_user, product_uuid, url }) {
    this.id_user = id_user;
    this.product_uuid = product_uuid;
    this.url = url;
  }

  async execute() {
    const settings = {
      url: this.url,
      allProducts: true,
    };
    if (this.product_uuid) {
      const product = await findSingleProductWithProducer({
        id_user: this.id_user,
        uuid: this.product_uuid,
      });
      if (!product)
        throw ApiError.badRequest(
          'Você só pode utilizar esta integração em produtos em que você é produtor',
        );
      settings.product_id = product.id;
      settings.allProducts = false;
      settings.product_name = product.name;
      settings.product_uuid = product.uuid;
    }
    const plugin = await createPlugin({
      id_user: this.id_user,
      id_plugin: findIntegrationType('HotzApp').id,
      settings,
    });
    return plugin;
  }
};
