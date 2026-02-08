const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteBannerMobile {
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
    if (!product.banner_mobile_key)
      throw ApiError.badRequest('Produto não possui uma imagem banner mobile');
    await this.#FileManager.deleteFile(product.banner_mobile_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        banner_mobile: null,
        banner_mobile_key: null,
      },
    );
  }
};
