import { Database } from './database/sequelize.mjs';
import {
  createCharge,
  createSaleItem,
  createSalesItemsTransactions,
  createStudentProducts,
  createTransaction,
  deleteCart,
} from './database/controllers/index.mjs';
import { SalesFees } from './useCases/SalesFees.mjs';
import * as uuid from 'uuid';
import {
  findRulesTypesByKey,
  findSaleItemsType,
  findTransactionTypeByKey,
} from './types/index.mjs';
import { SQS } from './queues/aws.mjs';
import {
  CostCentralRepository,
  SalesSettingsRepository,
  TransactionsRepository,
  BalanceHistoryRepository,
  BalancesRepository,
  SalesItemsRepository,
  SalesItemsTransactionsRepository,
} from './repositories/index.mjs';
import { Products } from './database/models/Products.mjs';
import { creditCardBrandParser } from './utils/card.mjs';
import { SplitCommission } from './useCases/SplitCommission.mjs';

const serializeExpirationDate = (expirationDate) => {
  const [month, year] = expirationDate.split('/');
  return `${month}/${2000 + Number(year)}`;
};

const cardDataToStore = ({ card_number, expiration_date }) => ({
  last_four: card_number.slice(12),
  brand: creditCardBrandParser(card_number),
  expiration_date: serializeExpirationDate(expiration_date),
});

const calculateRefund = (warranty) => {
  const w = new Date();
  w.setDate(w.getDate() + warranty);
  return w.toISOString();
};

