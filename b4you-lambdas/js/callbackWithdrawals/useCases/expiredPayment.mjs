import {
  updateTransaction,
  findOneTransactionWithSaleItemsAndCommissions,
} from '../database/controllers/transactions.mjs';
import { updateSaleItem } from '../database/controllers/sales_items.mjs';
import { findTransactionStatusByKey } from '../status/transactionStatus.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findChargeStatusByKey } from '../status/chargesStatus.mjs';
import { findTransactionTypeByKey } from '../types/transactionTypes.mjs';
import { updateCharge } from '../database/controllers/charges.mjs';
import { updateSubscription } from '../database/controllers/subscriptions.mjs';
import { findSubscriptionStatusByKey } from '../status/subscriptionsStatus.mjs';
import { date as DateHelper } from '../utils/date.mjs';
import { findAllCharges } from '../database/controllers/charges.mjs';
import SQS from '../queues/aws.mjs';

export class ExpiredPayment {
  constructor({ transaction_uuid }) {
    this.transaction_uuid = transaction_uuid;
  }
  async execute() {
    const promisesSaleItem = [];
    const promisesTransactions = [];
    const promisesSubscriptions = [];
    const transaction = await findOneTransactionWithSaleItemsAndCommissions({
      uuid: this.transaction_uuid,
      id_status: findTransactionStatusByKey('pending').id,
      id_type: findTransactionTypeByKey('cost').id,
    });
    if (!transaction) return null;
    const { sales_items } = transaction;

    await updateTransaction(
      { id: transaction.id },
      { id_status: findTransactionStatusByKey('expired').id }
    );

    await updateCharge(transaction.id_charge, {
      id_status: findChargeStatusByKey('expired').id,
    });

    for await (const { id, transactions, subscription } of sales_items) {
      let paidCharges = [];
      if (subscription) {
        paidCharges = await findAllCharges({
          id_subscription: subscription.id,
          id_status: findChargeStatusByKey('paid').id,
        });
      }

      const otherTransactions = transactions.filter(
        ({ id_type }) => id_type !== findTransactionTypeByKey('cost').id
      );
      promisesTransactions.push(
        updateTransaction(
          {
            id: otherTransactions.map((t) => t.id),
          },
          {
            id_status: findTransactionStatusByKey('expired').id,
          }
        )
      );

      if (paidCharges.length === 0) {
        promisesSaleItem.push(
          updateSaleItem(
            {
              id_status: findSalesStatusByKey('expired').id,
            },
            { id }
          )
        );

        if (subscription) {
          promisesSubscriptions.push(
            updateSubscription(
              { id: subscription.id },
              {
                active: false,
                id_status: findSubscriptionStatusByKey('canceled').id,
                canceled_at: DateHelper().now(),
              }
            )
          );
        }
      }
    }
    await SQS.add('generateNotifications', {
      transaction_uuid: this.transaction_uuid,
      type: 'expired',
      id_status: findTransactionStatusByKey('expired').id,
    });
    await Promise.all(promisesSaleItem);
    await Promise.all(promisesTransactions);
    await Promise.all(promisesSubscriptions);

    return transaction;
  }
}
