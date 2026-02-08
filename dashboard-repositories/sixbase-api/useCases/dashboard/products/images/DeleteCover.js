const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteCover {
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
    if (!product.cover_key) throw ApiError.badRequest('Produto sem capa');
    await this.#FileManager.deleteFile(product.cover_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        cover_key: null,
        cover: null,
      },
    );
  }
};
