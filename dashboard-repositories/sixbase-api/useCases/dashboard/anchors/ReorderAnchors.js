const ApiError = require('../../../error/ApiError');

module.exports = class ReorderAnchors {
  #anchorsRepository;

  constructor(anchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
  }

  async execute({ anchorsUuid, id_product }) {
    const anchors = await this.#anchorsRepository.findAll({
      id_product,
      uuid: anchorsUuid,
    });
    if (anchors.length !== anchorsUuid.length)
      throw ApiError.badRequest('Âncoras não encontradas');
    for await (const [index, uuid] of anchorsUuid.entries()) {
      const anchor = anchors.find((a) => a.uuid === uuid);
      await this.#anchorsRepository.update(
        { id_product, id: anchor.id },
        { order: index + 1 },
      );
    }
  }
};
