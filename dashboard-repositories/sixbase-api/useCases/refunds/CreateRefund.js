const { findTransactionType } = require('../../types/transactionTypes');
const uuid = require('../../utils/helpers/uuid');
const ApiError = require('../../error/ApiError');
const ProducerEmail = require('../../services/email/producer/refunds/StudentRequested');
const ProducerPendingRefundEmail = require('../../services/email/producer/refunds/StudentRequestPending');
const { storeRefundData } = require('./common');
const DateHelper = require('../../utils/helpers/date');
const { refundBillet, refundCard, refundPix } = require('./common');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const CreateNotificationApp = require('../dashboard/notifications/sendNotification');
const StudentRefundEmail = require('../../services/email/student/refundWarranty');
const { updateUsersBalance } = require('../common/refunds/usersBalances');
const models = require('../../database/models/index');

const validateRules = async (saleItem) => {
  if (DateHelper(saleItem.valid_refund_until).isBefore(DateHelper()))
    throw ApiError.badRequest(
      'Não é possível solicitar reembolso dessa compra pois o período de garantia já venceu',
    );
  if (saleItem.payment_method === 'billet') {
    const { student } = saleItem;
    if (
      !student.bank_code ||
      !student.account_agency ||
      !student.account_number
    )
      throw new Error(
        JSON.stringify({
          code: 'bank',
          message:
            'É necessário ter uma conta bancária cadastrada em seu perfil B4you para solicitar reembolso de valores pagos por boleto',
          blog_url:
            'https://ajuda.b4you.com.br/post/290/como-faco-para-solicitar-reembolso-de-um-produto-que-comprei',
        }),
      );
  }
  if (saleItem.id_status !== findSalesStatusByKey('paid').id)
    throw ApiError.badRequest(
      'Não é possível solicitar reembolso que não está pago',
    );

  return saleItem;
};

module.exports = class {
  constructor({ saleItem, reason, description }) {
    this.saleItem = saleItem;
    this.reason = reason;
    this.description = description;
  }

  async execute() {
    const saleItem = await validateRules(this.saleItem);
    const SEVEN_DAYS = 7;
    const diff = DateHelper().diff(saleItem.paid_at, 'd');
    if (diff < SEVEN_DAYS) {
      await new ProducerPendingRefundEmail({
        email: saleItem.product.refund_email
          ? saleItem.product.refund_email
          : saleItem.product.producer.email,
        full_name: saleItem.product.producer.full_name,
        product_name: saleItem.product.name,
        amount: saleItem.price,
        student_name: saleItem.student.full_name,
        student_email: saleItem.student.email,
        student_whatsapp: saleItem.student.whatsapp,
        due_date: DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd'),
        sale_uuid: saleItem.uuid,
      }).send();

      await new StudentRefundEmail({
        email: saleItem.student.email,
        amount: saleItem.price,
        full_name: saleItem.student.full_name,
        product_name: saleItem.product.name,
        date: DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd'),
      }).send();
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
          await new CreateNotificationApp({
            id_user: saleItem.product.producer.id,
            type: 'requested_refund',
            data: {
              product_name: saleItem.product.name,
            },
          }).execute();
        });
      });
      const expire_date = DateHelper(saleItem.paid_at).add(SEVEN_DAYS, 'd');
      return `Você receberá o seu reembolso no dia ${expire_date.format(
        FRONTEND_DATE_WITHOUT_TIME,
      )} após o encerramento do prazo de garantia da compra.`;
    }

    const costTransaction = saleItem.transactions.find(
      (t) => t.id_type === findTransactionType('Custo').id,
    );

    if (!costTransaction)
      throw ApiError.badRequest('Transação de custos não encontrada');

    const paymentTransaction = saleItem.transactions.find(
      (t) => t.id_type === findTransactionType('Pagamento').id,
    );

    await models.sequelize.transaction(async (t) => {
      const emailData = {
        student_name: saleItem.student.full_name,
        product_name: saleItem.product.name,
        producer_name: saleItem.product.producer.full_name,
        email: saleItem.product.refund_email
          ? saleItem.product.refund_email
          : saleItem.product.producer.email,
        sale_uuid: saleItem.uuid,
        amount: saleItem.price,
        date: DateHelper().format(FRONTEND_DATE_WITHOUT_TIME),
        reason: this.reason,
      };
      
      if (saleItem.payment_method === 'pix') {
        await refundPix({
          saleItem,
          amount: paymentTransaction.price_total,
          transaction_uuid: costTransaction.uuid,
          reason: this.reason,
          role: 'student',
          transaction: t,
        });
        emailData.payment_method = 'Pix';
      }
      if (saleItem.payment_method === 'billet') {
        await refundBillet({
          saleItem,
          amount: paymentTransaction.price_total,
          reason: this.reason,
          transaction_uuid: costTransaction.uuid,
          role: 'student',
          bank_account: {
            bank_code: saleItem.student.bank_code,
            account_agency: saleItem.student.account_agency,
            account_number: saleItem.student.account_number,
          },
          transaction: t,
        });
        emailData.payment_method = 'Boleto';
      }

      if (saleItem.payment_method === 'card') {
        await refundCard({
          saleItem,
          amount: paymentTransaction.price_total,
          reason: this.reason,
          transaction_uuid: costTransaction.uuid,
          role: 'student',
          transaction: t,
        });
        emailData.payment_method = 'Cartão';
      }
      await updateUsersBalance(saleItem, 'decrement', t);
      
      t.afterCommit(async () => {
        await new ProducerEmail(emailData).send();
      });
    });
    
    return 'Seu reembolso já foi solicitado.';
  }
};
