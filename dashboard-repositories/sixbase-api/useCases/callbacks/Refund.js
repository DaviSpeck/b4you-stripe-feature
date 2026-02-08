const ApiError = require('../../error/ApiError');
const RejectedRefundStudentEmail = require('../../services/email/RejectedRefundStudent');
const SaleChargebackEmail = require('../../services/email/SaleChargeback');
const RejectedRefundProducerEmail = require('../../services/email/producer/refunds/Rejected');
const { updateRefund } = require('../../database/controllers/refunds');
const { findRefundStatus } = require('../../status/refundStatus');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const {
  deleteStudentProduct,
} = require('../../database/controllers/student_products');
const {
  updateChargeTransaction,
} = require('../../database/controllers/charges');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const { capitalizeName } = require('../../utils/formatters');
const {
  FRONTEND_DATE_WITHOUT_TIME,
  DATABASE_DATE_WITHOUT_TIME,
} = require('../../types/dateTypes');
const DateHelper = require('../../utils/helpers/date');
const models = require('../../database/models/index');
const ReferralCommissions = require('../../database/models/ReferralCommissions');
const Commissions = require('../../database/models/Commissions');
const ReferralBalance = require('../../database/models/ReferralBalance');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionStatus');
const SQS = require('../../queues/aws');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const { findRulesTypesByKey } = require('../../types/integrationRulesTypes');
const { updateUsersBalance } = require('../common/refunds/usersBalances');
const Invision = require('../integrations/Inivsion');
const aws = require('../../queues/aws');
const { findCommissionsStatus } = require('../../status/commissionsStatus');
const RefundsModel = require('../../database/models/Refunds');
const Subscriptions = require('../../database/models/Subscriptions');
const date = require('../../utils/helpers/date');
const { updateBalance } = require('../../database/controllers/balances');
const Users = require('../../database/models/Users');
const Charges = require('../../database/models/Charges');

const validStatus = [1, 2];
const [PAID, REJECTED] = validStatus;
function toCents(aValue) {
  return Math.round((Math.abs(aValue) / 100) * 10000);
}

const translatePaymentMethod = (method) => {
  if (method === 'pix') return 'Pix';
  if (method === 'card') return 'Cartão';
  return 'Boleto';
};

/**
 * Use case to process refund callbacks.
 */
