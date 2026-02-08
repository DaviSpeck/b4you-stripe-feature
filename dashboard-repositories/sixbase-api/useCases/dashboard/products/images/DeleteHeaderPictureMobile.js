const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteHeaderPictureMobile {
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
    if (!product.header_picture_mobile_key)
      throw ApiError.badRequest('Produto não possui uma header mobile');
    await this.#FileManager.deleteFile(product.header_picture_mobile_key);
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        header_picture_mobile_key: null,
        header_picture_mobile: null,
      },
    );
  }
};
