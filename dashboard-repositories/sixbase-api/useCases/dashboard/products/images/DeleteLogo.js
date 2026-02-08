const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteLogo {
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
    if (!product.logo_key) throw ApiError.badRequest('Produto sem logo');
    await this.#FileManager.deleteFile(product.logo_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        logo_key: null,
        logo: null,
      },
    );
  }
};
