const fs = require('fs');
const ImageHelper = require('../../../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../../../utils/files');
const ApiError = require('../../../../error/ApiError');

module.exports = class UpdateSecondHeaderMobile {
  #ProductsRepository;

  constructor(ProductsRepository) {
    this.#ProductsRepository = ProductsRepository;
  }

  async execute({ product_uuid, id_user, file }) {
    if (!file) throw ApiError.badRequest('Arquivo não enviado');
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const fileBuffer = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const imageData = await resolveImageFromBuffer(fileBuffer, file.key);
    fs.unlinkSync(file.path);
    const { file: url, key } = imageData;
    await this.#ProductsRepository.update(
      { id: product.id },
      {
        second_header_mobile: url,
        second_header_mobile_key: key,
      },
    );
    return url;
  }
};
