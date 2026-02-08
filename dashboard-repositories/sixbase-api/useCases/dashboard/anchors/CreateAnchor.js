module.exports = class CreateAnchor {
  #anchorsRepository;

  constructor(anchorsRepository) {
    this.#anchorsRepository = anchorsRepository;
  }

  async execute({ label, id_product }) {
    const lastOrderAnchor = await this.#anchorsRepository.find({ id_product });
    const anchor = await this.#anchorsRepository.create({
      label,
      id_product,
      order: lastOrderAnchor ? lastOrderAnchor.order + 1 : 1,
    });
    return anchor;
  }
};
