const SalesSettingsRepository = require('../../../../repositories/sequelize/SalesSettingsRepository');

const parseMethods = (methods = '') =>
  methods.split(',').map((m) => m.trim());

const GetOfferListService = async ({ offers, user_id }) => {
  if (!offers?.length) return [];
  return offers.map((item) => {
    const numericPrice = Number(item.price);

    const methods = parseMethods(item.payment_methods);

    return {
      uuid: item.uuid,
      price: numericPrice,
      description: item.description,

      offer: {
        name: item.name,
        alternative_name: item.alternative_name,
      },

      product: {
        cover: item.offer_product?.cover ?? null,
      },

      customizations: {
        alternative_image: null,
        show_custom_description: 'false',
      },

      payment: {
        methods,
        installments: item.installments ?? 1,
      },

      totalPrice: numericPrice,
      mainPaymentMethod: methods.includes('credit_card')
        ? 'credit_card'
        : methods.includes('pix')
          ? 'pix'
          : 'billet',

      student_pays_interest: Boolean(item.student_pays_interest),
    };
  });
};

module.exports = { GetOfferListService };
