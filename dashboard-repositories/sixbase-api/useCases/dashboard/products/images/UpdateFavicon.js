const fs = require('fs');
const ApiError = require('../../../../error/ApiError');
const ImageHelper = require('../../../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../../../utils/files');

module.exports = class UpdateFavicon {
  #ProductsRepository;

  constructor(ProductsRepository) {
    this.#ProductsRepository = ProductsRepository;
  }

  async execute({ product_uuid, id_user, file }) {
    if (!file)
      throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const fileBuffer = await ImageHelper.resizeFavicon(
      file.path,
      ImageHelper.CONFIG.FAVICON,
    );
    const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);
    fs.unlinkSync(file.path);
    const { file: url, key } = dataHeader;
    await this.#ProductsRepository.update(
      { id: product.id },
      { favicon: url, favicon_key: key },
    );
    return url;
  }
};
