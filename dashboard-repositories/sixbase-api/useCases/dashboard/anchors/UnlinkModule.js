const ApiError = require('../../../error/ApiError');

module.exports = class UnlinkModule {
  #anchorsRepository;

  #modulesRepository;

  #modulesAnchorsRepository;

  constructor(anchorsRepository, modulesRepository, modulesAnchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
    this.#modulesRepository = modulesRepository;
    this.#modulesAnchorsRepository = modulesAnchorsRepository;
  }

  async execute({ anchorUuid, moduleUuid, id_product }) {
    const anchor = await this.#anchorsRepository.find({
      uuid: anchorUuid,
      id_product,
    });
    if (!anchor) throw ApiError.badRequest('Âncora não encontrada');
    const module = await this.#modulesRepository.find({
      uuid: moduleUuid,
      id_product,
    });
    if (!module) throw ApiError.badRequest('Módulo não encontrado');
    const linkedAnchor = await this.#modulesAnchorsRepository.findLastOrder({
      id_anchor: anchor.id,
      id_module: module.id,
    });
    if (!linkedAnchor) throw ApiError.badRequest('Link não encontrado');
    await this.#modulesAnchorsRepository.delete({ id: linkedAnchor.id });
    await this.#modulesAnchorsRepository.reorder(
      { id_anchor: anchor.id, id_module: module.id },
      linkedAnchor.order,
    );
  }
};