export const handler = async (event) => {
  console.log(event);

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME } = process.env;

  let database;
  try {
    database = await new Database({
      database: MYSQL_DATABASE,
      host: MYSQL_HOST,
      password: MYSQL_PASSWORD,
      username: MYSQL_USERNAME,
      port: 3306,
      dialect: 'mysql',
      logging: console.log,
      dialectOptions: {
        decimalNumbers: true,
      },
    }).connect();
    const { Records } = event;
    console.time('performance');
    for await (const message of Records) {
      const {
        id_user,
        card,
        student_pays_interest,
        student,
        paymentData,
        paid_at,
        id_sale,
        itemsToCreate,
        id_affiliate,
        personalData,
        id_user_affiliate,
        discount,
        coupon_discount,
        shipping_type,
        id_offer,
      } = JSON.parse(message.body);

      const transactionsToCreate = await new SalesFees(
        CostCentralRepository,
        SalesSettingsRepository
      ).calculate({
        id_user,
        brand: card.brand,
        installments: card.installments,
        student_pays_interest,
        sales_items: itemsToCreate,
        discount,
        payment_method: 'card',
        coupon_discount,
      });

      const [costTransaction, ...transactions] = transactionsToCreate;
      const { status, cartao_status = null, cartao_status_details = null } = paymentData;

      let transactionsToSplit = [];

      await database.sequelize.transaction(async (dbTransaction) => {
        const charge = await createCharge(
          {
            id_user,
            id_student: student.id,
            id_status: status.charge,
            id_sale,
            psp_id: paymentData.id,
            price: costTransaction.price_total,
            payment_method: 'credit_card',
            installments: card.installments,
            paid_at,
          },
          dbTransaction
        );

        const mainTransaction = await createTransaction(
          {
            ...costTransaction,
            method: 'card',
            uuid: paymentData.transactionIdentifier,
            psp_id: paymentData.id,
            id_user,
            id_type: findTransactionTypeByKey('cost').id,
            id_status: status.transaction,
            id_charge: charge.id,
          },
          dbTransaction
        );

        let mainSaleItem;

        for await (const [index, transactionData] of transactions.entries()) {
          const itemToCreate = itemsToCreate[index];
          const product = await Products.findOne({
            raw: true,
            where: {
              id: itemToCreate.id_product,
            },
            attributes: ['uuid', 'name', 'warranty'],
          });
          const saleItem = await createSaleItem(
            {
              id_sale,
              id_product: itemToCreate.id_product,
              price: itemToCreate.price * (1 - discount / 100),
              is_upsell: false,
              id_status: status.sale,
              id_student: student.id,
              payment_method: 'card',
              type: findSaleItemsType(itemToCreate.type).id,
              credit_card: cardDataToStore(card),
              valid_refund_until: calculateRefund(product.warranty),
              id_affiliate,
              paid_at,
              src: personalData?.params?.src,
              sck: personalData?.params?.sck,
              utm_source: personalData?.params?.utm_source,
              utm_medium: personalData?.params?.utm_medium,
              utm_campaign: personalData?.params?.utm_campaign,
              utm_term: personalData?.params?.utm_term,
              quantity: itemToCreate.quantity,
              id_offer,
            },
            dbTransaction
          );

          if (index === 0) {
            mainSaleItem = saleItem;
          }

          const paymentTransaction = await createTransaction(
            {
              ...transactionData,
              method: 'card',
              uuid: uuid.v4(),
              psp_id: paymentData.id,
              id_user,
              id_type: findTransactionTypeByKey('payment').id,
              id_status: status.transaction,
              id_sale_item: saleItem.id,
              id_charge: charge.id,
            },
            dbTransaction
          );

          transactionsToSplit.push({ transaction: paymentTransaction, saleItem });

          await createSalesItemsTransactions(
            {
              id_transaction: mainTransaction.id,
              id_sale_item: saleItem.id,
            },
            dbTransaction
          );

          await createSalesItemsTransactions(
            {
              id_transaction: paymentTransaction.id,
              id_sale_item: saleItem.id,
            },
            dbTransaction
          );

          if (status.label === 'paid') {
            await createStudentProducts(
              {
                id_student: student.id,
                id_product: itemToCreate.id_product,
                id_classroom: itemToCreate.id_classroom ? itemToCreate.id_classroom : null,
                has_access: true,
              },
              dbTransaction
            );

            dbTransaction.afterCommit(async () => {
              await SQS.add('webhookEvent', {
                id_product: itemToCreate.id_product,
                id_sale_item: saleItem.id,
                id_user: id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              });

              await SQS.add('studentApprovedPaymentEmails', {
                product,
                currentStudent: student,
                saleItem,
                costTransaction,
              });

              if (id_affiliate) {
                await SQS.add('webhookEvent', {
                  id_product: itemToCreate.id_product,
                  id_sale_item: saleItem.id,
                  id_user: id_user_affiliate,
                  id_event: findRulesTypesByKey('approved-payment').id,
                });
              }

              await SQS.add('webhookEvent', {
                id_product: itemToCreate.id_product,
                id_sale_item: saleItem.id,
                id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              });

              await SQS.add('integrations', {
                id_product: itemToCreate.id_product,
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
                        uuid: product.uuid,
                        product_name: product.name,
                        quantity: 1,
                        price: costTransaction.price_total,
                      },
                    ],
                  },
                },
              });
              await SQS.add('blingShipping', {
                sale_id: id_sale,
                is_upsell: false,
              });
            });
          } else {
            dbTransaction.afterCommit(async () => {
              if (id_affiliate) {
                await SQS.add('webhookEvent', {
                  id_product: itemToCreate.id_product,
                  id_sale_item: saleItem.id,
                  id_user: id_user_affiliate,
                  id_event: findRulesTypesByKey('refused-payment').id,
                });
              }
              await SQS.add('webhookEvent', {
                id_product: itemToCreate.id_product,
                id_sale_item: saleItem.id,
                id_user,
                id_event: findRulesTypesByKey('refused-payment').id,
              });
              await SQS.add('integrations', {
                id_product: itemToCreate.id_product,
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
                        uuid: product.uuid,
                        product_name: product.name,
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

        if (status.label === 'paid' && personalData.id_cart) {
          await deleteCart({ id: personalData.id_cart }, true, dbTransaction);
        }

        return {
          saleItem: mainSaleItem,
          status: paymentData.status,
          hash: paymentData.hash,
          cartao_status,
          cartao_status_details,
        };
      });

      for await (const { transaction, saleItem } of transactionsToSplit) {
        await database.sequelize.transaction(async (dbTransaction) => {
          await new SplitCommission(
            TransactionsRepository,
            BalanceHistoryRepository,
            BalancesRepository,
            SalesItemsRepository,
            SalesItemsTransactionsRepository,
            dbTransaction,
            database
          ).execute({
            sale_item: saleItem,
            transaction,
            first_charge: true,
            shipping_type,
            id_user,
          });

          dbTransaction.afterCommit(async () => {
            await SQS.add('generateNotifications', {
              sale_item_id: saleItem.id,
            });
          });
        });
      }
    }

    await database.closeConnection();

    console.log('records length -> ', Records.length);
    console.timeEnd('performance');
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  }

  return {
    statusCode: 200,
    body: JSON.stringify('post sale executed successfully'),
  };
};
