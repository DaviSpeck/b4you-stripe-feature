import { Transactions } from '../database/models/Transactions.mjs';
import { Sales_items_transactions } from '../database/models/Sales_items_transactions.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Student_products } from '../database/models/StudentProducts.mjs';
import { findSaleItemsType } from '../types/salesTypes.mjs';
import { getCreditCardNameByNumber } from 'creditcard.js';
import { date } from '../utils/date.mjs';
import { findTransactionTypeByKey } from '../types/transactionTypes.mjs';
import { findTransactionStatusByKey } from '../status/transactionStatus.mjs';
import { findRulesTypesByKey } from '../types/rulesTypes.mjs';
import { v4 } from 'uuid';

const uuid = {
  v4: () => v4(),
};

const calculateRefund = (warranty) => date().add(warranty, 'days');

const serializeExpirationDate = (expirationDate) => {
  const [month, year] = expirationDate.split('/');
  return `${month}/${2000 + Number(year)}`;
};

const creditCardBrandParser = (cardNumber) => {
  const brand = getCreditCardNameByNumber(cardNumber);
  const data = {
    'American Express': 'amex',
    'Aura': 'aura',
    'Diners': 'diners',
    'Discover': 'discover',
    'Elo': 'elo',
    'Hipercard': 'hiper',
    'Mastercard': 'master',
    'Visa': 'visa',
  };
  return data[brand];
};

const cardDataToStore = ({ card_number, expiration_date }) => ({
  last_four: card_number.slice(12),
  brand: creditCardBrandParser(card_number),
  expiration_date: serializeExpirationDate(expiration_date),
});

const createTransaction = async (data, t = null) => {
  const transaction = await Transactions.create(data, {
    transaction: t,
  });

  return transaction.toJSON();
};

const createSaleItem = async (data, t = null) => {
  const saleItem = await Sales_items.create(data, {
    transaction: t,
  });

  return saleItem.toJSON();
};

const createSalesItemsTransactions = async (data, t = null) => {
  const saleItemTransaction = await Sales_items_transactions.create(data, {
    transaction: t,
  });

  return saleItemTransaction.toJSON();
};

const createStudentProducts = async (data, t = null) => {
  const studentProducts = await Student_products.create(data, {
    transaction: t,
  });

  return studentProducts.toJSON();
};

export class PostCardSale {
  #SQS;

  #dbTransaction;

  constructor(SQS, dbTransaction) {
    this.#SQS = SQS;
    this.#dbTransaction = dbTransaction;
  }

