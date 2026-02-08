const Transactions = require('../../database/models/Transactions');
const ApiError = require('../../error/ApiError');
const Sales_items = require('../../database/models/Sales_items');
const Charges = require('../../database/models/Charges');
const dateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../types/dateTypes');
const logger = require('../../utils/logger');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const { findSalesStatusByKey } = require('../../status/salesStatus');

module.exports = class ChargebackWin {
  constructor({ transaction_id }) {
    this.transaction_id = transaction_id;
  }

  async execute() {
    const transaction = await Transactions.findOne({
      nest: true,
      where: {
        uuid: this.transaction_id,
      },
      include: [
        {
          association: 'sales_items',
          attributes: ['id'],
          include: [
            {
              association: 'transactions',
              attributes: ['id', 'id_type', 'id_charge'],
            },
            { association: 'product', attributes: ['payment_type'] },
          ],
        },
      ],
    });
    if (!transaction) throw ApiError.badRequest('Transaction not found 01');
    const { sales_items } = transaction;
    for await (const saleItem of sales_items) {
      try {
        const { id, transactions } = saleItem;
        await Sales_items.update(
          { id_status: findSalesStatusByKey('paid').id },
          { where: { id } },
        );

        const commissions = transactions.filter((t) => t.id_type === 3);
        const otherTransactions = transactions.filter((t) => t.id_type !== 3);
        const costT = otherTransactions.find((t) => t.id_type === 7);
        await Transactions.update(
          {
            released: false,
            id_status: 1,
            release_date: dateHelper()
              .add(1, 'day')
              .format(DATABASE_DATE_WITHOUT_TIME),
          },
          {
            where: {
              id: commissions.map((c) => c.id),
            },
          },
        );
        await Transactions.update(
          { id_status: 2 },
          {
            where: {
              id: otherTransactions.map((t) => t.id),
            },
          },
        );
        await Charges.update(
          { id_status: 2 },
          { where: { id: costT.id_charge } },
        );
        if (saleItem.product.payment_type === 'subscription') {
          await updateSubscription(
            {
              id_product: saleItem.id_product,
              id_student: saleItem.id_student,
              id_sale: saleItem.id_sale,
            },
            {
              id_status: findSubscriptionStatusByKey('active').id,
              active: true,
            },
          );
        }
      } catch (error) {
        logger.error(error);
      }
    }
  }
};
