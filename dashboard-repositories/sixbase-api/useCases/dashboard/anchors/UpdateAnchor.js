const ApiError = require('../../../error/ApiError');

module.exports = class UpdateAnchor {
  #anchorsRepository;

  constructor(anchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
  }

  async execute({ label, id_product, uuid }) {
    const anchor = await this.#anchorsRepository.find({ id_product, uuid });
    if (!anchor) throw ApiError.badRequest('Âncora não encontrada');
    await this.#anchorsRepository.update(
      { id: anchor.id },
      {
        label,
      },
    );
    const updatedAnchor = await this.#anchorsRepository.find({ id: anchor.id });
    return updatedAnchor;
  }
};
