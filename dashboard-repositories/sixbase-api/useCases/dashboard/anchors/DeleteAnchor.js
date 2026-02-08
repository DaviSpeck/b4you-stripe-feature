const ApiError = require('../../../error/ApiError');

module.exports = class CreateAnchor {
  #anchorsRepository;

  #modulesAnchorsRepository;

  constructor(anchorsRepository, modulesAnchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
    this.#modulesAnchorsRepository = modulesAnchorsRepository;
  }

  async execute({ id_product, uuid }) {
    const anchor = await this.#anchorsRepository.find({ id_product, uuid });
    if (!anchor) throw ApiError.badRequest('Âncora não encontrada');
    await this.#anchorsRepository.delete({
      id_product,
      uuid,
    });
    await this.#modulesAnchorsRepository.delete({ id_anchor: anchor.id });
    const anchors = await this.#anchorsRepository.findAll({ id_product });
    return anchors;
  }
};
