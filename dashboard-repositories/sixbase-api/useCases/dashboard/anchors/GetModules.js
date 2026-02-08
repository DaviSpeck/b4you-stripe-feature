module.exports = class GetModules {
  #modulesRepository;

  #anchorsRepository;

  constructor(modulesRepository, anchorsRepository) {
    this.#modulesRepository = modulesRepository;
    this.#anchorsRepository = anchorsRepository;
  }

  async execute({ id_product }) {
    const anchors = await this.#anchorsRepository.findAll({ id_product });
    const modulesIds = anchors.map((a) => a.modules.map((m) => m.id)).flat();
    const modules = await this.#modulesRepository.findAllByIdNotIn({
      id: modulesIds,
      id_product,
    });
    return modules;
  }
};
