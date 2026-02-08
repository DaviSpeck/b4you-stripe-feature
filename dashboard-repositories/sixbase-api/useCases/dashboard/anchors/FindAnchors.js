module.exports = class FindAnchors {
  #anchorsRepository;

  constructor(anchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
  }

  async execute({ id_product }) {
    const anchors = await this.#anchorsRepository.findAll({ id_product });
    return anchors;
  }
};
