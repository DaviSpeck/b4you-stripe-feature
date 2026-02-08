const {
  findTransactionChargeback,
} = require('../../database/controllers/transactions');
const ApiError = require('../../error/ApiError');
const models = require('../../database/models/index');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const {
  deleteStudentProduct,
} = require('../../database/controllers/student_products');
const {
  updateChargeTransaction,
} = require('../../database/controllers/charges');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const { refundCommissionsChargeback } = require('../refunds/common');
const ReferralCommissions = require('../../database/models/ReferralCommissions');
const ReferralBalance = require('../../database/models/ReferralBalance');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionStatus');

module.exports = class Chargebacks {
  constructor({ transaction_id }) {
    this.transaction_id = transaction_id;
  }

  async execute() {
    const transaction = await findTransactionChargeback({
      uuid: this.transaction_id,
    });
    if (!transaction) throw ApiError.badRequest('Transaction not found 01');
    await models.sequelize.transaction(async (t) => {
      for await (const saleItem of transaction.sales_items) {
        const [costTransaction] = saleItem.transactions
          .filter((tr) => tr.id_type === findTransactionTypeByKey('cost').id)
          .sort((a, b) => b.id - a.id);
        await updateSaleItem(
          { id_status: findSalesStatusByKey('chargeback_dispute').id },
          {
            id: saleItem.id,
          },
          t,
        );
        await updateChargeTransaction(
          { id_status: findChargeStatusByKey('chargeback_dispute').id },
          {
            id: costTransaction.id_charge,
          },
          t,
        );
        await deleteStudentProduct(
          {
            id_student: saleItem.id_student,
            id_product: saleItem.id_product,
          },
          t,
        );
        const referralCommission = await ReferralCommissions.findOne({
          raw: true,
          where: { id_sale_item: saleItem.id },
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
            {
              id_status: findReferralCommissionStatus('chargeback_dispute').id,
            },
            { where: { id: referralCommission.id }, transaction: t },
          );
        }

        await refundCommissionsChargeback({
          transactions: saleItem.transactions,
          payment_type: saleItem.product.payment_type,
          sale_item: saleItem,
          type: 'chargeback_dispute',
          transaction: t,
        });

        if (saleItem.product.payment_type === 'subscription') {
          await updateSubscription(
            {
              id_product: saleItem.id_product,
              id_student: saleItem.id_student,
              id_sale: saleItem.id_sale,
            },
            {
              id_status: findSubscriptionStatusByKey('chargeback_dispute').id,
              active: false,
            },
            t,
          );
        }
      }
    });
  }
};
