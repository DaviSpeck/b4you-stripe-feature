const Sales_items = require('../../../database/models/Sales_items');
const Students = require('../../../database/models/Students');
const ApiError = require('../../../error/ApiError');

const {
  GetUpsellDataByOfferUuidService,
} = require('./service/getUpsellDataByOfferUuid.service');

const {
  GetOffersByUpsellIdService,
} = require('./service/GetOffersByUpsellId.service');

const { GetOfferListService } = require('./service/getUpsellOfferList.service');
const { getPlansOffer } = require('./service/plans.service');
const { GetPaymentOfferData } = require('./service/getPaymentInfoByOfferUuid.service');
const { verifyOfferExists } = require('./validators/offerExists.validator');

class UpsellNativeOffer {
  static async GetData({ uuid, sale_item_uuid }) {
    if (!uuid || !sale_item_uuid) {
      throw ApiError.badRequest('Parâmetros obrigatórios ausentes');
    }

    const upsell = await GetUpsellDataByOfferUuidService({ uuid });
    if (!upsell) throw ApiError.badRequest('Upsell não configurado');

    const saleItem = await Sales_items.findOne({
      where: { uuid: sale_item_uuid },
      attributes: ['id_student', 'id_sale'],
      raw: true,
    });

    const student = await Students.findOne({
      where: { id: saleItem.id_student },
      attributes: ['credit_card'],
      raw: true,
    });

    const alreadyPurchased = await Sales_items.findOne({
      where: {
        id_sale: saleItem.id_sale,
        id_student: saleItem.id_student,
        type: 2,
        id_status: [1, 2],
      },
      order: [['id', 'desc']],
      raw: true,
    });

    let offers;
    if (upsell.is_multi_offer) {
      const rawOffers = await GetOffersByUpsellIdService(upsell.id);
      offers = await GetOfferListService({ offers: rawOffers, user_id: null });
    } else {
      offers = await GetOfferListService({
        offers: [{ uuid: upsell.upsell_offer_id }],
        user_id: null,
      });
    }

    const plans = await getPlansOffer({
      offer_uuid: upsell.upsell_offer_id,
    });

    return {
      ...upsell,
      offers,
      plans,
      is_multi_offer: Boolean(upsell.is_multi_offer),
      is_plan: plans.length > 0,
      is_already_purchased: Boolean(alreadyPurchased),
      already_purchased_sale_item_uuid: alreadyPurchased?.uuid ?? null,
      is_one_click:
        Boolean(upsell.is_one_click) &&
        Boolean(student?.credit_card?.provider_external_id),
    };
  }

  static async GetMultiOffers({ upsell_uuid, user_id }) {
    const upsell = await GetUpsellDataByOfferUuidService({ uuid: upsell_uuid });
    const rawOffers = await GetOffersByUpsellIdService(upsell.id);

    return GetOfferListService({
      offers: rawOffers,
      user_id,
    });
  }

  /**
   * REGRA DE OURO:
   * Se tem plano, a offer é SEMPRE a do upsell (offer_selected_uuid já vem certo do controller)
   */
  static async GetPaymentPlan({
    user_id,
    sale_item_uuid,
    plan_selected_uuid,
    offer_selected_uuid,
  }) {
    const { credit_card } = await Sales_items.findOne({
      where: { uuid: sale_item_uuid },
      attributes: ['credit_card'],
      raw: true,
    });

    const paymentInstance = new GetPaymentOfferData({
      user_id,
      offer_uuid: offer_selected_uuid,
      plan_uuid: plan_selected_uuid,
    });

    const { payment_methods } = await verifyOfferExists({
      uuid: offer_selected_uuid,
      values: ['payment_methods'],
    });

    const methods = payment_methods.split(',');

    return {
      pixData: methods.includes('pix')
        ? await paymentInstance.pix(sale_item_uuid)
        : null,

      creditCardData: methods.includes('credit_card')
        ? {
          ...(await paymentInstance.creditCard()),
          lastFourDigits: credit_card?.last_four ?? null,
        }
        : null,
    };
  }

  /**
   * Sem plano → offer normal
   */
  static async GetPaymentOffer({ user_id, sale_item_uuid, offer_selected_uuid }) {
    const { credit_card } = await Sales_items.findOne({
      where: { uuid: sale_item_uuid },
      attributes: ['credit_card'],
      raw: true,
    });

    const paymentInstance = new GetPaymentOfferData({
      user_id,
      offer_uuid: offer_selected_uuid,
    });

    const { payment_methods } = await verifyOfferExists({
      uuid: offer_selected_uuid,
      values: ['payment_methods'],
    });

    const methods = payment_methods.split(',');

    return {
      pixData: methods.includes('pix')
        ? await paymentInstance.pix(sale_item_uuid)
        : null,

      creditCardData: methods.includes('credit_card')
        ? {
          ...(await paymentInstance.creditCard()),
          lastFourDigits: credit_card?.last_four ?? null,
        }
        : null,
    };
  }

  static async GetPaymentPix({
    sale_item_uuid,
    plan_selected_uuid,
    offer_selected_uuid,
  }) {
    const paymentInstance = new GetPaymentOfferData({
      offer_uuid: offer_selected_uuid,
      plan_uuid: plan_selected_uuid,
    });

    return {
      pixData: await paymentInstance.pix(sale_item_uuid),
    };
  }
}

module.exports = { UpsellNativeOffer };
