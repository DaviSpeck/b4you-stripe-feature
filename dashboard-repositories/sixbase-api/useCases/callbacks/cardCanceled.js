const {
  updateTransaction,
  findOneTransactionWithSaleItemsAndCommissions,
} = require('../../database/controllers/transactions');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const { updateCharge } = require('../../database/controllers/charges');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const {
  deleteStudentProduct,
} = require('../../database/controllers/student_products');
const { refundCommissionsChargeback } = require('../refunds/common');
const models = require('../../database/models/index');

module.exports = class CardCanceled {
  constructor(transaction_id) {
    this.transaction_id = transaction_id;
  }

  async execute() {
    const transaction = await findOneTransactionWithSaleItemsAndCommissions({
      uuid: this.transaction_id,
      id_status: findTransactionStatusByKey('paid').id,
      id_type: findTransactionTypeByKey('cost').id,
    });
    if (!transaction) return null;
    const { sales_items } = transaction;
    const [mainProductSaleItem] = sales_items;
    const { student, product } = mainProductSaleItem;
    
    await models.sequelize.transaction(async (t) => {
      if (sales_items[0].id_status === findSalesStatusByKey('paid').id) {
        await updateTransaction(
          { psp_id: transaction.psp_id },
          {
            id_status: findTransactionStatusByKey('denied').id,
            release_date: null,
          },
          t,
        );
        await updateCharge(
          transaction.id_charge,
          {
            id_status: findChargeStatusByKey('refused').id,
          },
          t,
        );
        await deleteStudentProduct(
          {
            id_student: student.id,
            id_product: product.id,
          },
          t,
        );
        for await (const { id } of sales_items) {
          await updateSaleItem(
            {
              id_status: findSalesStatusByKey('denied').id,
            },
            { id },
            t,
          );
        }
      }
      await refundCommissionsChargeback({
        transactions: transaction.sales_items[0].transactions,
        payment_type: transaction.sales_items[0].product.payment_type,
        sale_item: transaction.sales_items[0],
        type: 'denied',
        transaction: t,
      });
    });

    return transaction;
  }
};
