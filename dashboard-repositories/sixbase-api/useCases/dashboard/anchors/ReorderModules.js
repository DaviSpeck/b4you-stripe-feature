const ApiError = require('../../../error/ApiError');

module.exports = class ReorderModules {
  #anchorsRepository;

  #modulesAnchorsRepository;

  #modulesRepository;

  constructor(anchorsRepository, modulesAnchorsRepository, modulesRepository) {
    this.#anchorsRepository = anchorsRepository;
    this.#modulesAnchorsRepository = modulesAnchorsRepository;
    this.#modulesRepository = modulesRepository;
  }

  async execute({ modulesUuid, id_product, anchorUuid }) {
    const anchor = await this.#anchorsRepository.find({
      id_product,
      uuid: anchorUuid,
    });
    if (!anchor) throw ApiError.badRequest('Âncora não encontrada');
    const modules = await this.#modulesRepository.findAll({
      uuid: modulesUuid,
    });
    if (modulesUuid.length !== modules.length)
      throw ApiError.badRequest('Módulos não encontrados');
    for await (const [index, uuid] of modulesUuid.entries()) {
      const currentModule = modules.find((m) => m.uuid === uuid);
      await this.#modulesAnchorsRepository.update(
        { id_module: currentModule.id },
        { order: index + 1, id_anchor: anchor.id },
      );
    }
  }
};
