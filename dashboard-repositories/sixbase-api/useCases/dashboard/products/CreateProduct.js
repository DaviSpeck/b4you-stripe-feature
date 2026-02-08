const {
  VIDEOTYPE,
  SUBSCRIPTION,
  EBOOKTYPE,
  PAYMENT_ONLY_TYPE,
} = require('../../../types/productTypes');
const { findType } = require('../../../types/commissionsAffiliatesRules');
const ApiError = require('../../../error/ApiError');

const resolveType = (type) => {
  if (type === 'video') return 1;
  if (type === 'ebook') return 2;
  if (type === 'payment_only') return 3;
  if (type === 'ecommerce') return 5;
  if (type === 'shopify') return 6;
  return 4;
};

const resolveContentDelivery = (type) => {
  if (type === 'payment_only') return type;
  if (type === 'physical') return type;
  if (type === 'ecommerce') return type;
  if (type === 'shopify') return type;

  return 'membership';
};

module.exports = class CreateProduct {
  #ProductsRepository;

  #ClassroomsRepository;

  #ProductAffiliateSettingsRepository;

  constructor(
    ProductsRepository,
    ClassroomsRepository,
    ProductAffiliateSettingsRepository,
  ) {
    this.#ProductsRepository = ProductsRepository;
    this.#ClassroomsRepository = ClassroomsRepository;
    this.#ProductAffiliateSettingsRepository =
      ProductAffiliateSettingsRepository;
  }

  async save({
    name,
    category,
    payment_type,
    type,
    id_user,
    warranty,
    sales_page_url,
  }) {
    const id_type = resolveType(type);
    if (payment_type === SUBSCRIPTION && id_type === EBOOKTYPE)
      throw ApiError.badRequest(
        'Este tipo de produto não aceita assinatura como método de pagamento',
      );

    const productData = {
      name,
      content_delivery: resolveContentDelivery(type),
      category,
      id_user,
      warranty,
      hex_color: '#24292F',
      sales_page_url,
      payment_type,
      id_type,
    };

    const product = await this.#ProductsRepository.create(productData);

    await this.#ProductAffiliateSettingsRepository.create({
      id_product: product.id,
      click_attribution: findType('last-click').id,
      cookies_validity: 30,
      list_on_market: false,
      manual_approve: true,
    });

    if (id_type === VIDEOTYPE || id_type === PAYMENT_ONLY_TYPE) {
      await this.#ClassroomsRepository.create({
        label: 'Turma 1',
        is_default: true,
        id_product: product.id,
      });
    }

    return product;
  }
};
