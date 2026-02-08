const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteFavicon {
  #ProductsRepository;

  #FileManager;

  constructor(ProductsRepository, FileManager) {
    this.#ProductsRepository = ProductsRepository;
    this.#FileManager = FileManager;
  }

  async execute({ product_uuid, id_user }) {
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    if (!product.favicon_key)
      throw ApiError.badRequest('Produto não possui um favicon');
    await this.#FileManager.deleteFile(product.favicon_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        favicon_key: null,
        favicon: null,
      },
    );
  }
};