module.exports = class Refunds {
  /**
   * @param {Object} params - Parâmetros do reembolso
   * @param {number} params.status - Status do callback (1 = PAID, 2 = REJECTED)
   * @param {string} params.refund_id - UUID do reembolso
   * @param {number} [params.charge_id] - ID da charge específica reembolsada
   */
  constructor({ status, refund_id, charge_id = null }) {
    this.status = status;
    this.refund_id = refund_id;
    this.charge_id = charge_id;
  }

  /**
   * Executa o processamento do reembolso.
   * Para status PAID: atualiza a charge específica e verifica se todas foram reembolsadas.
   * Para status REJECTED: reverte as alterações e notifica o usuário.
   *
   * @returns {Promise<void>}
   * @throws {ApiError} Se o refund for inválido ou houver erro no processamento
   */
  async execute() {
    if (!validStatus.includes(this.status))
      throw ApiError.badRequest('Invalid callback');

    const refund = await RefundsModel.findOne({
      nest: true,
      attributes: ['id', 'id_sale_item', 'id_student'],
      where: {
        uuid: this.refund_id,
        id_status: [
          findRefundStatus('Solicitado pelo comprador').id,
          findRefundStatus('Solicitado pelo produtor').id,
          findRefundStatus('Solicitado reembolso em garantia').id,
        ],
      },
      include: [
        {
          association: 'student',
          attributes: [
            'id',
            'full_name',
            'email',
            'whatsapp',
            'document_number',
          ],
        },
        {
          association: 'sale_item',
          attributes: [
            'id',
            'uuid',
            'paid_at',
            'id_product',
            'payment_method',
            'id_subscription',
            'price_total',
            'id_offer',
          ],
          include: [
            {
              association: 'commissions',
              attributes: ['id', 'id_user', 'id_product', 'amount', 'id_role'],
            },
            {
              association: 'charges',
              attributes: ['id', 'price', 'refund_amount', 'id_status'],
            },
            {
              association: 'product',
              attributes: ['id', 'name', 'uuid', 'id_user', 'refund_email'],
              paranoid: false,
            },
          ],
        },
      ],
    });

    if (!refund) throw ApiError.badRequest('Invalid refund');
    if (this.status === PAID) {
      await models.sequelize.transaction(async (t) => {
        const targetCharge = this.charge_id
          ? refund.sale_item.charges.find((c) => c.id === this.charge_id)
          : refund.sale_item.charges[0];

        if (!targetCharge) {
          throw new Error(
            `Charge ${this.charge_id} not found in sale_item ${refund.sale_item.id}`,
          );
        }

        let amountToRefund = 0;
        if (refund.sale_item.charges.length > 1) {
          amountToRefund = targetCharge.price;
        } else {
          amountToRefund = refund.sale_item.price_total;
        }

        const currentRefundAmount = parseFloat(targetCharge.refund_amount || 0);
        const newTotalRefund = currentRefundAmount + amountToRefund;

        if (toCents(newTotalRefund) >= toCents(targetCharge.price)) {
          await updateChargeTransaction(
            {
              id_status: findChargeStatusByKey('refunded').id,
              refund_amount: newTotalRefund,
            },
            { id: targetCharge.id },
            t,
          );
        } else {
          await Charges.increment('refund_amount', {
            by: amountToRefund,
            where: {
              id: targetCharge.id,
            },
            transaction: t,
          });
        }

        await updateRefund(
          { id_status: findRefundStatus('Aceito').id },
          { id: refund.id },
          t,
        );

        const isSaleRefunded =
          refund.sale_item.id_status === findSalesStatusByKey('refunded').id;

        if (!isSaleRefunded) {
          const { commissions } = refund.sale_item;


          await Commissions.update(
            { id_status: findCommissionsStatus('refunded').id },
            { where: { id: commissions.map((c) => c.id) }, transaction: t },
          );
          t.afterCommit(async () => {
            const commissionsPromises = [];
            for (const commission of commissions) {
              commissionsPromises.push(
                aws.add('sales-metrics-hourly', {
                  id_user: commission.id_user,
                  id_product: commission.id_product,
                  amount: commission.amount,
                  paid_at: refund.sale_item.paid_at,
                  statusAfter: 'refunded',
                  statusBefore: 'paid',
                  payment_method: refund.sale_item.payment_method,
                }),
              );
              commissionsPromises.push(
                aws.add('usersRevenue', {
                  id_user: commission.id_user,
                  amount: commission.amount,
                  paid_at: date(refund.sale_item.paid_at)
                    .subtract(3, 'hours')
                    .format(DATABASE_DATE_WITHOUT_TIME),
                  operation: 'decrement',
                }),
              );
            }
            await Promise.all(commissionsPromises);
          });

          const referralCommission = await ReferralCommissions.findOne({
            raw: true,
            where: { id_sale_item: refund.id_sale_item },
            transaction: t,
          });
          if (referralCommission) {
            if (
              referralCommission.id_status ===
              findReferralCommissionStatus('released').id
            ) {
              await ReferralBalance.decrement('total', {
                by: referralCommission.amount,
                where: { id_user: referralCommission.id_user },
                transaction: t,
              });
            }
            await ReferralCommissions.update(
              { id_status: findReferralCommissionStatus('refund').id },
              { where: { id: referralCommission.id }, transaction: t },
            );
          }

          await updateSaleItem(
            { id_status: findSalesStatusByKey('refunded').id },
            {
              id: refund.id_sale_item,
            },
            t,
          );

          await deleteStudentProduct(
            {
              id_sale_item: refund.sale_item.id,
            },
            t,
          );

          if (refund.sale_item.id_subscription) {
            await Subscriptions.update(
              {
                active: false,
                id_status: findSubscriptionStatusByKey('refunded').id,
              },
              {
                where: { id: refund.sale_item.id_subscription },
                transaction: t,
              },
            );
            t.afterCommit(async () => {
              await new Invision({
                id_product: refund.sale_item.id_product,
                id_user: refund.sale_item.product.id_user,
                student_email: refund.student.email,
              }).execute();
            });
          }

          t.afterCommit(async () => {
            let additional_text = '';
            if (refund.sale_item.payment_method === 'card') {
              additional_text =
                'O reembolso foi efetuado, o saldo será reembolsado na fatura do cartão em até 90 dias.';
            } else if (refund.sale_item.payment_method === 'pix') {
              additional_text =
                'O reembolso foi efetuado para o mesmo pix utilizado no momento da compra do produto.';
            } else {
              additional_text =
                'O reembolso foi efetuado via transferência bancária para a conta cadastrada em seu perfil B4you.';
            }

            await new SaleChargebackEmail({
              client_name: refund.student.full_name,
              email: refund.student.email,
              product_name: refund.sale_item.product.name,
              additional_text,
            }).send();
            await SQS.add('webhookEvent', {
              id_product: refund.sale_item.id_product,
              id_sale_item: refund.sale_item.id,
              id_user: refund.sale_item.product.id_user,
              id_event: findRulesTypesByKey('refund').id,
            });
            await SQS.add('integrations', {
              id_product: refund.sale_item.id_product,
              eventName: 'refundedPayment',
              data: {
                email: refund.student.email,
                phone: refund.student.whatsapp,
                document_number: refund.student.document_number,
                full_name: capitalizeName(refund.student.full_name),
                payment_method: refund.sale_item.payment_method,
                sale: {
                  amount: refund.sale_item.charges[0].price,
                  sale_uuid: refund.sale_item.uuid,
                  products: [
                    {
                      quantity: 1,
                      product_name: refund.sale_item.product.name,
                      uuid: refund.sale_item.product.uuid,
                    },
                  ],
                },
              },
            });
          });
        }
      });
    }
    if (this.status === REJECTED) {
      await models.sequelize.transaction(async (t) => {
        await updateRefund(
          { id_status: findRefundStatus('Negado').id },
          { id: refund.id },
          t,
        );
        await updateSaleItem(
          { id_status: findSalesStatusByKey('paid').id },
          {
            id: refund.id_sale_item,
          },
          t,
        );
        await updateUsersBalance(refund, 'increment', t);
        const {
          sale_item: { commissions },
        } = refund;
        for await (const commission of commissions) {
          const [result] = await models.sequelize.query(
            `select id_status from commissions_history where id_commission = ${commission.id} order by id desc`,
            { transaction: t },
          );
          await Commissions.update(
            { id_status: result.id_status },
            { where: { id: commission.id }, transaction: t },
          );
          const released = result.find(
            (r) => r.id_status === findCommissionsStatus('released').id,
          );
          if (released) {
            await updateBalance(
              commission.id_user,
              commission.amount,
              'increment',
              t,
            );
          }
        }
      });
      let reasonStudent = '';
      let reasonProducer = '';
      if (refund.sale_item.payment_method === 'card') {
        reasonStudent =
          'O reembolso no cartão falhou. Solicite novamente o reembolso.';
        reasonProducer =
          'O reembolso no cartão falhou. Reembolse esta venda novamente pela plataforma.';
      } else if (refund.sale_item.payment_method === 'pix') {
        reasonStudent =
          'O reembolso por Pix falhou. Solicite novamente o reembolso.';
        reasonProducer =
          'O reembolso por Pix falhou. Reembolse esta venda novamente pela plataforma.';
      } else {
        reasonStudent =
          'O reembolso por boleto falhou. Solicite novamente o reembolso.';
        reasonProducer =
          'O reembolso por boleto falhou. Reembolse esta venda novamente pela plataforma.';
      }

      if (!refund.requested_by_student) {
        const producer = await Users.findOne({
          raw: true,
          attributes: ['email', 'full_name'],
          where: { id: refund.sale_item.product.id_user },
        });
        await new RejectedRefundProducerEmail({
          email: refund.sale_item.product.refund_email
            ? refund.sale_item.product.refund_email
            : producer.email,
          full_name: producer.full_name,
          product_name: refund.sale_item.product.name,
          amount: refund.sale_item.charges[0].price,
          student_name: refund.student.full_name,
          reason: reasonProducer,
        }).send();
      }

      const email = {
        email: refund.student.email,
        full_name: refund.student.full_name,
        product_name: refund.sale_item.product.name,
        amount: refund.sale_item.charges[0].price,
        reason: reasonStudent,
        date: DateHelper().now().format(FRONTEND_DATE_WITHOUT_TIME),
        payment_method: translatePaymentMethod(refund.sale_item.payment_method),
      };
      await new RejectedRefundStudentEmail(email).send();
    }
  }
};
