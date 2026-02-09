const ApiError = require('../../error/ApiError');
const RefundUseCase = require('../../useCases/callbacks/Refund');
const logger = require('../../utils/logger');
const Refunds = require('../../database/models/Refunds');
const Sales_items = require('../../database/models/Sales_items');

const Pagarme = require('../../services/payments/Pagarme');
const SQS = require('../../queues/aws');
const Models = require('../../database/models/index');
const Charges = require('../../database/models/Charges');
const {
  buildEventId,
  recordProviderEvent,
} = require('../../useCases/callbacks/providerEventsHistory');

/**
 * Controller para callback de reembolsos da Pagarme.
 * Identifica qual charge foi reembolsada quando há múltiplas charges no sale_item.
 *
 * @param {Object} req - Request object
 * @param {Object} req.body - Body da requisição
 * @param {string} [req.body.refund_id] - UUID do reembolso
 * @param {number} [req.body.status] - Status do callback
 * @param {Object} [req.body.data] - Dados do callback
 * @param {string} [req.body.data.id] - ID da charge reembolsada
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const callbackRefundsController = async (req, res, next) => {
  const { refund_id, data = {}, event_id: bodyEventId, occurred_at } = req.body;
  logger.info(`CALLBACK REFUNDS -> ${JSON.stringify(req.body)}`);
  try {
    const rawEventId = bodyEventId || data.id || refund_id;
    const eventId = buildEventId(rawEventId, [refund_id, 'success']);
    let refund = null;
    let chargeFromCallback = null;
    if (data && data.id) {
      chargeFromCallback = await Charges.findOne({
        where: { provider_id: data.id },
        attributes: [
          'id',
          'provider_id',
          'provider',
          'price',
          'refund_amount',
          'id_status',
        ],
        include: [
          {
            association: 'sales_items',
            attributes: ['id'],
          },
        ],
      });
    }

    if (!refund && data && data.id) {
      refund = await Refunds.sequelize.query(
        `SELECT id, id_sale_item, uuid FROM refunds WHERE json_extract(api_response,'$.id') = :id AND id_status = 1 LIMIT 1;`,
        {
          replacements: { id: data.id },
          plain: true,
        },
      );
    }

    if (!refund && refund_id) {
      refund = await Refunds.findOne({
        raw: true,
        where: { uuid: refund_id },
        attributes: ['id', 'id_sale_item', 'uuid'],
      });
    }

    if (
      !refund &&
      chargeFromCallback &&
      chargeFromCallback.sales_items &&
      chargeFromCallback.sales_items.length > 0
    ) {
      const saleItemIds = chargeFromCallback.sales_items.map((s) => s.id);

      refund = await Refunds.findOne({
        raw: true,
        where: {
          id_sale_item: saleItemIds,
          id_status: [1, 2, 6],
        },
        attributes: ['id', 'id_sale_item', 'uuid'],
        order: [['created_at', 'DESC']], // Get latest
      });
    }

    if (!refund) throw ApiError.badRequest('Refund not found');

    const saleItem = await Sales_items.findOne({
      nest: true,
      where: { id: refund.id_sale_item },
      include: [
        {
          association: 'charges',
          attributes: [
            'id',
            'uuid',
            'provider',
            'provider_id',
            'payment_method',
            'price',
            'id_status',
          ],
        },
      ],
    });

    if (!saleItem || !saleItem.charges || saleItem.charges.length === 0) {
      throw ApiError.badRequest('Sale item or charges not found');
    }

    const eventResult = await recordProviderEvent({
      eventId,
      provider: 'pagarme',
      eventType: 'refund',
      eventAction: 'success',
      occurredAt:
        occurred_at ||
        data.updated_at ||
        data.created_at ||
        new Date(),
      transactionId: saleItem.uuid || null,
      orderId: null,
      saleId: saleItem.id_sale || null,
      payload: req.body,
    });
    if (eventResult.duplicate) return res.sendStatus(200);

    let targetCharge = saleItem.charges[0];

    if (chargeFromCallback) {
      const match = saleItem.charges.find(
        (c) => c.id === chargeFromCallback.id,
      );
      if (match) targetCharge = match;
    } else if (saleItem.charges.length > 1) {
      const refundData = await Refunds.findOne({
        where: { uuid: refund.uuid },
        attributes: ['api_response'],
        raw: true,
      });

      let chargeProviderIdFromRefund = null;
      if (refundData && refundData.api_response) {
        const apiResponse =
          typeof refundData.api_response === 'string'
            ? JSON.parse(refundData.api_response)
            : refundData.api_response;

        if (apiResponse.responses && Array.isArray(apiResponse.responses)) {
          for (const response of apiResponse.responses) {
            if (response.response && response.response.id) {
              chargeProviderIdFromRefund = response.response.id;
              break;
            }
          }
        } else if (apiResponse.id) {
          chargeProviderIdFromRefund = apiResponse.id;
        }
      }

      if (chargeProviderIdFromRefund) {
        const foundCharge = saleItem.charges.find(
          (c) => c.provider_id === chargeProviderIdFromRefund,
        );
        if (foundCharge) {
          targetCharge = foundCharge;
        }
      }
    }

    const pagarme = new Pagarme(targetCharge.provider);
    const order = await pagarme.getCharge(targetCharge.provider_id);
    if (!order) throw ApiError.badRequest('Refund pagarme not found');
    if (!['refunded', 'voided', 'canceled', 'paid'].includes(order.status))
      throw ApiError.badRequest('invalid pagarme status');

    await Models.sequelize.transaction(async (t) => {
      await new RefundUseCase({
        status: 1,
        refund_id: refund.uuid,
        charge_id: targetCharge.id,
      }).execute();
      t.afterCommit(async () => {
        try {
          console.log('trying call refund bling callback', saleItem.id_sale);
          await SQS.add('blingRefund', {
            sale_id: saleItem.id_sale,
          });
        } catch (error) {
          console.log(
            `error on cancel order bling callback ${saleItem.id_sale}`,
            error,
          );
        }
      });
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  callbackRefundsController,
};
