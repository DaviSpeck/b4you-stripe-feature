import { Commissions } from '../database/models/Commissions.mjs';
import aws from '../queues/aws.mjs';
import { findStatus } from '../status/salesStatus.mjs';
import { findRulesTypesByKey } from '../types/integrationRulesTypes.mjs';
import { findRoleTypeByKey } from '../types/rolesTypes.mjs';
import { date } from '../utils/date.mjs';
import { CalculateCommissions } from './CalculateCommissionsTransactions.mjs';
import { Commission } from './Commission.mjs';

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';
const calculateDateDiffInDays = (dateToDiff) => date().diff(dateToDiff, 'd');

export class SplitCommission {
  #BalanceRepository;

  #SalesItemsRepository;

  #dbTransaction;

  #database;

  constructor(BalanceRepository, SalesItemsRepository, dbTransaction, database) {
    this.#BalanceRepository = BalanceRepository;
    this.#SalesItemsRepository = SalesItemsRepository;
    this.#dbTransaction = dbTransaction;
    this.#database = database;
  }

  async execute({ sale_item_id, first_charge = true, shipping_type }) {
    const sale_item = await this.#SalesItemsRepository.findToSplit(
      {
        id: +sale_item_id,
      },
      this.#dbTransaction
    );

    console.log('saleItem => ', sale_item);

    const { affiliate } = sale_item;

    try {
      const transactions = await CalculateCommissions.execute({
        affiliate,
        first_charge,
        sale_item,
        shipping_type,
      });

      for await (const transaction of transactions) {
        const commission = await Commissions.create(transaction, {
          transaction: this.#dbTransaction,
        });
        this.#dbTransaction.afterCommit(async () => {
          if (sale_item.id_status === 2 && calculateDateDiffInDays(commission.release_date) === 0) {
            await new Commission(this.#BalanceRepository, this.#database).pay({
              amount: commission.amount,
              id_user: commission.id_user,
              id: commission.id,
            });
          }

          if (
            [findRoleTypeByKey('producer').id, findRoleTypeByKey('affiliate').id].includes(
              commission.id_role
            )
          ) {
            await aws.add('referralCommission', {
              id_user: commission.id_user,
              amount: sale_item.fee_total,
              id_status: sale_item.id_status,
              id_sale_item: sale_item.id,
              id_product: sale_item.id_product,
            });
          }
          if (sale_item.id_status === 2) {
            await aws.add('usersRevenue', {
              id_user: commission.id_user,
              amount: commission.amount,
              paid_at: date().now().utcOffset(-3).format(DATABASE_DATE_WITHOUT_TIME),
            });
          }

          try {
            await aws.add('sales-metrics-hourly', {
              id_user: commission.id_user,
              id_product: sale_item.id_product,
              amount: commission.amount,
              paid_at: sale_item.paid_at,
              created_at: sale_item.created_at,
              statusAfter: findStatus(sale_item.id_status).key,
              statusBefore: null,
              payment_method: sale_item.payment_method,
            });
          } catch (error) {
            console.log(error);
          }

          try {
            if (
              commission.id_role === findRoleTypeByKey('supplier').id &&
              sale_item.id_status === 2 &&
              sale_item.payment_method === 'card'
            ) {
              console.log('caiuu no event');
              await aws.add('webhookEvent', {
                id_product: commission.id_product,
                id_sale_item: commission.id_sale_item,
                id_user: commission.id_user,
                id_event: findRulesTypesByKey('approved-payment').id,
              });
            }
          } catch (error) {
            console.log('error on call aws queue supplier webhook', error);
          }
        });
      }
      return transactions;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
