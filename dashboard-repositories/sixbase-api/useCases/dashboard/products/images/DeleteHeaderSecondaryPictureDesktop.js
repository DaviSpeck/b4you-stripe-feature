const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteHeaderPictureDesktop {
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
    if (!product.second_header_key)
      throw ApiError.badRequest('Produto não possui foto uma imagem de header');
    await this.#FileManager.deleteFile(product.second_header_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        second_header: null,
        second_header_key: null,
      },
    );
  }
};
