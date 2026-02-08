const {
  findSaleItemInfo,
} = require('../../../../database/controllers/sales_items');
const models = require('../../../../database/models');
const ProductOffer = require('../../../../database/models/Product_offer');
const ProductPlans = require('../../../../database/models/Product_plans');
const ApiError = require('../../../../error/ApiError');
const SalesSettingsRepository = require('../../../../repositories/sequelize/SalesSettingsRepository');
const UpsellSale = require('../../sales/UpsellSale');

class GetPaymentOfferData {
  #user_id;
  #offer_uuid;
  #plan_uuid;

  constructor({ offer_uuid, plan_uuid = null, user_id }) {
    this.#user_id = user_id;
    this.#offer_uuid = offer_uuid;
    this.#plan_uuid = plan_uuid;
  }

  async #getOfferBaseData() {
    const offer = await ProductOffer.findOne({
      where: { uuid: this.#offer_uuid },
      raw: true,
      attributes: [
        'price',
        'discount_card',
        'discount_billet',
        'discount_pix',
        'installments',
        'payment_methods',
        'default_installment',
        'student_pays_interest',
      ],
    });

    if (!offer) {
      throw ApiError.badRequest(`Offer não encontrada: ${this.#offer_uuid}`);
    }

    return offer;
  }

  async #resolveFinalPrice() {
    const offer = await this.#getOfferBaseData();

    if (this.#plan_uuid) {
      const plan = await ProductPlans.findOne({
        where: { uuid: this.#plan_uuid },
        raw: true,
      });

      if (!plan) {
        throw ApiError.badRequest(`Plano inválido: ${this.#plan_uuid}`);
      }

      let price = plan.price;

      if (plan.subscription_fee) {
        price += plan.subscription_fee_price;
      }

      if (!plan.charge_first && plan.subscription_fee_price > 0) {
        price = plan.subscription_fee_price;
      }

      return { offer, price };
    }

    return { offer, price: offer.price };
  }

  async creditCard() {
    const { offer, price } = await this.#resolveFinalPrice();

    const sales = (await SalesSettingsRepository.find(this.#user_id)).toJSON();

    const installmentFee = sales.fee_interest_card.student_fees.find(
      (f) => f.brand === 'master',
    ).monthly_installment_interest;

    const monthlyRate = installmentFee / 100;

    const finalPrice = offer.discount_card
      ? price * (1 - offer.discount_card / 100)
      : price;

    const installments = Array.from(
      { length: offer.installments },
      (_, index) => {
        if (!offer.student_pays_interest) {
          return {
            parcel: index + 1,
            value: Number((finalPrice / (index + 1)).toFixed(2)),
          };
        }

        const power = (1 + monthlyRate) ** (index + 1);
        const coefficient = (monthlyRate * power) / (power - 1);
        const value =
          index === 0 ? finalPrice : finalPrice * coefficient;

        return {
          parcel: index + 1,
          value: Number(value.toFixed(2)),
        };
      },
    );

    return {
      price: finalPrice,
      mainPaymentMethod: 'credit_card',
      default_installment: offer.default_installment,
      studentPaysInterest: Boolean(offer.student_pays_interest),
      installments,
      originalPrice: price,
      maxInstallment: installments.at(-1),
    };
  }

  async pix(sale_item_uuid) {
    const { offer, price } = await this.#resolveFinalPrice();

    const finalPrice = offer.discount_pix
      ? price * (1 - offer.discount_pix / 100)
      : price;

    const saleItem = await findSaleItemInfo({ uuid: sale_item_uuid });
    if (!saleItem) {
      throw ApiError.badRequest('Venda base não encontrada');
    }

    const transaction = await models.sequelize.transaction();

    try {
      const upsell = await new UpsellSale(
        {
          ip: '196.189.176.242',
          offer_id: this.#offer_uuid,
          sale_item_id: sale_item_uuid,
          plan_id: this.#plan_uuid,
          payment_method: 'pix',
          installments: 1,
        },
        transaction,
      ).execute();

      await transaction.commit();

      return {
        price: finalPrice,
        originalPrice: price,
        pixData: upsell,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = { GetPaymentOfferData };