  async execute({
    transactions,
    card,
    discount,
    paid_at,
    personalData,
    itemsToCreate,
    id_sale,
    status,
    student,
    warranty,
    id_charge,
    id_user,
    psp_id,
    id_main_tranaction,
    costTransaction,
    affiliate,
  }) {
    const id_affiliate = affiliate ? affiliate.id : null;
    for await (const [index, transactionData] of transactions.entries()) {
      const itemToCreate = itemsToCreate[index];
      const saleItem = await createSaleItem(
        {
          id_sale,
          id_product: itemToCreate.product.id,
          price: itemToCreate.price * (1 - discount / 100),
          is_upsell: false,
          id_status: status.sale,
          id_student: student.id,
          payment_method: 'card',
          type: findSaleItemsType(itemToCreate.type).id,
          credit_card: cardDataToStore(card),
          valid_refund_until: calculateRefund(warranty),
          id_affiliate,
          paid_at,
          src: personalData?.params?.src,
          sck: personalData?.params?.sck,
          utm_source: personalData?.params?.utm_source,
          utm_medium: personalData?.params?.utm_medium,
          utm_campaign: personalData?.params?.utm_campaign,
          utm_term: personalData?.params?.utm_term,
          quantity: itemToCreate.quantity,
        },
        this.#dbTransaction
      );

      const paymentTransaction = await createTransaction(
        {
          ...transactionData,
          method: 'card',
          uuid: uuid.v4(),
          psp_id,
          id_user,
          id_type: findTransactionTypeByKey('payment').id,
          id_status: status.transaction,
          id_sale_item: saleItem.id,
          id_charge,
        },
        this.#dbTransaction
      );

      await createSalesItemsTransactions(
        {
          id_transaction: id_main_tranaction,
          id_sale_item: saleItem.id,
        },
        this.#dbTransaction
      );

      await createSalesItemsTransactions(
        {
          id_transaction: paymentTransaction.id,
          id_sale_item: saleItem.id,
        },
        this.#dbTransaction
      );

      this.#dbTransaction.afterCommit(async () => {
        await this.#SQS.add('splitCommissions', {
          sale_id: saleItem.id,
          transaction_id: paymentTransaction.id,
        });
      });

      if (status.label === 'paid') {
        await createStudentProducts(
          {
            id_student: student.id,
            id_product: itemToCreate.product.id,
            id_classroom: itemToCreate.id_classroom ? itemToCreate.id_classroom : null,
            has_access: true,
          },
          this.#dbTransaction
        );

        this.#dbTransaction.afterCommit(async () => {
          await this.#SQS.add('webhookEvent', {
            id_product: itemToCreate.product.id,
            id_sale_item: saleItem.id,
            id_user: itemToCreate.product.id_user,
            id_event: findRulesTypesByKey('approved-payment').id,
          });

          await this.#SQS.add('studentApprovedPaymentEmails', {
            product: itemToCreate.product,
            currentStudent: student,
            saleItem,
            costTransaction,
          });

          if (affiliate) {
            await this.#SQS.add('webhookEvent', {
              id_product: itemToCreate.product.id,
              id_sale_item: saleItem.id,
              id_user: affiliate.id_user,
              id_event: findRulesTypesByKey('approved-payment').id,
            });
          }

          await this.#SQS.add('webhookEvent', {
            id_product: itemToCreate.product.id,
            id_sale_item: saleItem.id,
            id_user: itemToCreate.product.id_user,
            id_event: findRulesTypesByKey('approved-payment').id,
          });

          await this.#SQS.add('approvedPaymentNotifications', {
            saleItemUuid: saleItem.uuid,
          });

          await this.#SQS.add('generateNotifications', {
            transaction_uuid: paymentData.transactionIdentifier,
            type: 'paid',
            id_status: findTransactionStatusByKey('paid').id,
          });

          await this.#SQS.add('integrations', {
            id_product: itemToCreate.product.id,
            eventName: 'approvedPayment',
            data: {
              payment_method: 'card',
              email: student.email,
              full_name: student.full_name,
              phone: student.whatsapp,
              sale: {
                amount: costTransaction.price_total,
                created_at: saleItem.created_at,
                document_number: student.document_number,
                paid_at: saleItem.paid_at,
                sale_uuid: saleItem.uuid,
                products: [
                  {
                    uuid: itemToCreate.product.uuid,
                    product_name: itemToCreate.product.name,
                    quantity: 1,
                    price: costTransaction.price_total,
                  },
                ],
              },
            },
          });
          await this.#SQS.add('blingShipping', {
            sale_id: sale.id,
          });
        });
      } else {
        this.#dbTransaction.afterCommit(async () => {
          if (affiliate) {
            await this.#SQS.add('webhookEvent', {
              id_product: itemToCreate.product.id,
              id_sale_item: saleItem.id,
              id_user: affiliate.id_user,
              id_event: findRulesTypesByKey('refused-payment').id,
            });
          }
          await this.#SQS.add('webhookEvent', {
            id_product: itemToCreate.product.id,
            id_sale_item: saleItem.id,
            id_user: itemToCreate.product.id_user,
            id_event: findRulesTypesByKey('refused-payment').id,
          });
          await this.#SQS.add('integrations', {
            id_product: itemToCreate.product.id,
            eventName: 'refusedPayment',
            data: {
              payment_method: 'card',
              email: student.email,
              full_name: student.full_name,
              phone: student.whatsapp,
              sale: {
                amount: costTransaction.price_total,
                created_at: saleItem.created_at,
                document_number: student.document_number,
                paid_at: saleItem.paid_at,
                sale_uuid: saleItem.uuid,
                products: [
                  {
                    uuid: itemToCreate.product.uuid,
                    product_name: itemToCreate.product.name,
                    quantity: 1,
                    price: costTransaction.price_total,
                  },
                ],
              },
            },
          });
        });
      }
    }
  }
}
