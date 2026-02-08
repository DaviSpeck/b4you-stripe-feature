const SalesSettingsRepository = require('../../../../../repositories/sequelize/SalesSettingsRepository');
const {
  ProductOfferRepository,
} = require('../../repository/productOffer.repository');
const { paymentOfferData } = require('../../utils/offerPaymentData');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');

async function Get(params) {
  const { uuid, user } = params;

  const product = await verifyProductExists({ uuid, user });

  const offersData = await ProductOfferRepository.findAll({
    where: {
      id_product: product.id,
    },
    values: [
      'uuid',
      'name',
      'price',
      'description',
      'alternative_name',
      'discount_card',
      'discount_billet',
      'discount_pix',
      'installments',
      'payment_methods',
      'student_pays_interest',
      'checkout_customizations',
    ],
  });

  const sales = (await SalesSettingsRepository.find(user.id)).toJSON();

  const installmentFee = sales.fee_interest_card.student_fees.find(
    (fee) => fee.brand === 'master',
  ).monthly_installment_interest;

  return offersData.map((offer) => {
    const paymentData = paymentOfferData({
      ...offer,
      installmentFee,
    });
    return {
      ...offer,
      payment_data: paymentData,
    };
  });
}

module.exports = { Get };
