import { SQS as aws } from '../queues/aws.mjs';
import { findRoleTypeByKey } from '../types/rolesTypes.mjs';
import { date } from '../utils/date.mjs';
import { CalculateCommissionsTransactions } from './CalculateCommissionsTransactions.mjs';
import { Commission } from './Commission.mjs';
import { findStatus } from '../status/salesStatus.mjs';

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';
const calculateDateDiffInDays = (dateToDiff) => date().diff(dateToDiff, 'd');

export class SplitCommission {
  #TransactionsRepository;

  #BalanceHistoryRepository;

  #BalanceRepository;

  #SalesItemsRepository;

  #SalesItemsTransactionsRepository;

  #dbTransaction;

  #database;

  constructor(
    TransactionsRepository,
    BalanceHistoryRepository,
    BalanceRepository,
    SalesItemsRepository,
    SalesItemsTransactionsRepository,
    dbTransaction,
    database
  ) {
    this.#TransactionsRepository = TransactionsRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#BalanceRepository = BalanceRepository;
    this.#SalesItemsRepository = SalesItemsRepository;
    this.#SalesItemsTransactionsRepository = SalesItemsTransactionsRepository;
    this.#dbTransaction = dbTransaction;
    this.#database = database;
  }

  async execute({ id_user, transaction, first_charge = true, shipping_type, sale_item }) {
    console.log('saleItem => ', sale_item);

    try {
      const transactions = await CalculateCommissionsTransactions.execute({
        first_charge,
        sale_item,
        transaction,
        shipping_type,
        id_user,
      });

      for await (const transaction of transactions) {
        const dbTransaction = await this.#TransactionsRepository.create(
          transaction,
          this.#dbTransaction
        );
        await this.#SalesItemsTransactionsRepository.create(
          {
            id_sale_item: sale_item.id,
            id_transaction: dbTransaction.id,
          },
          this.#dbTransaction
        );
        this.#dbTransaction.afterCommit(async () => {
          if (calculateDateDiffInDays(dbTransaction.release_date) === 0) {
            await new Commission(
              this.#BalanceRepository,
              this.#BalanceHistoryRepository,
              this.#TransactionsRepository,
              this.#database
            ).pay({
              amount: dbTransaction.user_net_amount,
              id_user: dbTransaction.id_user,
              transaction_id: dbTransaction.id,
            });
          }

          if (dbTransaction.id_role === findRoleTypeByKey('producer').id) {
            await aws.add('referralCommission', {
              id_user: dbTransaction.id_user,
              amount: dbTransaction.user_net_amount,
              id_status: sale_item.id_status,
              id_sale_item: sale_item.id,
            });
          }
          if (sale_item.id_status === 2) {
            await aws.add('usersRevenue', {
              id_user: dbTransaction.id_user,
              amount: dbTransaction.user_net_amount,
              paid_at: date().now().utcOffset(-3).format(DATABASE_DATE_WITHOUT_TIME),
            });
          }
          try {
            await aws.add('sales-metrics-hourly', {
              id_user: dbTransaction.id_user,
              id_product: sale_item.id_product,
              amount: dbTransaction.user_net_amount,
              paid_at: sale_item.paid_at,
              created_at: sale_item.created_at,
              status: findStatus(sale_item.id_status).key,
              payment_method: sale_item.payment_method,
            });
          } catch (error) {
            console.log(error);
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
