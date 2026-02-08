const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteCoverCustom {
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
    if (!product.cover_custom_key)
      throw ApiError.badRequest('Produto não possui uma capa customizada');
    await this.#FileManager.deleteFile(product.cover_custom_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        cover_custom: null,
        cover_custom_key: null,
      },
    );
  }
};

