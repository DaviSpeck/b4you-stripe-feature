const ApiError = require('../../error/ApiError');
const DateHelper = require('../../utils/helpers/date');
const models = require('../../database/models/index');
const uuid = require('../../utils/helpers/uuid');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { refundCard, refundPix, refundBillet } = require('./common');
const ProducerEmail = require('../../services/email/producer/refunds/StudentSubscription');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const ProducerPendingRefundEmail = require('../../services/email/producer/refunds/StudentRequestPending');
const StudentRefundEmail = require('../../services/email/student/refundWarranty');
const { storeRefundData } = require('./common');
const { updateUsersBalance } = require('../common/refunds/usersBalances');
const aws = require('../../queues/aws');

module.exports = class CreateRefund {
  constructor({ saleItem, reason, description }) {
    this.saleItem = saleItem;
    this.reason = reason;
    this.description = description;
  }

  async execute() {
    const { saleItem } = this;
    if (saleItem.id_status !== findSalesStatusByKey('paid').id)
      throw ApiError.badRequest(
        'Você só pode solicitar reembolso de vendas com pagamento aprovado',
      );

    const maxDate = DateHelper(saleItem.valid_refund_until);
    if (maxDate.isBefore(DateHelper().now()))
      throw ApiError.badRequest(
        'Não é possível solicitar reembolso dessa compra pois o período de garantia já venceu',
      );

    const SEVEN_DAYS = 7;
    const diff = DateHelper().diff(saleItem.paid_at, 'd');
    if (diff < SEVEN_DAYS) {
      await models.sequelize.transaction(async (t) => {
        await storeRefundData({
          saleItem,
          apiResponse: null,
          reason: this.reason,
          refund_uuid: uuid.v4(),
          role: 'student',
          transaction: t,
        });
        await updateUsersBalance(saleItem, 'decrement', t);
        t.afterCommit(async () => {
          await new ProducerPendingRefundEmail({
            email: saleItem.product.refund_email
              ? saleItem.product.refund_email
              : saleItem.product.producer.email,
            full_name: saleItem.product.producer.full_name,
            product_name: saleItem.product.name,
            amount: saleItem.price_total,
            student_name: saleItem.student.full_name,
            student_email: saleItem.student.email,
            student_whatsapp: saleItem.student.whatsapp,
            due_date: DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd'),
            sale_uuid: saleItem.uuid,
          }).send();
          await new StudentRefundEmail({
            email: saleItem.student.email,
            amount: saleItem.price_total,
            full_name: saleItem.student.full_name,
            product_name: saleItem.product.name,
            date: DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd'),
          }).send();
          await aws.add('generateNotifications', {
            sale_item_id: saleItem.id,
          });
        });
      });

      const expire_date = DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd');
      return `Você receberá o seu reembolso no dia ${expire_date.format(
        FRONTEND_DATE_WITHOUT_TIME,
      )} após o encerramento do prazo de garantia da compra.`;
    }

    await models.sequelize.transaction(async (t) => {
      if (saleItem.payment_method === 'pix') {
        await refundPix({
          reason: this.reason,
          role: 'student',
          saleItem,
          transaction_uuid: saleItem.charges[0].uuid,
          transaction: t,
          provider: saleItem.charges[0].provider,
          provider_id: saleItem.charges[0].provider_id,
          amount: saleItem.price_total,
        });
      }
      if (saleItem.payment_method === 'card') {
        await refundCard({
          reason: this.reason,
          role: 'student',
          saleItem,
          transaction_uuid: saleItem.charges[0].uuid,
          transaction: t,
          provider: saleItem.charges[0].provider,
          provider_id: saleItem.charges[0].provider_id,
          amount: saleItem.price_total,
        });
      }
      if (saleItem.payment_method === 'billet') {
        await refundBillet({
          saleItem,
          amount: saleItem.price_total,
          reason: this.reason,
          transaction_uuid: saleItem.charges[0].uuid,
          role: 'student',
          bank_account: {
            bank_code: saleItem.student.bank_code,
            account_agency: saleItem.student.account_agency,
            account_number: saleItem.student.account_number,
          },
          transaction: t,
          provider: saleItem.charges[0].provider,
          provider_id: saleItem.charges[0].provider_id,
        });
      }
      await updateUsersBalance(saleItem, 'decrement', t);
      if (saleItem.id_subscription) {
        await updateSubscription(
          { id: saleItem.id_subscription },
          {
            active: false,
          },
          t,
        );
      }

      t.afterCommit(async () => {
        const emailData = {
          student_name: saleItem.student.full_name,
          product_name: saleItem.product.name,
          producer_name: saleItem.product.producer.full_name,
          email: saleItem.product.refund_email
            ? saleItem.product.refund_email
            : saleItem.product.producer.email,
          sale_uuid: saleItem.uuid,
          amount: saleItem.price_total,
          date: DateHelper().format(FRONTEND_DATE_WITHOUT_TIME),
          reason: this.reason,
        };
        await new ProducerEmail(emailData).send();
      });
    });

    return 'Seu reembolso já foi solicitado.';
  }
};
