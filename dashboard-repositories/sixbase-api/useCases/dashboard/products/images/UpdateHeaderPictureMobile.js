const fs = require('fs');
const ImageHelper = require('../../../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../../../utils/files');
const ApiError = require('../../../../error/ApiError');

module.exports = class UpdateHeaderPictureMobile {
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
    const fileBuffer = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);
    fs.unlinkSync(file.path);
    const { file: url, key } = dataHeader;
    await this.#ProductsRepository.update(
      { id: product.id },
      { header_picture_mobile: url, header_picture_mobile_key: key },
    );
    return url;
  }
};
