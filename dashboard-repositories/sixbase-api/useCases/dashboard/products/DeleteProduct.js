const ApiError = require('../../../error/ApiError');

module.exports = class DeleteProduct {
  #product_id;

  #id_user;

  #ProductsRepository;

  constructor({ product_id, id_user, ProductsRepository }) {
    this.#product_id = product_id;
    this.#id_user = id_user;
    this.#ProductsRepository = ProductsRepository;
  }

  async execute() {
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: this.#product_id,
      id_user: this.#id_user,
    });
    if (!product) throw ApiError.badRequest('product not found');
    await this.#ProductsRepository.delete({ id: product.id });
    return product;
  }
};
