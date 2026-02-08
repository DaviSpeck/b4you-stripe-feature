import SQS from '../queues/aws.mjs';

import { date as DateHelper } from '../utils/date.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { findChargeStatusByKey } from '../status/chargesStatus.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { findSubscriptionStatusByKey } from '../status/subscriptionsStatus.mjs';
import { findTransactionStatus } from '../status/transactionStatus.mjs';
import { findRulesTypesByKey } from '../types/integrationRulesTypes.mjs';
import { findTransactionTypeByKey } from '../types/transactionTypes.mjs';
import { deleteCart } from '../database/controllers/cart.mjs';
import { findOneAffiliate } from '../database/controllers/affiliates.mjs';
import { updateSaleItem } from '../database/controllers/sales_items.mjs';
import { updateStudentProducts } from '../database/controllers/student_products.mjs';
import { updateSubscription } from '../database/controllers/subscriptions.mjs';
import {
  findOneTransactionWithSaleItemsAndCommissions,
  updateTransaction,
} from '../database/controllers/transactions.mjs';
import {
  findOneCouponSale,
  updateCouponSale,
} from '../database/controllers/coupons_sales.mjs';
import {
  updateCharge,
  findAllCharges,
} from '../database/controllers/charges.mjs';

export class PaidPayment {
  constructor({ transaction_uuid }) {
    this.transaction_uuid = transaction_uuid;
  }

  async execute() {
    const promisesSaleItem = [];
    const promisesSplits = [];
    const studentAccess = [];
    const promisesTransactions = [];
    const queuePromises = [];
    const subscriptionPromises = [];
    const transaction = await findOneTransactionWithSaleItemsAndCommissions({
      uuid: this.transaction_uuid,
      id_status: [
        findTransactionStatus('Pendente').id,
        findTransactionStatus('Expirado').id,
      ],
      id_type: findTransactionTypeByKey('cost').id,
    });
    if (!transaction) return null;
    const { sales_items } = transaction;
    const [mainProductSaleItem] = sales_items;

    const { student, product } = mainProductSaleItem;
    const paid_at = DateHelper().now();
    await updateTransaction(
      { id: transaction.id },
      { id_status: findTransactionStatus('Processado').id }
    );

    await updateCharge(transaction.id_charge, {
      id_status: findChargeStatusByKey('paid').id,
      paid_at,
    });
    const coupon = await findOneCouponSale({
      id_sale: sales_items[0].id_sale,
    });

    if (coupon) {
      await updateCouponSale({ id: coupon.id }, { paid: true });
    }
    let renew = false;

    for await (const {
      id,
      transactions,
      uuid,
      id_product,
      product: saleProduct,
      payment_method,
      created_at,
      subscription,
      id_affiliate,
    } of sales_items) {
      let paidCharges = [];
      const commissionTransactions = transactions.filter(
        ({ id_type }) => id_type === findTransactionTypeByKey('commission').id
      );

      const paymentTransactions = transactions.filter(
        ({ id_type }) => id_type === findTransactionTypeByKey('payment').id
      );

      promisesTransactions.push(
        updateTransaction(
          {
            id: paymentTransactions.map((t) => t.id),
          },
          {
            id_status: findTransactionStatus('Processado').id,
          }
        )
      );

      await SQS.add('confirmSplits', {
        transactions_ids: commissionTransactions.map(
          (commission) => commission.id
        ),
        paid_at,
        payment_method: transaction.method,
      });

      if (subscription) {
        paidCharges = await findAllCharges({
          id_subscription: subscription.id,
          id_status: findChargeStatusByKey('paid').id,
        });

        const {
          next_charge,
          plan: { frequency_quantity, payment_frequency },
        } = subscription;
        subscriptionPromises.push(
          updateSubscription(
            { id: subscription.id },
            {
              last_notify: null,
              renew: false,
              attemp_count: 0,
              next_attempt: null,
              id_status: findSubscriptionStatusByKey('active').id,
              next_charge:
                paidCharges.length === 1
                  ? next_charge
                  : DateHelper(next_charge).add(
                      frequency_quantity,
                      payment_frequency
                    ),
            }
          )
        );
      }

      if (paidCharges.length <= 1) {
        promisesSaleItem.push(
          updateSaleItem(
            {
              valid_refund_until: DateHelper().add(product.warranty, 'days'),
              id_status: findSalesStatusByKey('paid').id,
              paid_at,
            },
            { id }
          )
        );

        queuePromises.push(
          SQS.add('approvedPaymentNotifications', {
            saleItemUuid: uuid,
          })
        );

        await SQS.add('blingShipping', {
          sale_id: sales_items[0].id_sale,
        });

        if (id_affiliate) {
          const affiliate = await findOneAffiliate({ id: id_affiliate });
          if (affiliate)
            queuePromises.push(
              SQS.add('webhookEvent', {
                id_product,
                id_sale_item: id,
                id_user: affiliate.id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              })
            );
        }

        queuePromises.push(
          SQS.add('webhookEvent', {
            id_product,
            id_sale_item: id,
            id_user: saleProduct.producer.id,
            id_event: findRulesTypesByKey('approved-payment').id,
          })
        );

        const [paymentTransaction] = paymentTransactions.sort(
          (a, b) => b.id - a.id
        );

        queuePromises.push(
          SQS.add('integrations', {
            id_product,
            eventName: 'approvedPayment',
            data: {
              payment_method,
              email: student.email,
              full_name: student.full_name,
              phone: student.whatsapp,
              sale: {
                amount: paymentTransaction.price_total,
                created_at,
                document_number: student.document_number,
                paid_at,
                sale_uuid: uuid,
                products: [
                  {
                    uuid: product.uuid,
                    product_name: saleProduct.name,
                    quantity: 1,
                    price: paymentTransaction.price_total,
                  },
                ],
              },
            },
          })
        );
      } else {
        renew = true;
        queuePromises.push(
          SQS.add('webhookEvent', {
            id_product: subscription.id_product,
            id_sale_item: subscription.id_sale_item,
            id_user: subscription.id_user,
            id_event: findRulesTypesByKey('renewed-subscription').id,
          })
        );
        queuePromises.push(
          SQS.add('integrations', {
            id_product: subscription.id_product,
            eventName: 'renewedSubscription',
            data: {
              email: student.email,
              full_name: capitalizeName(student.full_name),
              phone: student.whatsapp,
              sale_uuid: uuid,
            },
          })
        );
      }

      studentAccess.push(
        updateStudentProducts(
          {
            id_student: student.id,
            id_product,
          },
          { has_access: true }
        )
      );
    }

    await Promise.all(studentAccess);
    await Promise.all(promisesSaleItem);
    await Promise.all(promisesSplits);
    await Promise.all(queuePromises);
    await Promise.all(subscriptionPromises);

    await Promise.all(promisesTransactions);

    await SQS.add('studentApprovedPaymentEmails', {
      costTransaction: transaction,
      currentStudent: student,
      product,
      saleItem: mainProductSaleItem,
      renew,
    });

    await deleteCart(
      { email: student.email, id_sale_item: mainProductSaleItem.id },
      true
    );

    return transaction;
  }
}
