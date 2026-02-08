const ApiError = require('../../../error/ApiError');

module.exports = class LinkModule {
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
    const lastLinkedAnchor = await this.#modulesAnchorsRepository.findLastOrder(
      {
        id_anchor: anchor.id,
      },
    );
    const linkedModule = await this.#modulesAnchorsRepository.create({
      id_module: module.id,
      id_anchor: anchor.id,
      order: lastLinkedAnchor ? lastLinkedAnchor.order + 1 : 1,
    });
    return {
      uuid: module.uuid,
      label: module.title,
      order: linkedModule.order,
      anchor_uuid: anchorUuid,
    };
  }
};
