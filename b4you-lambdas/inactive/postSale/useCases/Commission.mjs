import { date } from '../utils/date.mjs';
import { findTransactionStatusByKey } from '../status/transactionStatus.mjs';
import { UpdateBalance } from './UpdateBalance.mjs';

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';

export class Commission {
  #BalanceRepository;

  #BalanceHistoryRepository;

  #TransactionsRepository;

  #database;

  constructor(BalanceRepository, BalanceHistoryRepository, TransactionsRepository, database) {
    this.#BalanceRepository = BalanceRepository;
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#TransactionsRepository = TransactionsRepository;
    this.#database = database;
  }

  async pay({ id_user, amount, transaction_id }) {
    const data = {
      id_user,
      amount,
      id_transaction: transaction_id,
      operation: 'increment',
    };
    console.log(`PAYING COMMISSION - DATA ${JSON.stringify(data)}`);
    await this.#database.sequelize.transaction(async (t) => {
      await new UpdateBalance(this.#BalanceRepository, this.#BalanceHistoryRepository, t).execute(
        data
      );
      await this.#TransactionsRepository.update(
        { id: transaction_id },
        {
          released: true,
          id_status: findTransactionStatusByKey('paid').id,
          release_date: date().now().format(DATABASE_DATE_WITHOUT_TIME),
        },
        t
      );

      console.log(`PAYING COMMISSION - COMPLETE`);
    });
  }
}
