const ApiError = require('../../../../error/ApiError');

module.exports = class DeleteGeneral {
  #ProductsRepository;

  #ProductsImageRepository;

  #FileManager;

  constructor(ProductsRepository, ProductsImageRepository, FileManager) {
    this.#ProductsRepository = ProductsRepository;
    this.#ProductsImageRepository = ProductsImageRepository;
    this.#FileManager = FileManager;
  }

  async execute({ product_uuid, uuid, id_user }) {
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    if (!uuid)
      throw ApiError.badRequest(
        'É necessário enviar um identificador da imagem',
      );
    const productImage = await this.#ProductsImageRepository.find({ uuid });
    if (!productImage)
      throw ApiError.badRequest('Imagem do produto não encontrada');
    await this.#FileManager.deleteFile(productImage.key);
    await this.#ProductsImageRepository.delete({ uuid });
  }
};
