const fs = require('fs').promises;
const ApiError = require('../../../../error/ApiError');
const { resolveImageFromBuffer } = require('../../../../utils/files');
const ImageHelper = require('../../../../utils/helpers/images');
const Product_images = require('../../../../database/models/Product_images');
const { findImageTypeByKey } = require('../../../../types/imageTypes');

module.exports = class CreateGeneral {
  #ProductsRepository;
  #ProductsImageRepository;

  constructor(ProductsRepository, ProductsImageRepository) {
    this.#ProductsRepository = ProductsRepository;
    this.#ProductsImageRepository = ProductsImageRepository;
  }

  async execute({ product_uuid, file, id_user, id_type, isGif }) {
    if (!file)
      throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
    const product = await this.#ProductsRepository.findWithProducer({
      uuid: product_uuid,
      id_user,
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    if (id_type === findImageTypeByKey('market-cover').id) {
      const productImages = await Product_images.findAll({
        where: { id_product: product.id, id_type },
      })
      if (productImages.length >= 3) {
        throw ApiError.badRequest('É permitido apenas 3 imagens de capa de mercado!');
      }
    }
    let dataHeader;
    if (isGif) {
      // Processamento direto para GIFs
      const buffer = await fs.readFile(file.path);
      dataHeader = await resolveImageFromBuffer(buffer, file.key);
    } else {
      // Processamento padrão para outros formatos
      const fileBuffer = await ImageHelper.toBuffer(file.path);
      dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);
    }
    const { file: url, key } = dataHeader;
    const imageProduct = await this.#ProductsImageRepository.create({
      file: url,
      key,
      id_user,
      id_product: product.id,
      id_type,
    });

    // Exclusão assíncrona do arquivo temporário
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error('Erro ao excluir arquivo temporário:', err);
    }

    return { url, imageProduct };
  }
};