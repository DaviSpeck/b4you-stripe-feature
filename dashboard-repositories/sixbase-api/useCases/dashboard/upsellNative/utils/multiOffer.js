const SalesSettingsRepository = require('../../../../repositories/sequelize/SalesSettingsRepository');
const {
  OffersUpsellNativeRepository,
} = require('../repository/offersUpsell.repository');
const {
  ProductOfferRepository,
} = require('../repository/productOffer.repository');
const { paymentOfferData } = require('./offerPaymentData');

async function multiOffer(params) {
  const { upsell_id, user_id } = params;

  const sales = (await SalesSettingsRepository.find(user_id)).toJSON();

  const installmentFee = sales.fee_interest_card.student_fees.find(
    (fee) => fee.brand === 'master',
  ).monthly_installment_interest;

  const offers = await OffersUpsellNativeRepository.findMany({
    where: {
      upsell_id,
    },
    values: ['offer_id'],
  });

  const offersData = await ProductOfferRepository.findAll({
    where: {
      id: offers.map((item) => item.offer_id),
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

  return offersData.map((item) => {
    const paymentData = paymentOfferData({
      ...item,
      installmentFee,
    });

    return {
      ...item,
      payment_data: paymentData,
    };
  });
}

module.exports = { multiOffer };
