const Offers_upsell_native = require('../../../../database/models/Offers_upsell-native');
const Product_offer = require('../../../../database/models/Product_offer');
const SalesSettingsRepository = require('../../../../repositories/sequelize/SalesSettingsRepository');
const { paymentOfferData } = require('./offerPaymentData.util');

async function multiOffer(params) {
  const { upsell_id, user_id } = params;

  const sales = (await SalesSettingsRepository.find(user_id)).toJSON();

  const installmentFee = sales.fee_interest_card.student_fees.find(
    (fee) => fee.brand === 'master',
  ).monthly_installment_interest;

  const offers = await Offers_upsell_native.findMany({
    where: {
      upsell_id,
    },
    raw: true,
    attributes: ['offer_id'],
  });

  const offersData = await Product_offer.findAll({
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
