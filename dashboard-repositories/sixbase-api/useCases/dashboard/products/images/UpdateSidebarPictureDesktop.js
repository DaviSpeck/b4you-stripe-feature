const fs = require('fs');
const ImageHelper = require('../../../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../../../utils/files');
const ApiError = require('../../../../error/ApiError');

module.exports = class UpdateSidebarPictureDesktop {
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
    const fileBufferDesktop = await ImageHelper.resizeImageSidebar(
      file.path,
      ImageHelper.CONFIG.PRODUCT_SIDEBAR_DESKTOP,
    );
    const dataFileDesktop = await resolveImageFromBuffer(
      fileBufferDesktop,
      file.key,
    );
    fs.unlinkSync(file.path);
    const { file: url, key } = dataFileDesktop;
    await this.#ProductsRepository.update(
      { id: product.id },
      { sidebar_picture: url, sidebar_key: key },
    );
    return url;
  }
};
