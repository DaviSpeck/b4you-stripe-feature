module.exports = class UpdateAnchorView {
  #productsRepository;

  constructor(productsRepository) {
    this.#productsRepository = productsRepository;
  }

  async execute({ id_product, anchor_view }) {
    await this.#productsRepository.update({ id: id_product }, { anchor_view });
  }
};
