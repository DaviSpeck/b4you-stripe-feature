const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteSidebarPictureDesktop {
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
    if (!product.sidebar_key)
      throw ApiError.badRequest('Produto não possui imagem sidebar desktop');
    await this.#FileManager.deleteFile(product.sidebar_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        sidebar_picture: null,
        sidebar_key: null,
      },
    );
  }
};
