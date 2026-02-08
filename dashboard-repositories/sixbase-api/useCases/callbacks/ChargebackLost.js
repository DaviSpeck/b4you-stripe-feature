const {
  findTransactionChargeback,
} = require('../../database/controllers/transactions');
const ApiError = require('../../error/ApiError');
const models = require('../../database/models/index');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
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

module.exports = class ChargebackLost {
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
          { id_status: findSalesStatusByKey('chargeback').id },
          {
            id: saleItem.id,
          },
          t,
        );
        await updateChargeTransaction(
          { id_status: findChargeStatusByKey('chargeback').id },
          {
            id: costTransaction.id_charge,
          },
          t,
        );

        if (saleItem.product.payment_type === 'subscription') {
          await updateSubscription(
            {
              id_product: saleItem.id_product,
              id_student: saleItem.id_student,
              id_sale: saleItem.id_sale,
            },
            {
              id_status: findSubscriptionStatusByKey('chargeback').id,
              active: false,
            },
            t,
          );
        }
      }
    });
  }
};
