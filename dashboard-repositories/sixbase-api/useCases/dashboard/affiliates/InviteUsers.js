const ApiError = require('../../../error/ApiError');
const SQS = require('../../../queues/aws');

module.exports = class InviteUsers {
  #id_product;

  #ProductsRepository;

  #ProductAffiliateSettingsRepository;

  constructor({
    id_product,
    ProductsRepository,
    ProductAffiliateSettingsRepository,
  }) {
    this.#id_product = id_product;
    this.#ProductsRepository = ProductsRepository;
    this.#ProductAffiliateSettingsRepository =
      ProductAffiliateSettingsRepository;
  }

  async execute(usersEmails) {
    const product = await this.#ProductsRepository.findWithProducer({
      id: this.#id_product,
    });
    if (!product) throw ApiError.badRequest('Produto não existe');
    const product_affiliate_settings =
      await this.#ProductAffiliateSettingsRepository.findOne({
        id_product: this.#id_product,
      });
    if (!product_affiliate_settings)
      throw ApiError.badRequest(
        'Configurações de afiliado do produto não existe',
      );
    for await (const email of usersEmails) {
      if (email)
        await SQS.add('affiliateUserInvite', {
          email,
          producer_name: product.producer.full_name,
          product_name: product.name,
          id_product: product.id,
        });
    }
  }
};
